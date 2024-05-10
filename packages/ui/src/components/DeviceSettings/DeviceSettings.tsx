// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { deviceSettingsGenerator } from "./generator";
import EditableText from "../EditableText/EditableText";
import { deviceDescription } from "../../utils/deviceUtilities";

const backend = import.meta.env.VITE_API_URL ?? "";

function DeviceSettings(props) {
  const [deviceSettingsState, setDeviceSettingsState] = useState();
  const [deviceFriendlyNameState, setDeviceFriendlyNameState] = useState(
    props.device.friendly_name,
  );

  if (!props.device.supported)
    return <p>This device exposes nothing that can be controlled.</p>;

  const features = props.device.definition.exposes[0].features;

  useEffect(() => {
    let properties = {};

    features.forEach((property) => {
      properties[property.name] = "";
    });

    fetch(`${backend}/api/devices/${props.device.ieee_address}/state`)
      .then((res) => res.json())
      .then((data) => setDeviceSettingsState(data.data));
  }, []);

  if (!deviceSettingsState) return <LoadingSpinner />;

  let deviceDefinition = props.device.definition;

  return (
    <>
      <div>
        <EditableText
          text={deviceFriendlyNameState}
          fontSize={"2em"}
          onChange={(event) => {
            const newFriendlyName = event.target.value;
            setDeviceFriendlyNameState(newFriendlyName);
          }}
          onEditFinish={() => {
            setDeviceFriendlyName(
              props.device.friendly_name,
              deviceFriendlyNameState,
            );
          }}
        />
        <h3>{deviceDescription(deviceDefinition)}</h3>
      </div>

      <div>
        {deviceSettingsGenerator(
          props.device,
          deviceSettingsState,
          setDeviceSettingsState,
        )}
      </div>
    </>
  );
}

export default DeviceSettings;
