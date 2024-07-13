// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from "wouter";
import DeviceCard from "../DeviceCard/DeviceCard";
import { type Device } from "@starlight/types";

const deviceSort = (a: Device, b: Device) =>
  +isFinite(a.friendly_name[0]) - +isFinite(b.friendly_name[0]) ||
  a.friendly_name.localeCompare(b.friendly_name, undefined, { numeric: true });

function DeviceList(props: { devices: Device[]; onClick: Function }) {
  return (
    <div>
      {props.devices.sort(deviceSort).map((device: Device) => (
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
