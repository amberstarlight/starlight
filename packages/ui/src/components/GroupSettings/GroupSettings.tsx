// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from "react";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import EditableText from "../EditableText/EditableText";
import { deviceSettingsGenerator } from "../DeviceSettings/generator";

const backend = import.meta.env.VITE_API_URL ?? "";

function GroupSettings(props) {
  const [groupSettingsState, setGroupSettingsState] = useState();
  const [groupFriendlyNameState, setGroupFriendlyNameState] = useState(
    props.group.friendly_name,
  );

  useEffect(() => {
    fetch(`${backend}/api/groups/${props.group.id}/state`)
      .then((res) => res.json())
      .then((data) => {
        setGroupSettingsState(data.data);
      });
  }, []);

  if (!groupSettingsState) return <LoadingSpinner />;

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
      <div>
        {deviceSettingsGenerator(
          props.group,
          groupSettingsState,
          setGroupSettingsState,
        )}
      </div>
    </>
  );
}

export default GroupSettings;
