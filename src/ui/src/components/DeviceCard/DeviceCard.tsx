// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { deviceDescription } from "../../utils/deviceUtilities";
import styled from "styled-components";
import { StyledText, StyledHeader, Card } from "../../utils/theme";
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

function DeviceCard(props: { device: Device; dimmed: boolean }) {
  let deviceEmoji = "❓";
  const deviceDefinition = props.device.definition;

  if (deviceDefinition && deviceDefinition.exposes.length > 0) {
    deviceEmoji = emojiLookup[deviceDefinition.exposes[0].type];
  }

  return (
    <Card $dimmed={props.dimmed}>
      <StyledHeader>
        {deviceEmoji} {props.device.friendly_name}
      </StyledHeader>
      <StyledText>{deviceDescription(deviceDefinition)}</StyledText>
    </Card>
  );
}

export default DeviceCard;
