// SPDX-FileCopyrightText: © 2022 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";

const prefersDarkTheme = () =>
  matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;

export const useDarkMode = () => {
  const [theme, setTheme] = useState(prefersDarkTheme() ? "dark" : "light");

  useEffect(() => {
    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      (event) => setTheme(event.matches ? "dark" : "light"),
    );
  }, []);

  return [theme, setTheme];
};
