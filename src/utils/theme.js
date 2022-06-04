import styled from 'styled-components';

const colours = {
  platinum: '#E7E5E5',
  violet: '#6F73D2',
  deepGrey: '#18181B',
  midGrey: '#3C3C3C',
  red: '#FD151B',
  spaceBlue: '#2B3A67',
};

export const lightTheme = {
  text: colours.deepGrey,
  background: colours.platinum,
  accent: colours.violet,
};

export const darkTheme = {
  text: colours.platinum,
  background: colours.deepGrey,
  accent: colours.red,
};

export const StyledText = styled.p`
  color: ${(props) => props.theme.text};
`;

export const StyledHeader = styled.h1`
  color: ${(props) => props.theme.text};
`;
