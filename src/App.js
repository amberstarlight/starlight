import { useEffect, useState } from 'react';
import * as mqttService from './services/mqttService';

import DeviceList from './components/DeviceList/DeviceList';
import DeviceSettings from './components/DeviceSettings/DeviceSettings';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import Button from './components/Button/Button';

const options = {
  reconnectPeriod: 10000,
};

function App() {
  const [devices, setDevices] = useState();
  const [selectedDevice, setSelectedDevice] = useState();
  const [bridgeState, setBridgeState] = useState();

  useEffect(() => {
    mqttService.init(options, setBridgeState);
    mqttService.getDevices().then(setDevices);
  }, []);

  let deviceContent = undefined;

  if (!devices || !selectedDevice)
    deviceContent = (
      <>
        <LoadingSpinner />
        <p>Reticulating Splines...</p>
      </>
    );

  if (selectedDevice)
    deviceContent = (
      <>
        <button onClick={() => setSelectedDevice(null)}>Back</button>
        <DeviceSettings device={selectedDevice} />
      </>
    );

  if (devices && !selectedDevice) {
    deviceContent = (
      <DeviceList
        onClick={(device) => setSelectedDevice(device)}
        devices={devices}
      />
    );
  }

  return (
    <>
      {deviceContent !== undefined ? deviceContent : ''}
      <Button
        text="Permit Join"
        onClick={() => {
          mqttService.sendMqttMessage(
            'zigbee2mqtt/bridge/request/permit_join',
            { value: true, time: 10 }
          );
        }}
      />
      {bridgeState !== undefined ? (
        <p>{bridgeState.permit_join_timeout}</p>
      ) : (
        ''
      )}
    </>
  );
}

export default App;
