// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from "styled-components";

const SliderContainer = styled.label`
  display: grid;

  @media only screen and (max-width: 500px) {
    grid-template-columns: [setting-name] 25% [slider] 50% [value] 25%;
  }

  @media only screen and (min-width: 768px) {
    grid-template-columns: [setting-name] 15% [slider] 75% [value] 10%;
  }

  span,
  output {
    align-self: center;
  }

  input {
    width: auto;
  }

  output {
    justify-self: end;
  }
`;

const StyledSlider = styled.input.attrs((props) => ({
  type: "range",
  disabled: props.disabled || false,
}))`
  appearance: none;
  border: none;
  display: block;
  width: 75%;
  height: 1em;
  border-radius: 1em;
  background: ${({ theme }) => theme.shadow};
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  margin: 3em 0em;

  &::-moz-range-track {
    background: transparent;
    border: 0px;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    border: none;
    background: ${({ theme }) => theme.accent};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    appearance: none;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    border: none;
    background: ${({ theme }) => theme.accent};
    cursor: pointer;
  }
`;

function Slider(props) {
  return (
    <SliderContainer>
      <span>{props.label}</span>
      <StyledSlider
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={props.onChange}
      />
      <output>
        {props.displayValue || props.value}
        {props.displayUnit}
      </output>
    </SliderContainer>
  );
}

export default Slider;
