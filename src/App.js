import { useEffect, useState } from 'react';
import * as mqttService from './services/mqttService';
import { Link, Route } from 'wouter';

import Devices from './pages/Devices/Devices';
import Settings from './pages/Settings/Settings';

import Button from './components/Button/Button';
import DeviceSettings from './components/DeviceSettings/DeviceSettings';

const options = {
  reconnectPeriod: 10000,
};

function App() {
  const [devices, setDevices] = useState();
  const [bridgeState, setBridgeState] = useState();

  useEffect(() => {
    mqttService.init(options, setBridgeState);
    mqttService.getDevices().then(setDevices);
  }, []);

  return (
    <>
      <Link href={'/devices'}>
        <Button text={'Devices'} />
      </Link>
      <Link href={'/groups'}>
        <Button text={'Groups'} />
      </Link>
      <Link href={'/settings'}>
        <Button text={'Settings'} />
      </Link>

      <Route path={'/devices'}>
        <Devices devices={devices} />
      </Route>

      <Route path={'/devices/:friendlyName'}>
        {(params) => {
          if (!devices) return <></>;

          const device = devices.find(
            (device) =>
              Object.prototype.hasOwnProperty.call(device, 'friendly_name') &&
              device.friendly_name === decodeURIComponent(params.friendlyName)
          );

          if (!device)
            return (
              <p>
                Device <b>{params.friendlyName}</b> does not exist on this
                network.
              </p>
            );

          return <DeviceSettings device={device} />;
        }}
      </Route>

      <Route path={'/settings'}>
        <Settings bridgeState={bridgeState} />
      </Route>
    </>
  );
}

export default App;
