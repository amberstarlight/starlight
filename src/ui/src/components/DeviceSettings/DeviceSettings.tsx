// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { deviceSettingsGenerator } from "./generator";
import EditableText from "../EditableText/EditableText";
import { deviceDescription } from "../../utils/deviceUtilities";
import Button from "../Button/Button";

const backend = import.meta.env.VITE_API_URL ?? "";

function DeviceSettings(props) {
  const [deviceSettingsState, setDeviceSettingsState] = useState();
  const [deviceFriendlyNameState, setDeviceFriendlyNameState] = useState(
    props.device.friendly_name,
  );

  const updateDeviceName = async (newName: string) => {
    const request = new Request(
      `${backend}/api/devices/${props.device.ieee_address}`,
      {
        method: "PUT",
        mode: "cors",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      },
    );
    fetch(request).then((res) => res.json());
  };

  const deleteButton = (
    <Button
      text={"❌ Remove Device"}
      onClick={() => {
        const request = new Request(
          `${backend}/api/devices/${props.device.ieee_address}`,
          {
            method: "DELETE",
          },
        );
        fetch(request)
          .then((res) => res.json())
          .then((data) => console.log(data));
      }}
    />
  );

  const fetchStateData = () => {
    fetch(`${backend}/api/devices/${props.device.ieee_address}/state`)
      .then((res) => res.json())
      .then((data) => setDeviceSettingsState(data.data));
  };

  if (!props.device.supported)
    return (
      <>
        <p>This device exposes nothing that can be controlled.</p>
        {deleteButton}
      </>
    );

  useEffect(() => {
    fetchStateData();
  }, []);

  if (!deviceSettingsState)
    return (
      <>
        <LoadingSpinner />
        {deleteButton}
      </>
    );

  const deviceDefinition = props.device.definition;

  return (
    <>
      <div>
        <EditableText
          label={"Friendly Name"}
          text={deviceFriendlyNameState}
          onChange={(event) => {
            const newFriendlyName = event.target.value;
            setDeviceFriendlyNameState(newFriendlyName);
          }}
          onBlur={() => {
            updateDeviceName(deviceFriendlyNameState);
          }}
        />
        <h3>{deviceDescription(deviceDefinition)}</h3>
      </div>

      <div>
        {deviceSettingsGenerator(
          props.device,
          deviceSettingsState,
          fetchStateData,
        )}
      </div>
    </>
  );
}

export default DeviceSettings;
