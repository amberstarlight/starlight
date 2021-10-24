import { setDeviceSettings } from '../../services/mqttService';

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
