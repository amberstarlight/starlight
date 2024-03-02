// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { deviceDescription } from "../../utils/deviceUtilities";
import styled from "styled-components";
import { StyledText, StyledHeader } from "../../utils/theme";

const emojiLookup = {
  light: "💡",
  switch: "🔌",
  fan: "🌡️",
  cover: "🪟",
  lock: "🔒",
  climate: "❄️️",
};

const Card = styled.div`
  margin: 2em 0em;
  padding: 1em;
  cursor: pointer;
  border-radius: 2rem;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

function DeviceCard(props) {
  let deviceEmoji = "❓";
  let deviceDefinition = props.device.definition;

  if (deviceDefinition && deviceDefinition.exposes.length > 0) {
    deviceEmoji = emojiLookup[deviceDefinition.exposes[0].type];
  }

  return (
    <Card onClick={props.onClick}>
      <StyledHeader>
        {deviceEmoji} {props.device.friendly_name}
      </StyledHeader>
      <StyledText>{deviceDescription(deviceDefinition)}</StyledText>
    </Card>
  );
}

export default DeviceCard;
