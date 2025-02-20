// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import GroupList from "../../components/GroupList/GroupList";
import GroupSettings from "../../components/GroupSettings/GroupSettings";

function Groups(props) {
  const selectedGroup = props.selectedGroup;

  let groupContent = undefined;

  if (!props.groups || !selectedGroup) groupContent = <LoadingSpinner />;

  if (selectedGroup) groupContent = <GroupSettings group={selectedGroup} />;

  if (props.groups && !selectedGroup) {
    groupContent = <GroupList groups={props.groups} />;
  }

  return (
    <>
      <h1>Groups</h1>
      {groupContent !== undefined ? groupContent : ""}
    </>
  );
}

export default Groups;
