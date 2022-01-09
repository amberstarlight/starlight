import styled from 'styled-components';

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
  background-color: rgba(1,1,1,0.25);
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 1em;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + & {
    background-color: ${(props) => props.theme.accent};
  }

  input:checked + &:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
`;

function Toggle(props) {
  return (
    <Switch>
      <input
        type={'checkbox'}
        checked={props.checked}
        onChange={props.onChange}
      />
      <Slider></Slider>
    </Switch>
  );
}

export default Toggle;
