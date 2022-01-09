import styled from 'styled-components';

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
`;

const StyledSlider = styled.input.attrs((props) => ({
  type: 'range',
  disabled: props.disabled || false,
}))`
  -webkit-appearance: none;
  border: none;
  display: block;
  width: 75%;
  height: 1em;
  border-radius: 1em;
  background: rgba(1, 1, 1, 0.25);
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
  margin: 3em 0em;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    background: ${(props) => props.theme.accent};
    cursor: pointer;
  }
`;

function Slider(props) {
  return (
    <SliderContainer>
      {props.label}
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
