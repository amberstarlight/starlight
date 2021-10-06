import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

import testDevices from './testDevices.json';
import DeviceList from './components/DeviceList/DeviceList';
import DeviceSettings from './components/DeviceSettings/DeviceSettings';

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageRef = useRef([]);

  const [devices, setDevices] = useState(testDevices);
  const [selectedDevice, setSelectedDevice] = useState();

  const addMessage = (content) => {
    messageRef.current.push(content);
    setMessages(messageRef.current.slice());
  };

  useEffect(() => {
    const client = mqtt.connect('mqtt://localhost:1884');

    if (!connected){
      client.on('connect', () => {
        setConnected(true);
        client.subscribe('zigbee2mqtt/bridge/devices');
      });
            
      client.on('message', (topic, payload, packet) => {
        addMessage(payload.toString());
        if (topic === 'zigbee2mqtt/bridge/devices') setDevices(payload.toJSON());
      });
    }
  }, [messages, connected]);

  if (selectedDevice) return (
    <>
      <button onClick={() => setSelectedDevice(null)}>Back</button>
      <DeviceSettings device={selectedDevice} />
    </>
  );

  return (
    <DeviceList onClick={device => setSelectedDevice(device)} devices={devices} />
  );

}

export default App;

// selectedDevice ?
// <>
// <button onClick={() => setSelectedDevice(undefined)}>Back</button>
// <DeviceSettings
//   deviceName={selectedDevice.name}
//   deviceType={selectedDevice.deviceType}
// />
// </>
