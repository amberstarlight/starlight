// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from 'wouter';
import DeviceCard from '../DeviceCard/DeviceCard';

const deviceSort = (a, b) => {
  a.friendly_name[0] - b.friendly_name[0] ||
    a.friendly_name.localeCompare(b.friendly_name, undefined, {
      numeric: true,
    });
};

function DeviceList(props) {
  return (
    <div>
      {props.devices.sort(deviceSort).map((device) => (
        <Link
          href={`/devices/${device.friendly_name}`}
          key={device.ieee_address}
        >
          <DeviceCard device={device} onClick={() => props.onClick} />
        </Link>
      ))}
    </div>
  );
}

export default DeviceList;
