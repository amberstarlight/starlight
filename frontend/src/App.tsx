// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
import { Link, Route } from "wouter";

import styled, { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles/globalStyles";
import { useDarkMode } from "./components/UseDarkMode/useDarkMode";
import { StyledText, lightTheme, darkTheme } from "./utils/theme";

import Devices from "./pages/Devices/Devices";
import Settings from "./pages/Settings/Settings";

import Button from "./components/Button/Button";
import DeviceSettings from "./components/DeviceSettings/DeviceSettings";

const Wrapper = styled.div`
  padding: 2em;
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1em;
`;

const backend = import.meta.env.VITE_API_URL ?? "";

function App() {
  const [devices, setDevices] = useState();
  const [bridgeState, setBridgeState] = useState();
  const [theme] = useDarkMode();

  const themeMode = theme === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    fetch(`${backend}/api/devices`)
      .then((res) => res.json())
      .then((data) => setDevices(data.data));
  }, []);

  return (
    <ThemeProvider theme={themeMode}>
      <GlobalStyles />
      <Wrapper>
        <NavBar>
          <Link href={"/devices"}>
            <Button text={"Devices"} />
          </Link>
          <Link href={"/groups"}>
            <Button text={"Groups"} />
          </Link>
          <Link href={"/settings"}>
            <Button text={"Settings"} />
          </Link>
        </NavBar>

        {/* routes */}
        <Route path={"/devices"}>
          <Devices devices={devices} />
        </Route>

        <Route path={"/devices/:friendlyName"}>
          {(params) => {
            if (!devices) return <></>;

            const device = devices.find(
              (device) =>
                Object.prototype.hasOwnProperty.call(device, "friendly_name") &&
                device.friendly_name ===
                  decodeURIComponent(params.friendlyName),
            );

            if (!device)
              return (
                <StyledText>
                  Device <b>{params.friendlyName}</b> does not exist on this
                  network.
                </StyledText>
              );

            return <DeviceSettings device={device} />;
          }}
        </Route>

        <Route path={"/settings"}>
          <Settings bridgeState={bridgeState} />
        </Route>
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
