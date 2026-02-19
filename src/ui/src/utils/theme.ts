// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const cardHeight = 12;

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

export const StyledHeader = styled.h2`
  color: ${({ theme }) => theme.text};
`;

export const ListWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, ${cardHeight}em), 1fr)
  );
  gap: 1em;
`;

export const Card = styled.div<{ $dimmed?: boolean }>`
  padding: 1em;
  cursor: pointer;
  aspect-ratio: 1;

  border: 1px solid ${({ theme }) => theme.accent};

  opacity: ${(props) => (props.$dimmed ? 0.5 : 1)};

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;
