// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';

const prefersDarkTheme = () =>
  matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;

export const useDarkMode = () => {
  const [theme, setTheme] = useState(prefersDarkTheme() ? 'dark' : 'light');

  useEffect(() => {
    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      (event) => setTheme(event.matches ? 'dark' : 'light')
    );
  }, []);

  return [theme, setTheme];
};
