// SPDX-FileCopyrightText: © 2022 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import "../../font.css";
import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html,
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};

    font-family: "Lilex Regular", monospace;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    margin: 0;
    transition: background 0.5s linear, color 0.5s linear;
  }

  h3 {
    margin-bottom: 1.5em;
  }
`;
