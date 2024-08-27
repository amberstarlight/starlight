// SPDX-FileCopyrightText: © 2022 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.shadow};
  transition: 0.4s;
  border-radius: 1em;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: ${({ theme }) => theme.background};
    transition: 0.4s;
    border-radius: 50%;
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
    <Switch>
      {props.label}
      <input
        type={"checkbox"}
        checked={props.checked}
        onChange={props.onChange}
      />
      <Slider></Slider>
    </Switch>
  );
}

export default Toggle;
