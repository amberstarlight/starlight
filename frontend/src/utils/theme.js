// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const colours = {
  platinum: "#E7E5E5",
  violet: "#6F73D2",
  deepGrey: "#18181B",
  midGrey: "#3C3C3C",
  red: "#FD151B",
  spaceBlue: "#2B3A67",
};

export const lightTheme = {
  text: colours.deepGrey,
  background: colours.platinum,
  accent: colours.violet,
  shadow: "rgba(0, 0, 0, 0.25)",
  hover: "rgba(0, 0, 0, 0.05)",
};

export const darkTheme = {
  text: colours.platinum,
  background: colours.deepGrey,
  accent: colours.red,
  shadow: "rgba(0, 0, 0, 0.5)",
  hover: "rgba(255, 255, 255, 0.05)",
};

export const StyledText = styled.p`
  color: ${({ theme }) => theme.text};
`;

export const StyledHeader = styled.h1`
  color: ${({ theme }) => theme.text};
`;
