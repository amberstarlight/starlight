// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";
import { StyledText, StyledHeader, Card } from "../../utils/theme";
import { type Group } from "@starlight/types";

interface groupCardProps {
  group?: Group;
  icon: string;
  onClick: Function;
  dimmed?: Boolean;
}

function GroupCard(props: groupCardProps) {
  if (props.group === undefined) {
    return (
      <Card onClick={props.onClick} dimmed={"false"}>
        <StyledHeader>{props.icon} Create Group</StyledHeader>
        <StyledText>Add a new group</StyledText>
      </Card>
    );
  }

  return (
    <Card onClick={props.onClick} dimmed={"false"}>
      <StyledHeader>
        {props.icon} {props.group.friendly_name}
      </StyledHeader>
      <StyledText>{`${props.group.members.length} device${
        props.group.members.length !== 1 ? "s" : ""
      }`}</StyledText>
    </Card>
  );
}

export default GroupCard;
