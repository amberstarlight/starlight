// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import { toggleDeviceJoining } from "../../utils/deviceUtilities";

function Settings(props: { backend: string }) {
  const [devicesCanJoin, setDevicesCanJoin] = useState(false);

  useEffect(() => {
    fetch(`${props.backend}/api/settings/join`)
      .then((res) => res.json())
      .then((data) => setDevicesCanJoin(data.value));
  }, []);

  return (
    <>
      <h1>Settings</h1>
      <p>Devices can{devicesCanJoin ? "" : "not"} join the network.</p>
      <Button
        text={devicesCanJoin ? "Disable joining" : "Allow joining"}
        onClick={() => {
          toggleDeviceJoining(!devicesCanJoin);
          setDevicesCanJoin(!devicesCanJoin);
        }}
      />
    </>
  );
}

export default Settings;
