// SPDX-License-Identifier: GPL-3.0-or-later

import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { Device } from "./types/zigbee_types";
import { logger } from "./logger";

const baseTopic: string = "zigbee2mqtt";

let client: MqttClient;
let devices: Device[] = [];
let deviceLastKnownState: Record<string, any> = {};

function init(
  mqttEndpoint: string,
  mqttOptions?: IClientOptions
): Promise<void> {
  client = mqtt.connect(mqttEndpoint, mqttOptions);

  client.on("message", messageHandler);

  return new Promise((resolve, reject) => {
    client.once("connect", () => {
      if (client === undefined) {
        reject(new TypeError("Client is undefined!"));
      } else {
        client.subscribe([
          `${baseTopic}/bridge/info`,
          `${baseTopic}/bridge/devices`,
        ]);
      }

      resolve();
    });

    client.once("error", reject);
  });
}

function messageHandler(topic: string, payload: Buffer) {
  switch (topic) {
    case `${baseTopic}/bridge/info`:
      // do something
      break;

    case `${baseTopic}/bridge/devices`:
      devices = JSON.parse(payload.toString());
      let deviceFriendlyNames = devices.map((device) => device.friendly_name);
      let deviceTopics = deviceFriendlyNames.map(
        (deviceFriendlyName) => `${baseTopic}/${deviceFriendlyName}`
      );
      client.subscribe(deviceTopics);

      const deviceSettings = devices.map((device) => {
        let settingNames = device.definition?.exposes.flatMap((expose) => {
          if (expose.features === undefined) return [];
          return expose.features.map((feature) => feature.name);
        });

        if (settingNames === undefined) settingNames = [];

        return {
          device: {
            ieee_address: device.ieee_address,
            friendly_name: device.friendly_name,
          },
          settingNames,
        };
      });

      let devicesWithSettings = deviceSettings.filter(
        (deviceSetting) => deviceSetting.settingNames.length > 0
      );

      devicesWithSettings.forEach(({ device, settingNames }) => {
        let payload: Record<string, ""> = {};
        for (let setting of settingNames) {
          payload[setting] = "";
        }

        client.publish(
          `${baseTopic}/${device.friendly_name}/get`,
          JSON.stringify(payload)
        );
      });

      break;

    default:
      logger("debug", topic, "updated", payload.toString());

      const message = JSON.parse(payload.toString());
      let device = topic.split("/")[1];

      let deviceMessage = {
        received_timestamp: Date.now(),
        message,
      };

      deviceLastKnownState[device] = deviceMessage;
      break;
  }
}

function getDeviceFriendlyName(deviceId: string): string | undefined {
  const device = devices.find((device) => device.ieee_address === deviceId);
  return device?.friendly_name;
}

function getDeviceById(deviceId: string): Device | undefined {
  return devices.find((device) => device.ieee_address === deviceId);
}

function setDeviceSetting(
  deviceFriendlyName: string,
  settingName: string,
  settingValue: string | number
): any {
  let payload: Record<string, string | number> = {};

  payload[settingName] = settingValue;

  client.publish(
    `${baseTopic}/${deviceFriendlyName}/set`,
    JSON.stringify(payload)
  );
}

//TODO: get message from device topic and return it

function getDeviceSetting(
  deviceFriendlyName: string,
  settingName: string
): Record<string, any> {
  const topic = `${baseTopic}/${deviceFriendlyName}`;
  let payload: Record<string, string> = {};
  payload[settingName] = "";

  let deviceState: Record<string, any> = {};

  client.publish(`${topic}/get`, JSON.stringify(payload));

  // this isn't being retrieved fast enough before execution and the return,
  // so we don't get anything
  deviceState = deviceLastKnownState[deviceFriendlyName];

  return deviceState;
}

export {
  init,
  devices,
  getDeviceFriendlyName,
  getDeviceById,
  setDeviceSetting,
};
