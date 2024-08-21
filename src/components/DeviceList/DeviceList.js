// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from 'wouter';
import DeviceCard from '../DeviceCard/DeviceCard';

const deviceFilter = (device) => {
  if (device.type === 'Coordinator') return false;
  return true;
};

const deviceSort = (a, b) =>
  isFinite(a.friendly_name[0]) - isFinite(b.friendly_name[0]) ||
  a.friendly_name.localeCompare(b.friendly_name, 'en', { numeric: true });

function DeviceList(props) {
  return (
    <div>
      {props.devices
        .filter(deviceFilter)
        .sort(deviceSort)
        .map((device) => (
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
