// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "wouter";
import DeviceCard from "../DeviceCard/DeviceCard";
import { type Device } from "@starlight/types";
import { ListWrapper } from "../../utils/theme";

function DeviceList(props: { devices: Device[] }) {
  const [availability, setAvailability] = useState(false);

  useEffect(() => {
    fetch(`${props.backend}/api/devices/availability`)
      .then((res) => res.json())
      .then((data) => setAvailability(data));
  }, []);

  return (
    <ListWrapper>
      {props.devices.map((device: Device) => (
        <Link
          href={`/devices/${device.ieee_address}`}
          key={device.ieee_address}
        >
          <DeviceCard
            device={device}
            dimmed={!availability[device.ieee_address]}
          />
        </Link>
      ))}
    </ListWrapper>
  );
}

export default DeviceList;
