import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
 html,
 body {
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font: 18px 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  height: 100vh;
  width: 100%;

  transition: background 0.5s linear,
              color 0.5s linear;
 }
`;
