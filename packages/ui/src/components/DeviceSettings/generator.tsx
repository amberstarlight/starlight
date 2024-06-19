// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  mqttStateToBoolean,
  booleanToMqttState,
  hexToRGB,
  hslToRGB,
  rgbToHSL,
  rgbToHex,
  updateDeviceState,
} from "../../utils/deviceUtilities";
import { numericTransformer } from "../../utils/transformers";
import Toggle from "../Toggle/Toggle";
import ColorPicker from "../ColorPicker/ColorPicker";

import { type Device } from "@starlight/types";

export const deviceSettingsGenerator = (
  device: Device,
  deviceSettingsState,
  setDeviceSettingsState,
) => {
  const exposes = device.definition.exposes;
  const deviceSettingsList = [];

  for (const feature of exposes[0].features) {
    const settingComponentsArray = [];
    switch (feature.type) {
      case "binary":
        settingComponentsArray.push(
          <Toggle
            key={feature.name}
            checked={mqttStateToBoolean(deviceSettingsState[feature.name])}
            onChange={(event) => {
              const newMqttState = booleanToMqttState(event.target.checked);
              updateDeviceState(
                device.ieee_address,
                feature.name,
                newMqttState,
              ).then((res) => console.log(deviceSettingsState));
            }}
          />,
        );
        break;

      case "numeric":
        settingComponentsArray.push(
          numericTransformer(
            feature,
            device,
            deviceSettingsState,
            setDeviceSettingsState,
          ),
        );

        break;

      case "composite":
        if (feature.name === "color_hs") {
          const rgb = hslToRGB({
            h: deviceSettingsState.color.hue,
            s: deviceSettingsState.color.saturation / 100,
            l: 0.5,
          });

          settingComponentsArray.push(
            <ColorPicker
              label={"Color"}
              key={feature.name}
              value={rgbToHex(rgb)}
              onChange={(event) => {
                const hex = event.target.value;
                const rgb = hexToRGB(hex);
                const hsl = rgbToHSL(rgb);
                const newMqttColor = {
                  hue: hsl.h,
                  saturation: hsl.s * 100,
                  lightness: hsl.l * 100,
                };

                updateDeviceState(
                  deviceSettingsState,
                  setDeviceSettingsState,
                  device.friendly_name,
                  "color",
                  newMqttColor,
                );
              }}
            />,
          );
        }

        break;

      default:
        break;
    }
    deviceSettingsList.push(settingComponentsArray);
  }

  return deviceSettingsList;
};
