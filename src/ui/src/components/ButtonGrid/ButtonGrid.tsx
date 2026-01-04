// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from "react";
import styled from "styled-components";

const StyledButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9%, 1fr));
`;

interface buttons {
  buttons: ReactElement[];
}

function ButtonGrid(props: buttons) {
  return <StyledButtonGrid>{props.buttons}</StyledButtonGrid>;
}

export default ButtonGrid;
