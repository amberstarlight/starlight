// SPDX-License-Identifier: AGPL-3.0-or-later

import { setDeviceSettings } from '../services/mqttService';

export const mqttStateToBoolean = (state) => {
  if (state === 'ON') return true;
  return false;
};

export const booleanToMqttState = (boolean) => {
  if (boolean) return 'ON';
  return 'OFF';
};

export const updateDeviceState = (
  deviceSettingsState,
  setDeviceSettingsState,
  deviceFriendlyName,
  property,
  value
) => {
  const updateObject = {};
  updateObject[property] = value;
  setDeviceSettings(deviceFriendlyName, updateObject);

  const clonedState = { ...deviceSettingsState };
  clonedState[property] = value;
  setDeviceSettingsState(clonedState);
};

export const deviceDescription = (deviceDefinition) => {
  if (deviceDefinition)
    return `${deviceDefinition.vendor} ${deviceDefinition.description}`;

  return 'Unknown';
};

export const hexToRGB = (hexValue) => {
  if (hexValue.startsWith('#')) {
    hexValue = hexValue.slice(1);
  }

  const rgb = {
    r: parseInt(hexValue.substr(0, 2), 16),
    g: parseInt(hexValue.substr(2, 2), 16),
    b: parseInt(hexValue.substr(4, 2), 16),
  };

  return rgb;
};

const byteToHex = (byte) => {
  byte = Math.round(byte);
  let hex = byte.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const rgbToHex = (rgb) => {
  const hex = byteToHex(rgb.r) + byteToHex(rgb.g) + byteToHex(rgb.b);
  return `#${hex}`;
};

export const rgbToHSL = (rgb) => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const xMax = Math.max(r, g, b);
  const xMin = Math.min(r, g, b);
  const c = xMax - xMin;
  const l = (xMax + xMin) / 2;

  let h;
  let s;

  if (c === 0) {
    h = 0;
  } else {
    if (xMax === r) h = 60 * ((g - b) / c);
    if (xMax === g) h = 60 * (2 + (b - r) / c);
    if (xMax === b) h = 60 * (4 + (r - g) / c);
  }

  if (h < 0) h += 360;

  if (h > 360) h -= 360;

  if (l === 0 || l === 1) {
    s = 0;
  } else {
    s = c / (1 - Math.abs(2 * xMax - c - 1));
  }

  return {
    h: h,
    s: s,
    l: l,
  };
};

export const hslToRGB = (hsl) => {
  const c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
  const normalisedHue = hsl.h / 60;
  const x = c * (1 - Math.abs((normalisedHue % 2) - 1));

  let r1, g1, b1;

  const inRange = (value, min, max) => min <= value && value < max;

  if (normalisedHue === undefined) (r1 = 0), (g1 = 0), (b1 = 0);
  if (inRange(normalisedHue, 0, 1)) (r1 = c), (g1 = x), (b1 = 0);
  if (inRange(normalisedHue, 1, 2)) (r1 = x), (g1 = c), (b1 = 0);
  if (inRange(normalisedHue, 2, 3)) (r1 = 0), (g1 = c), (b1 = x);
  if (inRange(normalisedHue, 3, 4)) (r1 = 0), (g1 = x), (b1 = c);
  if (inRange(normalisedHue, 4, 5)) (r1 = x), (g1 = 0), (b1 = c);
  if (inRange(normalisedHue, 5, 6)) (r1 = c), (g1 = 0), (b1 = x);

  const m = hsl.l - c / 2;

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255,
  };
};

export const miredToKelvin = (mired) => {
  return Math.round(1000000 / mired);
};

export const kelvinToMired = (kelvin) => {
  return Math.round(1000000 / kelvin);
};

export const stringTidy = (string) => {
  return string
    .replace(/[^0-9a-z]/gi, ' ')
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
