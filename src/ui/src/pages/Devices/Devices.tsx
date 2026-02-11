// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import DeviceList from "../../components/DeviceList/DeviceList";
import DeviceSettings from "../../components/DeviceSettings/DeviceSettings";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

function Devices(props) {
  const selectedDevice = props.selectedDevice;

  let deviceContent = undefined;

  if (!props.devices || !selectedDevice) deviceContent = <LoadingSpinner />;

  if (selectedDevice)
    deviceContent = <DeviceSettings device={selectedDevice} />;

  if (props.devices && !selectedDevice) {
    deviceContent = (
      <DeviceList devices={props.devices} backend={props.backend} />
    );
  }

  return (
    <>
      <h1>Devices</h1>
      {deviceContent !== undefined ? deviceContent : ""}
    </>
  );
}

export default Devices;
