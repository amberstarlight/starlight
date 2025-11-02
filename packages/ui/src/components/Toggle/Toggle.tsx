// SPDX-FileCopyrightText: © 2022 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const ToggleContainer = styled.label`
  display: grid;
  grid-template-columns: [setting-name] 15% [value] 0% auto;
  align-items: center;

  input {
    visibility: hidden;
    justify-self: baseline;
  }
`;

const Slider = styled.span`
  --toggle-width: 60px;
  --toggle-height: 34px;
  --slider-width: 26px;
  --slider-height: 26px;

  position: relative;
  width: var(--toggle-width);
  height: var(--toggle-height);
  cursor: pointer;
  background-color: ${({ theme }) => theme.shadow};
  transition: 0.4s;
  border-radius: 0.5em;

  &:before {
    display: block;
    position: relative;
    content: "";
    margin: calc((var(--toggle-height) - var(--slider-height)) / 2);
    height: var(--slider-height);
    width: var(--slider-width);
    background-color: ${({ theme }) => theme.background};
    transition: 0.4s;
    border-radius: 25%;
  }

  input:checked + && {
    background-color: ${({ theme }) => theme.accent};
  }

  input:checked + &:before {
    transform: translateX(26px);
  }
`;

function Toggle(props: {
  label: string;
  checked: boolean;
  onChange: Function;
}) {
  return (
    <ToggleContainer>
      <span>{props.label}</span>
      <input
        type={"checkbox"}
        checked={props.checked}
        onChange={props.onChange}
      />
      <Slider></Slider>
    </ToggleContainer>
  );
}

export default Toggle;
