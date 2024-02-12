// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const StyledButton = styled.button`
  display: inline-block;
  padding: 0.75rem 2rem;
  margin: 0.5rem;
  min-width: 5rem;
  color: ${({ theme }) => theme.text};
  border-radius: 2rem;
  border: 1px solid ${(props) => props.theme.text};
  font:
    0.8em "rubikregular",
    sans-serif;
  background: transparent;
  text-align: center;
  transition: background 0.4s;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.hover};
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
