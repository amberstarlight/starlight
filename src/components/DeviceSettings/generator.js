import Button from '../Button/Button';
import Toggle from '../Toggle/Toggle';
import ColorPicker from '../ColorPicker/ColorPicker';
import Slider from '../Slider/Slider';

import {
  booleanToMqttState,
  hexToRGB,
  hslToRGB,
  mqttStateToBoolean,
  rgbToHex,
  rgbToHSL,
  updateDeviceState,
  stringTidy,
} from '../../utils/deviceUtilities';

export const deviceSettingsGenerator = (
  device,
  deviceSettingsState,
  setDeviceSettingsState
) => {
  const exposes = device.definition.exposes;
  let deviceSettingsList = [];

  for (let feature of exposes[0].features) {
    let settingComponentsArray = [];
    switch (feature.type) {
      case 'binary':
        settingComponentsArray.push(
          <Toggle
            key={feature.name}
            checked={mqttStateToBoolean(deviceSettingsState[feature.name])}
            onChange={(event) => {
              const newMqttState = booleanToMqttState(event.target.checked);
              updateDeviceState(
                deviceSettingsState,
                setDeviceSettingsState,
                device.friendly_name,
                feature.name,
                newMqttState
              );
            }}
          />
        );
        break;

      case 'numeric':
        settingComponentsArray.push(
          <Slider
            key={feature.name}
            label={stringTidy(feature.name)}
            min={feature.value_min || 0}
            max={feature.value_max || 100}
            step={feature.value_step || 1}
            value={deviceSettingsState[feature.name]}
            onChange={(event) => {
              const newMqttValue = event.target.value;
              updateDeviceState(
                deviceSettingsState,
                setDeviceSettingsState,
                device.friendly_name,
                feature.name,
                newMqttValue
              );
            }}
          />
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
                  preset.name
                );
              }}
            ></Button>
          ));

          settingComponentsArray.push(
            <div key={`preset-list-${feature.name}`}>
              <p>Presets for {stringTidy(feature.name)}:</p>
              {presets}
            </div>
          );
        }

        break;

      case 'composite':
        if (feature.name === 'color_hs') {
          let rgb = hslToRGB({
            h: deviceSettingsState.color.hue,
            s: deviceSettingsState.color.saturation / 100,
            l: 0.5,
          });

          settingComponentsArray.push(
            <ColorPicker
              label={'Color'}
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
                  'color',
                  newMqttColor
                );
              }}
            />
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
