// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";

import {
  mqttStateToBoolean,
  booleanToMqttState,
  updateGroupState,
} from "../../utils/deviceUtilities";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import EditableText from "../EditableText/EditableText";
import Toggle from "../Toggle/Toggle";

const backend = import.meta.env.VITE_API_URL ?? "";

function GroupSettings(props) {
  const [groupSettingsState, setGroupSettingsState] = useState();
  const [groupFriendlyNameState, setGroupFriendlyNameState] = useState(
    props.group.friendly_name,
  );

  const fetchGroupState = () => {
    fetch(`${backend}/api/groups/${props.group.id}/state`)
      .then((res) => res.json())
      .then((data) => setGroupSettingsState(data.data));
  };

  useEffect(() => {
    fetchGroupState();
  }, []);

  if (!groupSettingsState) return <LoadingSpinner />;

  const groupSettingsGenerator = (groupSettingsState, callback) => {
    const settingComponents = [];

    for (const setting in groupSettingsState) {
      switch (setting) {
        case "state":
          settingComponents.push(
            <Toggle
              key={"state"}
              checked={mqttStateToBoolean(groupSettingsState[setting])}
              onChange={(event) => {
                const newMqttState = booleanToMqttState(event.target.checked);
                updateGroupState(props.group.id, setting, newMqttState).then(
                  callback,
                );
              }}
            />,
          );
          break;
        default:
          break;
      }
    }
    return settingComponents;
  };

  return (
    <>
      <div>
        <EditableText
          text={groupFriendlyNameState}
          fontSize={"2em"}
          onChange={(event) => {
            const newFriendlyName = event.target.value;
            setGroupFriendlyNameState(newFriendlyName);
          }}
          // onEditFinish={() => {
          //   setGroupFriendlyName(
          //     props.group.friendly_name,
          //     groupFriendlyNameState,
          //   );
          // }}
        />
      </div>
      <div>{groupSettingsGenerator(groupSettingsState, fetchGroupState)}</div>
    </>
  );
}

export default GroupSettings;
