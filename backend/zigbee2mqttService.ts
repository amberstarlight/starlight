// SPDX-License-Identifier: AGPL-3.0-or-later

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

enum GroupOperation {
  Add,
  Remove,
}

type GroupMemberUpdater = (
  groupName: string,
  deviceId: string,
  operation: GroupOperation,
) => void;

class MqttDevice {
  device: Device;
  #updater: ExposeUpdater;

  constructor(device: Device, updater: ExposeUpdater) {
    this.device = device;
    this.#updater = updater;
  }

  toJSON(): Device {
    return this.device;
  }

  getValue(expose: string): any {
    // could be any type, number, bool, etc
  }

  setValue(expose: string, value: any): OperationStatus {
    this.#updater(this.device.friendly_name, expose, value);
    return SUCCESS;
  }
}

class MqttGroup {
  group: Group;
  #updater: ExposeUpdater;
  #memberUpdater: GroupMemberUpdater;

  constructor(
    group: Group,
    updater: ExposeUpdater,
    memberUpdater: GroupMemberUpdater,
  ) {
    this.group = group;
    this.#updater = updater;
    this.#memberUpdater = memberUpdater;
  }

  toJSON(): Group {
    return this.group;
  }

  setValue(expose: string, value: any): OperationStatus {
    this.#updater(this.group.friendly_name, expose, value);
    return SUCCESS;
  }

  addDevice(deviceId: string): OperationStatus {
    this.#memberUpdater(this.group.friendly_name, deviceId, 0);
    return SUCCESS;
  }

  removeDevice(deviceId: string): OperationStatus {
    this.#memberUpdater(this.group.friendly_name, deviceId, 1);
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
  #baseTopic: string;
  #client: MqttClient;
  #devicesData: Record<string, any> = {};
  #devices: Record<string, Device> = {};
  #groupsData: Record<string, any> = {};
  #groups: Record<string, Group> = {};
  #mqttClientConnected: Promise<OperationStatus>;
  #ready: Boolean = false;

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
        this.#ready = true;
        resolve(SUCCESS);
      });

      this.#client.once("error", (error) => resolve({ success: false, error }));
    });
  }

  get ready() {
    return this.#ready;
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
        const updatedGroupList: Group[] = JSON.parse(payload.toString());

        const groups = elementDiff(
          Object.values(this.#groups),
          updatedGroupList,
          (a, b) => a.friendly_name === b.friendly_name,
        );

        const groupArray: Group[] = JSON.parse(payload.toString());
        this.#groups = Object.fromEntries(
          groupArray.map((group) => [group.id, group]),
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
            `Groups updated, unsubscribing from: ${quoteList(removedTopics)}`,
          );
          this.#client.unsubscribe(removedTopics);
        }

        break;

      default:
        const topicName = topic.split("/")[1];
        const ieeeAddress = await this.getIeeeAddress(topicName);
        const groupId = await this.getGroupId(topicName);

        if (payload.toString().trim().length === 0) {
          logger(
            "warn",
            "MQTT",
            `Payload was empty on '${topic}'. Maybe a device updated its name?`,
          );
          break;
        }

        const jsonPayload = JSON.parse(payload.toString());

        if (ieeeAddress !== undefined) {
          logger(
            "info",
            "MQTT",
            `Updating data for: '${topicName}' [${ieeeAddress}]`,
          );
          // TODO: This should do recursive object merging to prevent
          //       reliance on the home assistant modes
          this.#devicesData[ieeeAddress] = jsonPayload;
          break;
        }

        if (groupId !== undefined) {
          logger(
            "info",
            "MQTT",
            `Updating data for group: '${topicName}' [${groupId}]`,
          );
          this.#groupsData[groupId] = jsonPayload;
          break;
        }

        logger(
          "warn",
          "MQTT",
          `Unhandled message on '${topic}': ${payload.toString()}`,
        );

        break;
    }
  }

  exposeUpdater: ExposeUpdater = (deviceOrGroup, expose, value) => {
    this.#client.publish(
      `${this.#baseTopic}/${deviceOrGroup}/set`,
      JSON.stringify({
        [expose]: value,
      }),
    );
  };

  groupMemberUpdater: GroupMemberUpdater = (
    group: string,
    device: string,
    operation: GroupOperation,
  ) => {
    const keyword = operation ? "remove" : "add";
    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/members/${keyword}`,
      JSON.stringify({
        group: group,
        device: device,
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

    if (device === undefined) throw new Error("Device does not exist");
    return new MqttDevice(device, this.exposeUpdater);
  }

  async getDevices(): Promise<MqttDevice[]> {
    await this.#mqttClientConnected;
    const devices = Object.values(this.#devices);
    return devices.map((device) => new MqttDevice(device, this.exposeUpdater));
  }

  async getGroup(groupId: number): Promise<MqttGroup> {
    await this.#mqttClientConnected;
    const group = this.#groups[groupId];

    if (group === undefined) throw new Error("Group does not exist");
    return new MqttGroup(group, this.exposeUpdater, this.groupMemberUpdater);
  }

  async getGroups(): Promise<MqttGroup[]> {
    await this.#mqttClientConnected;
    const groups = Object.values(this.#groups);
    return groups.map(
      (group) =>
        new MqttGroup(group, this.exposeUpdater, this.groupMemberUpdater),
    );
  }

  async addGroup(friendlyName: string) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/add`,
      JSON.stringify({
        friendly_name: friendlyName,
      }),
    );
  }

  async deleteGroup(id: number, force: boolean = false) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/bridge/request/group/remove`,
      JSON.stringify({
        id: id,
        force: force,
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

  async getGroupId(friendlyName: string): Promise<number | undefined> {
    await this.#mqttClientConnected;

    const group = Object.values(this.#groups).find(
      (group) => group.friendly_name === friendlyName,
    );

    return group?.id;
  }
}
