// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";
import { StyledText, StyledHeader } from "../../utils/theme";
import { type Group } from "@starlight/types";

const Card = styled.div`
  margin: 2em 0em;
  padding: 1em;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

interface groupCardProps {
  group?: Group;
  icon: string;
  onClick: Function;
}

function GroupCard(props: groupCardProps) {
  if (props.group === undefined) {
    return (
      <Card onClick={props.onClick}>
        <StyledHeader>{props.icon} Create Group</StyledHeader>
        <StyledText>Add a new group</StyledText>
      </Card>
    );
  }

  return (
    <Card onClick={props.onClick}>
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
