// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const StyledButton = styled.button`
  font-family: "Lilex Medium", monospace;
  border: none;
  padding: 0.75em 2em;
  margin-right: 0.5em;
  background: none;

  display: inline-block;
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${(props) => props.theme.accent};
  background: transparent;
  text-align: center;
  transition: background 0.4s;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.accent};
    color: ${(props) => props.theme.background};
  }

  &:is(:last-child):not(:first-child) {
    margin-right: 0;
  }
`;

function Button(props) {
  return (
    <StyledButton
      type={props.type || "button"}
      disabled={props.disabled || false}
      onClick={props.onClick}
    >
      {props.text}
    </StyledButton>
  );
}

export default Button;
