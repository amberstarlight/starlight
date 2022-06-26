// SPDX-License-Identifier: GPL-3.0-or-later

import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
`;

const LdsRipple = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  div {
    position: absolute;
    border: 4px solid ${({ theme }) => theme.text};
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  div:nth-child(2) {
    animation-delay: -0.5s;
  }

  @keyframes lds-ripple {
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
  }
`;

const loadingMessages = [
  'Retrieving server info...',
  'Sending client info...',
  'Reticulating splines...',
  'Loading...',
  'Fetching data...',
  'Zzz...',
];

const pickRandom = (array) => {
  const random = Math.floor(Math.random() * array.length);
  return array[random];
};

function LoadingSpinner() {
  return (
    <Wrapper>
      <LdsRipple>
        <div></div>
        <div></div>
      </LdsRipple>
      {pickRandom(loadingMessages)}
    </Wrapper>
  );
}

export default LoadingSpinner;
