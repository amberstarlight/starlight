import styled from 'styled-components';

export const theme = {
  text: '#3C3C3C',
  background: '#E5D4CE',
  accent: '#FD151B',
};

export const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  margin: 0;
  height: 100vh;
  width: 100%;
`;

export const StyledText = styled.p`
  color: ${(props) => props.theme.text};
`;

export const StyledHeader = styled.h1`
  color: ${(props) => props.theme.text};
`;
