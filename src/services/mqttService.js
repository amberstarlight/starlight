import mqtt from 'mqtt';
let client;

let topicCallbacks = {};
let devices = {};

export const init = () => {
  client = mqtt.connect('mqtt://localhost:1884');

  if (!client.connected) {
    client.once('connect', () => {
      // https://github.com/Koenkk/zigbee2mqtt/blob/07a8a78a551f95ef345d97b4f5db79cb85318189/lib/extension/bridge.ts#L635
      // retain:true means we get the retained message immediately after subscribing
      client.subscribe('zigbee2mqtt/bridge/devices');
      console.log('Connected to MQTT broker.');
    });

    client.on('message', (topic, payload) => {
      if (topic === 'zigbee2mqtt/bridge/devices') {
        devices = payload.toJSON();
      }

      if (topicCallbacks[topic]) {
        let callback = topicCallbacks[topic].shift();
        callback(payload);
      }
    });
  }
};

export const getDevices = () => {
  return devices;
};

export const getDeviceSettings = (deviceFriendlyName, exposes) => {
  return new Promise((resolve) => {
    let topic = `zigbee2mqtt${deviceFriendlyName}`;
    client.subscribe(topic);

    if (!topicCallbacks[topic]) topicCallbacks[topic] = [];
    const callbackFunction = (payload) => {
      resolve(payload.toJSON());
    };

    topicCallbacks[topic].push(callbackFunction);

    let message = {};
    message[exposes] = '';
    client.publish(`${topic}/get`, JSON.stringify(message));
  });
};

export const setDeviceSettings = (deviceFriendlyName, settings) => {
  let topic = `zigbee2mqtt${deviceFriendlyName}`;
  client.publish(`${topic}/set`, JSON.stringify(settings));
};
