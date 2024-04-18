// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";
import { StyledText, StyledHeader } from "../../utils/theme";

import { type Group } from "../../../../types/zigbee_types";

const Card = styled.div`
  margin: 2em 0em;
  padding: 1em;
  cursor: pointer;
  border-radius: 2rem;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

function GroupCard(props: { group: Group; onClick: Function }) {
  return (
    <Card onClick={props.onClick}>
      <StyledHeader>{props.group.friendly_name}</StyledHeader>
      <StyledText>{`${props.group.members.length} devices`}</StyledText>
    </Card>
  );
}

export default GroupCard;
