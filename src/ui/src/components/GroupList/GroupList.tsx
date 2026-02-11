// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
import { Link } from "wouter";
import GroupCard from "../GroupCard/GroupCard";
import { type Group } from "@starlight/types";
import { ListWrapper } from "../../utils/theme";

const groupSort = (a: Group, b: Group) => {
  if (a.friendly_name.toLowerCase() > b.friendly_name.toLowerCase()) return 1;
  if (b.friendly_name.toLowerCase() > a.friendly_name.toLowerCase()) return -1;
  return 0;
};

function GroupList(props: { groups: Group[]; onClick?: Function }) {
  return (
    <ListWrapper>
      {props.groups.sort(groupSort).map((group: Group) => (
        <Link href={`/groups/${group.id}`} key={group.id}>
          <GroupCard
            icon="🗂️"
            group={group}
            onClick={props.onClick}
            dimmed={false}
          />
        </Link>
      ))}
      <GroupCard icon="🆕" onClick={() => {}} />
    </ListWrapper>
  );
}

export default GroupList;
