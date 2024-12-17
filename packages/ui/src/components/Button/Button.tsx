// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const StyledButton = styled.button`
  font-family: "Lilex Medium", monospace;
  border: none;
  padding: 0.75em 2em;
  background: none;

  display: inline-block;
  margin: 0.5rem;
  color: ${({ theme }) => theme.accent};
  border-radius: 0.25rem;
  border: 1px solid ${(props) => props.theme.accent};
  background: transparent;
  text-align: center;
  transition: background 0.4s;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.accent};
    color: ${(props) => props.theme.background};
  }
`;

function Button(props) {
  return (
    <StyledButton
      className={props.className}
      type={props.type || "button"}
      disabled={props.disabled || false}
      onClick={props.onClick}
    >
      {props.text}
    </StyledButton>
  );
}

export default Button;
