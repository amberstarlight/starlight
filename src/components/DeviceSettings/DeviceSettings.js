import { useState, useEffect } from 'react';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { getDeviceSettings } from '../../services/mqttService';
import { deviceSettingsGenerator } from './generator';

function DeviceSettings(props) {
  const [deviceSettingsState, setDeviceSettingsState] = useState();
  const features = props.device.definition.exposes[0].features;

  useEffect(() => {
    let propertiesArray = features.map((feature) => feature.name);
    getDeviceSettings(props.device.friendly_name, propertiesArray).then(setDeviceSettingsState);
  },[]);

  if (!deviceSettingsState) return (
    <>
      <LoadingSpinner/>
      <p>Reticulating Splines...</p>
    </>
  );

  let deviceDefinition = props.device.definition;

  return (
    <>
      <h2>{props.device.friendly_name}</h2>
      <h4>{deviceDefinition ? `${deviceDefinition.vendor} ${deviceDefinition.model}` : 'Unknown'}</h4>

      {deviceSettingsGenerator(props.device, deviceSettingsState, setDeviceSettingsState)}
    </>
  );
}

export default DeviceSettings;
