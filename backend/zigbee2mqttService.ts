// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { logger } from "./logger";
import { BridgeResponse, Device, Group, Scene } from "./types/zigbee_types";
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

type FieldValue = any;

type ExposeUpdater = (
  device: string,
  fieldName: string,
  fieldValue: FieldValue,
) => void;

type ExposeRetriever = (id: string, fieldName?: string) => Promise<FieldValue>;

enum GroupOperation {
  Add,
  Remove,
}

type GroupMemberUpdater = (
  groupName: string,
  deviceId: string,
  operation: GroupOperation,
) => Promise<BridgeResponse>;

type BridgeResponseCallback = (response: BridgeResponse) => void;

class MqttDevice {
  device: Device;
  #updater: ExposeUpdater;
  #exposeRetriever: ExposeRetriever;

  constructor(
    device: Device,
    updater: ExposeUpdater,
    exposeRetriever: ExposeRetriever,
  ) {
    this.device = device;
    this.#updater = updater;
    this.#exposeRetriever = exposeRetriever;
  }

  toJSON(): Device {
    return this.device;
  }

  async getValue(expose?: string): Promise<FieldValue> {
    const value = await this.#exposeRetriever(this.device.ieee_address, expose);
    return value;
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
  #exposeRetriever: ExposeRetriever;

  constructor(
    group: Group,
    updater: ExposeUpdater,
    memberUpdater: GroupMemberUpdater,
    exposeRetriever: ExposeRetriever,
  ) {
    this.group = group;
    this.#updater = updater;
    this.#memberUpdater = memberUpdater;
    this.#exposeRetriever = exposeRetriever;
  }

  toJSON(): Group {
    return this.group;
  }

  async getValue(expose?: string): Promise<FieldValue> {
    const value = await this.#exposeRetriever(this.group.id.toString(), expose);
    return value;
  }

  setValue(expose: string, value: any): OperationStatus {
    this.#updater(this.group.friendly_name, expose, value);
    return SUCCESS;
  }

  async addDevice(deviceId: string): Promise<BridgeResponse> {
    return this.#memberUpdater(this.group.friendly_name, deviceId, 0);
  }

  async removeDevice(deviceId: string): Promise<BridgeResponse> {
    return this.#memberUpdater(this.group.friendly_name, deviceId, 1);
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
  #topicCallbacks: Record<string, BridgeResponseCallback[]> = {};

  constructor(
    endpoint: string,
    options: IClientOptions,
    baseTopic: string = "zigbee2mqtt",
  ) {
    this.#baseTopic = baseTopic;
    this.#client = mqtt.connect(endpoint, options);

    this.#mqttClientConnected = new Promise((resolve, reject) => {
      this.#client.once("error", (error) => reject({ success: false, error }));
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

        if (
          this.#topicCallbacks[topic] &&
          this.#topicCallbacks[topic].length > 0
        ) {
          let callback = this.#topicCallbacks[topic].shift();
          if (callback !== undefined) callback(jsonPayload);
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

  exposeRetriever: ExposeRetriever = async (id, expose) => {
    // work out if it's a device or a group
    const group = await this.getGroup(parseInt(id));
    const device = await this.getDevice(id);

    if (group !== undefined) {
      if (expose !== undefined) return this.#groupsData[id][expose];
      return this.#groupsData[id];
    } else if (device !== undefined) {
      if (expose !== undefined) return this.#devicesData[id][expose];
      return this.#devicesData[id];
    }

    throw new Error("ID not found");
  };

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
  ): Promise<BridgeResponse> => {
    const keyword = operation ? "remove" : "add";
    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/group/members/${keyword}`,
      { group: group, device: device },
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

  async #bridgeRequest(topic: string, message: any): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    const responseTopic = topic.replace("request", "response");
    this.#client.subscribe(responseTopic);

    return new Promise((resolve) => {
      const callback: BridgeResponseCallback = (response: BridgeResponse) => {
        resolve(response);
      };

      if (!this.#topicCallbacks[responseTopic])
        this.#topicCallbacks[responseTopic] = [];
      this.#topicCallbacks[responseTopic].push(callback);

      this.#client.publish(topic, JSON.stringify(message));
    });
  }

  async permitJoining(
    state: boolean,
    device?: string,
    time?: number,
  ): Promise<BridgeResponse> {
    await this.#mqttClientConnected;

    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/permit_join`,
      {
        value: state,
        device: device,
        time: time,
      },
    );
  }

  async getDevice(deviceId: string): Promise<MqttDevice | undefined> {
    await this.#mqttClientConnected;
    const device = this.#devices[deviceId];

    if (device === undefined) return undefined;
    return new MqttDevice(device, this.exposeUpdater, this.exposeRetriever);
  }

  async getDevices(): Promise<MqttDevice[]> {
    await this.#mqttClientConnected;
    const devices = Object.values(this.#devices);
    return devices.map(
      (device) =>
        new MqttDevice(device, this.exposeUpdater, this.exposeRetriever),
    );
  }

  async renameDevice(
    deviceId: string,
    newName: string,
  ): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/device/rename`,
      { from: deviceId, to: newName },
    );
  }

  async deleteDevice(deviceId: string): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/device/remove`,
      { id: deviceId },
    );
  }

  async getGroup(groupId: number): Promise<MqttGroup | undefined> {
    await this.#mqttClientConnected;
    const group = this.#groups[groupId];

    if (group === undefined) return undefined;
    return new MqttGroup(
      group,
      this.exposeUpdater,
      this.groupMemberUpdater,
      this.exposeRetriever,
    );
  }

  async getGroups(): Promise<MqttGroup[]> {
    await this.#mqttClientConnected;
    const groups = Object.values(this.#groups);
    return groups.map(
      (group) =>
        new MqttGroup(
          group,
          this.exposeUpdater,
          this.groupMemberUpdater,
          this.exposeRetriever,
        ),
    );
  }

  async addGroup(friendlyName: string): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    return this.#bridgeRequest(`${this.#baseTopic}/bridge/request/group/add`, {
      friendly_name: friendlyName,
    });
  }

  async deleteGroup(
    id: number,
    force: boolean = false,
  ): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/group/remove`,
      { id: id, force: force },
    );
  }

  async renameGroup(groupId: number, newName: string): Promise<BridgeResponse> {
    await this.#mqttClientConnected;
    return this.#bridgeRequest(
      `${this.#baseTopic}/bridge/request/group/rename`,
      { from: groupId, to: newName },
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

  // creating and updating the scene can be done with the same topic, so
  // this can be create or update.
  async createOrUpdateScene(friendlyName: string, sceneData: Scene) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/${friendlyName}/set`,
      JSON.stringify({
        scene_add: {
          // in creating a scene, we must uppercase ID. horrible.
          ID: sceneData.id,
          ...sceneData,
        },
      }),
    );
  }

  async recallScene(friendlyName: string, sceneId: number) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/${friendlyName}/set`,
      JSON.stringify({
        scene_recall: sceneId,
      }),
    );
  }

  async deleteScene(friendlyName: string, sceneId: number) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/${friendlyName}/set`,
      JSON.stringify({
        scene_remove: sceneId,
      }),
    );
  }

  async deleteAllScenes(friendlyName: string) {
    await this.#mqttClientConnected;

    this.#client.publish(
      `${this.#baseTopic}/${friendlyName}/set`,
      JSON.stringify({
        scene_remove_all: "",
      }),
    );
  }
}
