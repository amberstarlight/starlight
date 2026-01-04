// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

export const themeColours = {
  text: "rgb(21, 21, 21)",
  background: "rgb(245, 249, 233)",
  accent: "rgb(204, 40, 81)",
  shadow: "rgba(0, 0, 0, 0.25)",
  hover: "rgba(0, 0, 0, 0.05)",
};

export const darkThemeColours = {
  text: "rgb(208, 208, 208)",
  background: "rgb(21, 21, 21)",
  accent: "rgb(139, 114, 238)",
  shadow: "rgba(0, 0, 0, 0.5)",
  hover: "rgba(255, 255, 255, 0.05)",
};

export const StyledText = styled.p`
  color: ${({ theme }) => theme.text};
`;

export const StyledHeader = styled.h1`
  color: ${({ theme }) => theme.text};
`;
