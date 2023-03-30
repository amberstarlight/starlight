// SPDX-License-Identifier: GPL-3.0-or-later

import DeviceList from '../../components/DeviceList/DeviceList';
import DeviceSettings from '../../components/DeviceSettings/DeviceSettings';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

function Devices(props) {
  const selectedDevice = props.selectedDevice;

  let deviceContent = undefined;

  if (!props.devices || !selectedDevice) deviceContent = <LoadingSpinner />;

  if (selectedDevice)
    deviceContent = <DeviceSettings device={selectedDevice} />;

  if (props.devices && !selectedDevice) {
    deviceContent = <DeviceList devices={props.devices} />;
  }

  return <>{deviceContent !== undefined ? deviceContent : ''}</>;
}

export default Devices;
