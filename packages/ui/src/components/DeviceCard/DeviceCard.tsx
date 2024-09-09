// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { deviceDescription } from "../../utils/deviceUtilities";
import styled from "styled-components";
import { StyledText, StyledHeader } from "../../utils/theme";
import { type Device } from "@starlight/types";

const emojiLookup = {
  numeric: "📶",
  climate: "❄️️",
  cover: "🪟",
  fan: "🌡️",
  light: "💡",
  lock: "🔒",
  switch: "🔌",
};

const Card = styled.div`
  margin: 2em 0em;
  padding: 1em;
  cursor: pointer;
  border-radius: 2rem;

  opacity: ${(props) => (props.$dimmed ? 1 : 0.5)};

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

function DeviceCard(props: {
  device: Device;
  onClick: Function;
  dimmed: boolean;
}) {
  let deviceEmoji = "❓";
  const deviceDefinition = props.device.definition;

  if (deviceDefinition && deviceDefinition.exposes.length > 0) {
    deviceEmoji = emojiLookup[deviceDefinition.exposes[0].type];
  }

  return (
    <Card onClick={props.onClick} $dimmed={props.dimmed}>
      <StyledHeader>
        {deviceEmoji} {props.device.friendly_name}
      </StyledHeader>
      <StyledText>{deviceDescription(deviceDefinition)}</StyledText>
    </Card>
  );
}

export default DeviceCard;
