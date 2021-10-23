import mqtt from 'mqtt';
let client;

let oneTimeTopicCallbacks = {};
let devices;

export const init = (options) => {
  client = mqtt.connect('mqtt://localhost:1884', options);

  if (!client.connected) {
    client.on('message', (topic, payload) => {
      if (topic === 'zigbee2mqtt/bridge/devices') {
        devices = JSON.parse(payload.toString());
      }

      if (oneTimeTopicCallbacks[topic]) {
        let callback = oneTimeTopicCallbacks[topic].shift();
        callback(payload);
      }
    });

    client.once('connect', () => {
      client.subscribe('zigbee2mqtt/bridge/devices');
    });
  }
};

export const getDevices = () => {
  let topic = 'zigbee2mqtt/bridge/devices';

  return new Promise((resolve) => {
    if (devices !== undefined) resolve(devices);
    
    if (!oneTimeTopicCallbacks[topic]) oneTimeTopicCallbacks[topic] = [];
    const callbackFunction = (payload) => {
      resolve(JSON.parse(payload.toString()));
    };

    oneTimeTopicCallbacks[topic].push(callbackFunction);
  });
};

export const getDeviceSettings = (deviceFriendlyName, exposes) => {
  return new Promise((resolve) => {
    let topic = `zigbee2mqtt${deviceFriendlyName}`;
    client.subscribe(topic);

    if (!oneTimeTopicCallbacks[topic]) oneTimeTopicCallbacks[topic] = [];
    const callbackFunction = (payload) => {
      resolve(JSON.parse(payload.toString()));
    };

    oneTimeTopicCallbacks[topic].push(callbackFunction);

    let message = {};
    message[exposes] = '';
    client.publish(`${topic}/get`, JSON.stringify(message));
  });
};

export const setDeviceSettings = (deviceFriendlyName, settings) => {
  let topic = `zigbee2mqtt${deviceFriendlyName}`;
  client.publish(`${topic}/set`, JSON.stringify(settings));
};