// SPDX-License-Identifier: GPL-3.0-or-later

import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { Device } from "./types/zigbee_types";

let client: MqttClient;
let devices: Device[] = [];

function init(
  mqttEndpoint: string,
  mqttOptions?: IClientOptions
): Promise<void> {
  client = mqtt.connect(mqttEndpoint, mqttOptions);

  client.on("message", (topic, payload) => {
    const message = payload.toString();

    switch (topic) {
      case "zigbee2mqtt/bridge/info":
        // do something
        break;
      case "zigbee2mqtt/bridge/devices":
        devices = JSON.parse(message);
      default:
        break;
    }
  });

  return new Promise((resolve, reject) => {
    client.once("connect", () => {
      if (client === undefined) {
        reject(new TypeError("Client is undefined!"));
      } else {
        client.subscribe("zigbee2mqtt/bridge/info");
        client.subscribe("zigbee2mqtt/bridge/devices");
      }

      resolve();
    });

    client.once("error", reject);
  });
}

export { init };
