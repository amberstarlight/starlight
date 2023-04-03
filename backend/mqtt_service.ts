import mqtt, { MqttClient, IClientOptions } from "mqtt";

let client: MqttClient;

function init(
  mqttEndpoint: string,
  mqttOptions?: IClientOptions
): Promise<void> {
  client = mqtt.connect(mqttEndpoint, mqttOptions);

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

  /*
    TODO: write a message handler
  */
}

export { init };
