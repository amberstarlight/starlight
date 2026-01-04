// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from "react";
import styled from "styled-components";

const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2em;
`;

interface navigationItems {
  items: ReactElement[];
}

function NavBar(props: navigationItems) {
  return <StyledNav>{props.items}</StyledNav>;
}

export default NavBar;
