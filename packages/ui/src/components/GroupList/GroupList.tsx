// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from "wouter";
import GroupCard from "../GroupCard/GroupCard";
import { type Group } from "@starlight/types";

const groupSort = (a: Group, b: Group) => {
  if (a.friendly_name > b.friendly_name) return 1;
  if (b.friendly_name > a.friendly_name) return -1;
  return 0;
};

function GroupList(props: { groups: Group[]; onClick?: Function }) {
  return (
    <div>
      {props.groups.sort(groupSort).map((group: Group) => (
        <Link href={`/groups/${group.id}`} key={group.id}>
          <GroupCard group={group} onClick={props.onClick} />
        </Link>
      ))}
    </div>
  );
}

export default GroupList;
