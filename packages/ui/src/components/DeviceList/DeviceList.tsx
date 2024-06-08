// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from "wouter";
import DeviceCard from "../DeviceCard/DeviceCard";
import { type Device } from "@starlight/types";

function DeviceList(props: { devices: Device[]; onClick: Function }) {
  return (
    <div>
      {props.devices.map((device: Device) => (
        <Link
          href={`/devices/${device.ieee_address}`}
          key={device.ieee_address}
        >
          <DeviceCard device={device} onClick={() => props.onClick} />
        </Link>
      ))}
    </div>
  );
}

export default DeviceList;
