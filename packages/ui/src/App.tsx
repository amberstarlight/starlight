// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
import { Link, Route } from "wouter";

import styled, { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles/globalStyles";
import { useDarkMode } from "./components/UseDarkMode/useDarkMode";
import { StyledText, themeColours, darkThemeColours } from "./utils/theme";
import "./font.css";

import Devices from "./pages/Devices/Devices";
import Settings from "./pages/Settings/Settings";
import Groups from "./pages/Groups/Groups";

import NavBar from "./components/NavBar/NavBar";
import Button from "./components/Button/Button";
import DeviceSettings from "./components/DeviceSettings/DeviceSettings";
import { type Device, type Group } from "starlight/types";
import GroupSettings from "./components/GroupSettings/GroupSettings";

const Wrapper = styled.div`
  padding: 2em;
`;

const backend = import.meta.env.VITE_API_URL ?? "";

function App() {
  const [devices, setDevices] = useState();
  const [groups, setGroups] = useState();
  const [theme] = useDarkMode();

  const themeMode = theme === "light" ? themeColours : darkThemeColours;

  useEffect(() => {
    fetch(`${backend}/api/devices`)
      .then((res) => res.json())
      .then((data) => setDevices(data.data));

    fetch(`${backend}/api/groups`)
      .then((res) => res.json())
      .then((data) => setGroups(data.data));
  }, []);

  return (
    <ThemeProvider theme={themeMode}>
      <GlobalStyles />
      <Wrapper>
        <NavBar
          items={
            <>
              <Link href={"/devices"}>
                <Button text={"Devices"} />
              </Link>
              <Link href={"/groups"}>
                <Button text={"Groups"} />
              </Link>
              <Link href={"/settings"}>
                <Button text={"Settings"} />
              </Link>
            </>
          }
        ></NavBar>

        {/* routes */}
        <Route path={"/devices"}>
          <Devices devices={devices} />
        </Route>

        <Route path={"/devices/:deviceId"}>
          {(params) => {
            if (!devices) return <></>;

            const device = devices.find(
              (device: Device) =>
                device.ieee_address === decodeURIComponent(params.deviceId),
            );

            if (!device)
              return (
                <StyledText>
                  Device <code>{params.deviceId}</code> does not exist on this
                  network.
                </StyledText>
              );

            return <DeviceSettings device={device} />;
          }}
        </Route>

        <Route path={"/groups"}>
          <Groups groups={groups} />
        </Route>

        <Route path={"/groups/:groupId"}>
          {(params) => {
            if (!groups) return <></>;

            const group: Group = groups.find(
              (group: Group) =>
                group.id === parseInt(decodeURIComponent(params.groupId)),
            );

            if (!group)
              return (
                <StyledText>
                  Group with ID <code>{params.groupId}</code> does not exist on
                  this network.
                </StyledText>
              );

            return <GroupSettings group={group} />;
          }}
        </Route>

        <Route path={"/settings"}>
          <Settings bridgeState={{}} />
        </Route>
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
