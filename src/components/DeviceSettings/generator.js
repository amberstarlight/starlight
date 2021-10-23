import Checkbox from '../Checkbox/Checkbox';
import Slider from '../Slider/Slider';
import { mqttStateToBoolean, booleanToMqttState, updateDeviceState } from './utils';

export const deviceSettingsGenerator = (device, deviceSettingsState, setDeviceSettingsState) => {
  if (!device || !device.definition || !device.definition.exposes) 
    return <p>This device exposes nothing that can be controlled.</p>;

  const exposes = device.definition.exposes;
  let deviceSettingsList = [];

  for (let feature of exposes[0].features) {
    let settingComponent;
    switch (feature.type) {
    case 'binary':
      settingComponent = <Checkbox label={feature.name} checked={mqttStateToBoolean(deviceSettingsState[feature.name])} onChange={(event) => {
        const newMqttState = booleanToMqttState(event.target.checked);
        updateDeviceState(deviceSettingsState, setDeviceSettingsState, device.friendly_name, feature.name, newMqttState);
      }} />;
      break;
      
    case 'numeric':
      settingComponent = <Slider label={feature.name} min={feature.value_min || 0} max={feature.value_max || 100} step={feature.value_step || 1} value={deviceSettingsState[feature.name]} onChange={(event) => {
        const newMqttValue = event.target.value;
        updateDeviceState(deviceSettingsState, setDeviceSettingsState, device.friendly_name, feature.name, newMqttValue);
      }} />;
      break;
    
    default:
        
      break;
    }
    deviceSettingsList.push(settingComponent);
  }

  return deviceSettingsList;
};
