import styled, { css } from 'styled-components';

const StyledButton = styled.button`
  display: inline-block;
  padding: 0.75rem 2rem;
  margin: 0.5rem;
  min-width: 5rem;
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.background};
  border-radius: 2rem;
  border: 1px solid ${(props) => props.theme.text};
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  background: transparent;

  &:hover {
    cursor: pointer;
  }

  ${(props) =>
    props.mono &&
    css`
      font-family: monospace;
    `}
`;

function Button(props) {
  return (
    <StyledButton
      className={props.className}
      type={props.type || 'button'}
      disabled={props.disabled || false}
      onClick={props.onClick}
    >
      {' '}
      {props.text}{' '}
    </StyledButton>
  );
}

export default Button;
