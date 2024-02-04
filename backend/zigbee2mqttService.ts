// SPDX-License-Identifier: GPL-3.0-or-later

import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { logger } from "./logger";
import { Device, Group } from "./types/zigbee_types";
import { elementDiff, getByPath, quoteList } from "./utils";
import { Feature } from "./types/zigbee_features";

const SUCCESS: OperationStatus = { success: true };

interface OperationStatusSuccess {
  success: true;
}

interface OperationStatusFailure {
  success: false;
  error: string | Error;
}

type OperationStatus = OperationStatusSuccess | OperationStatusFailure;

type ExposeUpdater = (
  device: string,
  fieldName: string,
  fieldValue: any,
) => void;

class MqttDevice {
  device: Device;
  #updater: ExposeUpdater;

  constructor(device: Device, updater: ExposeUpdater) {
    this.device = device;
    this.#updater = updater;
  }

  getValue(expose: string): any {
    // could be any type, number, bool, etc
  }

  setValue(expose: string, value: any): OperationStatus {
    this.#updater(this.device.friendly_name, expose, value);
    return SUCCESS;
  }
}

function recurseFeatures(
  features: Feature[],
  handler: (feature: Feature, path: string[]) => void,
  basePath: string[] = [],
) {
  const path = [...basePath];
  for (const feature of features) {
    if (feature.type === "composite") {
      recurseFeatures(feature.features, handler, [
        ...basePath,
        feature.property,
      ]);
    } else {
      handler(feature, path);
    }
  }
}

// TODO: Proper typing
function buildGetter(features: Feature[]): Record<string, any> {
  const getterObject: Record<string, any> = {};
  for (const feature of features) {
    if (feature.type === "composite") {
      getterObject[feature.property] = {
        ...getterObject[feature.property],
        ...buildGetter(feature.features),
      };
    } else {
      getterObject[feature.property ?? feature.name] = "";
    }
  }
  return getterObject;
}

function featuresFor(device: Device): Feature[] {
  if (!device.definition) return [];
  const features = device.definition.exposes.flatMap((expose) => {
    if (expose.features) return expose.features;
    return [];
  });
  return features;
}

export class Zigbee2MqttService {
  #client: MqttClient;
  #mqttClientConnected: Promise<OperationStatus>;
  #baseTopic: string;
  #devices: Record<string, Device> = {};
  #devicesData: Record<string, any> = {};
  #groups: Record<string, Group> = {};

  constructor(
    endpoint: string,
    options: IClientOptions,
    baseTopic: string = "zigbee2mqtt",
  ) {
    this.#baseTopic = baseTopic;
    this.#client = mqtt.connect(endpoint, options);

    this.#mqttClientConnected = new Promise((resolve) => {
      this.#client.once("connect", () => {
        this.#client.on("message", (topic, payload) =>
          this.#handleMessage(topic, payload),
        );

        this.#client.subscribe([
          `${baseTopic}/bridge/devices`,
          `${baseTopic}/bridge/groups`,
        ]);

        logger("info", "MQTT", `Successfully connected to ${endpoint}`);
        resolve(SUCCESS);
      });

      this.#client.once("error", (error) => resolve({ success: false, error }));
    });
  }

  async #handleMessage(topic: string, payload: Buffer) {
    switch (topic) {
      case `${this.#baseTopic}/bridge/devices`:
        const updatedDeviceList: Device[] = JSON.parse(payload.toString());

        const devices = elementDiff(
          Object.values(this.#devices),
          updatedDeviceList,
          (a, b) => a.friendly_name === b.friendly_name,
        );

        const deviceArray: Device[] = JSON.parse(payload.toString());
        this.#devices = Object.fromEntries(
          deviceArray.map((device) => [device.ieee_address, device]),
        );

        const extractDeviceTopics = (devices: Device[]) =>
          devices.map((device) => `${this.#baseTopic}/${device.friendly_name}`);

        if (devices.added.length > 0) {
          const newTopics = extractDeviceTopics(devices.added);
          logger(
            "info",
            "MQTT",
            `Devices updated, subscribing to new topics: ${quoteList(
              newTopics,
            )}`,
          );

          this.#client.subscribe(newTopics);

          devices.added.forEach((device) => {
            logger(
              "info",
              "MQTT",
              `Requesting initial data for '${device.friendly_name}' [${device.ieee_address}]`,
            );
            const features = featuresFor(device);
            this.#client.publish(
              `${this.#baseTopic}/${device.friendly_name}/get`,
              JSON.stringify(buildGetter(features)),
            );
          });
        }

        if (devices.removed.length > 0) {
          const removedTopics = extractDeviceTopics(devices.removed);
          logger(
            "info",
            "MQTT",
            `Unsubscribing from: ${quoteList(removedTopics)}`,
          );
          this.#client.unsubscribe(removedTopics);
        }

        break;

      case `${this.#baseTopic}/bridge/groups`:
        console.log("groups topic updated");

        const updatedGroupList: Group[] = JSON.parse(payload.toString());

        const groups = elementDiff(
          Object.values(this.#groups),
          updatedGroupList,
          (a, b) => a.friendly_name === b.friendly_name,
        );

        const groupArray: Group[] = JSON.parse(payload.toString());
        this.#groups = Object.fromEntries(
          groupArray.map((group) => [group.friendly_name, group]),
        );

        const extractGroupTopics = (groups: Group[]) =>
          groups.map((group) => `${this.#baseTopic}/${group.friendly_name}`);

        if (groups.added.length > 0) {
          const newTopics = extractGroupTopics(groups.added);
          logger(
            "info",
            "MQTT",
            `Groups updated, subscribing to new topics: ${quoteList(
              newTopics,
            )}`,
          );

          this.#client.subscribe(newTopics);
        }

        if (groups.removed.length > 0) {
          const removedTopics = extractGroupTopics(groups.removed);
          logger(
            "info",
            "MQTT",
            `Unsubscribing from: ${quoteList(removedTopics)}`,
          );
          this.#client.unsubscribe(removedTopics);
        }

        break;

      default:
        const deviceFriendlyName = topic.split("/")[1];
        const ieee = await this.getIeeeAddress(deviceFriendlyName);

        if (payload.toString().trim().length === 0) {
          logger(
            "warn",
            "MQTT",
            `Payload was empty on '${topic}'. Maybe a device updated its name?`,
          );
        } else if (ieee !== undefined) {
          logger(
            "info",
            "MQTT",
            `Updating data for: '${deviceFriendlyName}' [${ieee}]`,
          );
          const jsonPayload = JSON.parse(payload.toString());
          // TODO: This should do recursive object merging to prevent
          //       reliance on the home assistant modes
          this.#devicesData[ieee] = jsonPayload;
        } else {
          logger(
            "warn",
            "MQTT",
            `Unhandled message on '${topic}': ${payload.toString()}`,
          );
        }

        break;
    }
  }

  exposeUpdater: ExposeUpdater = (device, expose, value) => {
    this.#client.publish(
      `${this.#baseTopic}/${device}/set`,
      JSON.stringify({
        [expose]: value,
      }),
    );
  };

  async cacheStatus(): Promise<Record<string, boolean>> {
    const cachePromises: Promise<[string, boolean]>[] = Object.keys(
      this.#devices,
    ).map(async (deviceId) => {
      const status: [string, boolean] = [
        deviceId,
        await this.cachePopulated(deviceId),
      ];
      return status;
    });
    const cacheStatus = Object.fromEntries(await Promise.all(cachePromises));
    return cacheStatus;
  }

  async cachePopulated(deviceId: string): Promise<boolean> {
    await this.#mqttClientConnected;
    const device = this.#devices[deviceId];
    if (device === undefined) return false;

    const deviceData = this.#devicesData[deviceId];

    // loop through each device field make sure we have data for that??
    const features = featuresFor(device);
    let dataSet = true;
    recurseFeatures(features, (feature, path) => {
      const featureProperty = feature.property ?? feature.name;
      // TODO: Make a proper function for checking access levels to actually check if bit 1 is set
      if (feature.access !== 7) return;
      if (getByPath(deviceData, [...path, featureProperty]) === undefined)
        dataSet = false;
    });
    return dataSet;
  }

  async getDevice(deviceId: string): Promise<MqttDevice> {
    await this.#mqttClientConnected;
    const device = this.#devices[deviceId];
    return new MqttDevice(device, this.exposeUpdater);
  }

  async getDevices(): Promise<MqttDevice[]> {
    await this.#mqttClientConnected;
    const devices = Object.values(this.#devices);
    return devices.map((device) => new MqttDevice(device, this.exposeUpdater));
  }

  async getGroup(groupName: string): Promise<Group> {
    await this.#mqttClientConnected;
    const group = this.#groups[groupName];
    return group;
  }

  async getGroups(): Promise<Group[]> {
    await this.#mqttClientConnected;
    const groups = Object.values(this.#groups);
    return groups;
  }

  async addGroup(friendlyName: string, id?: number) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/add`,
      JSON.stringify({
        friendly_name: friendlyName,
        id: id,
      }),
    );
  }

  async removeGroup(friendlyName: string, id?: number, force?: boolean) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/remove`,
      JSON.stringify({
        friendly_name: friendlyName,
        id: id,
        force: force,
      }),
    );
  }

  async addDeviceToGroup(group: string, deviceFriendlyName: string) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/members/add`,
      JSON.stringify({
        group: group,
        device: deviceFriendlyName,
      }),
    );
  }

  async getIeeeAddress(
    deviceFriendlyName: string,
  ): Promise<string | undefined> {
    await this.#mqttClientConnected;

    const device = Object.values(this.#devices).find(
      (device) => device.friendly_name === deviceFriendlyName,
    );

    return device?.ieee_address;
  }
}
