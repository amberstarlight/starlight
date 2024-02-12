// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import {
  getDeviceSettings,
  setDeviceFriendlyName,
} from "../../services/mqttService";
import { deviceSettingsGenerator } from "./generator";
import EditableText from "../EditableText/EditableText";
import { deviceDescription } from "../../utils/deviceUtilities";

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

    getDeviceSettings(props.device.friendly_name, properties).then(
      setDeviceSettingsState,
    );
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
