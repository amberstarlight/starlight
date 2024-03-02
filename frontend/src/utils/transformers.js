// SPDX-FileCopyrightText: © 2022 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import Button from "../components/Button/Button";
import Slider from "../components/Slider/Slider";

import {
  miredToKelvin,
  stringTidy,
  updateDeviceState,
} from "./deviceUtilities";

const percentage = (value, maxValue) => Math.floor((value / maxValue) * 100);

export const numericTransformer = (
  feature,
  device,
  deviceSettingsState,
  setDeviceSettingsState,
) => {
  let componentsArray = [];
  let unit = "%";
  let displayValue = percentage(deviceSettingsState[feature.name], 254);

  if (feature.name.includes("color")) {
    unit = "K";
    displayValue = miredToKelvin(deviceSettingsState[feature.name]);
  }

  componentsArray.push(
    <Slider
      key={feature.name}
      label={stringTidy(feature.name)}
      min={feature.value_min || 0}
      max={feature.value_max || 100}
      step={feature.value_step || 1}
      value={deviceSettingsState[feature.name] || "?"}
      displayUnit={unit}
      displayValue={displayValue}
      onChange={(event) => {
        const newMqttValue = event.target.value;
        updateDeviceState(
          deviceSettingsState,
          setDeviceSettingsState,
          device.friendly_name,
          feature.name,
          newMqttValue,
        );
      }}
    />,
  );

  if (feature.presets) {
    const presets = feature.presets.map((preset) => (
      <Button
        key={`${feature.name}-preset-${preset.name}`}
        text={stringTidy(preset.name)}
        onClick={() => {
          updateDeviceState(
            deviceSettingsState,
            setDeviceSettingsState,
            device.friendly_name,
            feature.name,
            preset.value,
          );
        }}
      ></Button>
    ));

    componentsArray.push(
      <div key={`preset-list-${feature.name}`}>
        <p>Presets for {stringTidy(feature.name)}:</p>
        {presets}
      </div>,
    );
  }

  return componentsArray;
};
