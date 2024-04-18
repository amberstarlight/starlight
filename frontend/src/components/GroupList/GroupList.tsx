// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from "wouter";
import GroupCard from "../GroupCard/GroupCard";
import { type Group } from "../../../../types/zigbee_types";

function GroupList(props: { groups: Group[]; onClick?: Function }) {
  return (
    <div>
      {props.groups.map((group: Group) => (
        <Link href={`/groups/${group.id}`} key={group.id}>
          <GroupCard group={group} onClick={() => props.onClick} />
        </Link>
      ))}
    </div>
  );
}

export default GroupList;
