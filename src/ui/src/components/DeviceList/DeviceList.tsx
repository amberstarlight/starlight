// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";
import { Link } from "wouter";
import DeviceCard from "../DeviceCard/DeviceCard";
import { type Device } from "@starlight/types";

const columns = 3;

const ListWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
`;

function DeviceList(props: { devices: Device[] }) {
  return (
    <ListWrapper>
      {props.devices.map((device: Device) => (
        <Link
          href={`/devices/${device.ieee_address}`}
          key={device.ieee_address}
        >
          <DeviceCard device={device} dimmed={!device.availability} />
        </Link>
      ))}
    </ListWrapper>
  );
}

export default DeviceList;
