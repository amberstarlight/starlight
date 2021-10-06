import { useState } from 'react';
import * as mqttService from './services/mqttService';

import testDevices from './testDevices.json';
import DeviceList from './components/DeviceList/DeviceList';
import DeviceSettings from './components/DeviceSettings/DeviceSettings';

mqttService.init();

function App() {
  const [devices, setDevices] = useState(testDevices);
  const [selectedDevice, setSelectedDevice] = useState();

  setDevices(mqttService.getDevices());

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
