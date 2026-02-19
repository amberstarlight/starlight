// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";
import { useLocation } from "wouter";

import {
  mqttStateToBoolean,
  booleanToMqttState,
  updateGroupState,
  percentage,
} from "../../utils/deviceUtilities";
import Button from "../Button/Button";
import EditableText from "../EditableText/EditableText";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import Slider from "../Slider/Slider";
import Toggle from "../Toggle/Toggle";

import { type Group } from "@starlight/types";
import { readableNames } from "../../utils/transformers";

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

  const updateGroupName = async (newName: string) => {
    const request = new Request(`${backend}/api/groups/${props.group.id}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    });
    fetch(request)
      .then((res) => res.json())
      .then((data) => console.log(data));
  };
  const [location, navigate] = useLocation();

  useEffect(() => {
    fetchGroupState();
  }, []);

  const deleteButton = (
    <Button
      text={"❌ Remove Group"}
      onClick={() => {
        const request = new Request(`${backend}/api/groups/${props.group.id}`, {
          method: "DELETE",
        });
        fetch(request)
          .then((res) => res.json())
          .then((data) => console.log(data))
          .finally(() => navigate("/groups"));
        // we also want to refresh the groups list but this works for now
      }}
    />
  );

  if (!groupSettingsState)
    return (
      <>
        <LoadingSpinner />
        {deleteButton}
      </>
    );

  const groupSettingsGenerator = (groupSettingsState, callback) => {
    const settingComponents = [];

    // the API doesn't give us data yet about how we should transform the state
    // values, so to get this working initially we can hardcode what we expect

    for (const setting in groupSettingsState) {
      switch (setting) {
        case "state":
          settingComponents.push(
            <Toggle
              key={"state"}
              label={readableNames["state"]}
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
        case "brightness":
          settingComponents.push(
            <Slider
              key={"brightness"}
              label={"Brightness"}
              min={1}
              max={254}
              step={1}
              value={groupSettingsState[setting]}
              displayUnit={"%"}
              displayValue={percentage(groupSettingsState[setting], 254)}
              onChange={(event) => {
                const newMqttValue = event.target.value;
                updateGroupState(props.group.id, setting, newMqttValue).then(
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

    // i want "State" to be first, so here's a tiny hack
    return settingComponents.reverse();
  };

  return (
    <>
      <div>
        <EditableText
          label="Friendly Name"
          text={groupFriendlyNameState}
          onChange={(event) => {
            const newFriendlyName = event.target.value;
            setGroupFriendlyNameState(newFriendlyName);
          }}
          onBlur={updateGroupName(groupFriendlyNameState)}
        />
      </div>
      <div>{groupSettingsGenerator(groupSettingsState, fetchGroupState)}</div>
      <div>
        <p>{`${props.group.members.length} devices`}</p>
        {/* TODO: list all the group members */}
      </div>
      <div>{deleteButton}</div>
    </>
  );
}

export default GroupSettings;
