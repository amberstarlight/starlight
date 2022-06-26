// SPDX-License-Identifier: GPL-3.0-or-later

import { Link } from 'wouter';
import DeviceCard from '../DeviceCard/DeviceCard';

function DeviceList(props) {
  return (
    <div>
      {props.devices.map((device) => (
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
