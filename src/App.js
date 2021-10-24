import { useEffect, useState } from 'react';
import * as mqttService from './services/mqttService';

import DeviceList from './components/DeviceList/DeviceList';
import DeviceSettings from './components/DeviceSettings/DeviceSettings';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

const options = {
  reconnectPeriod: 10000,
};

function App() {
  const [devices, setDevices] = useState();
  const [selectedDevice, setSelectedDevice] = useState();

  useEffect(() => {
    mqttService.init(options);
    mqttService.getDevices().then(setDevices);
  }, []);

  if (!devices)
    return (
      <>
        <LoadingSpinner />
        <p>Reticulating Splines...</p>
      </>
    );

  if (selectedDevice)
    return (
      <>
        <button onClick={() => setSelectedDevice(null)}>Back</button>
        <DeviceSettings device={selectedDevice} />
      </>
    );

  return (
    <DeviceList
      onClick={(device) => setSelectedDevice(device)}
      devices={devices}
    />
  );
}

export default App;
