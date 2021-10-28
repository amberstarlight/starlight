import { useState, useEffect } from 'react';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { getDeviceSettings } from '../../services/mqttService';
import { deviceSettingsGenerator } from './generator';

function DeviceSettings(props) {
  const [deviceSettingsState, setDeviceSettingsState] = useState();

  if (!props.device.supported)
    return <p>This device exposes nothing that can be controlled.</p>;

  const features = props.device.definition.exposes[0].features;

  useEffect(() => {
    let properties = {};

    features.forEach((property) => {
      properties[property.name] = '';
    });

    getDeviceSettings(props.device.friendly_name, properties).then(
      setDeviceSettingsState
    );
  }, []);

  if (!deviceSettingsState)
    return (
      <>
        <LoadingSpinner />
        <p>Reticulating Splines...</p>
      </>
    );

  let deviceDefinition = props.device.definition;

  return (
    <>
      <div>
        <h2>{props.device.friendly_name}</h2>
        <h4>
          {deviceDefinition
            ? `${deviceDefinition.vendor} ${deviceDefinition.model}`
            : 'Unknown'}
        </h4>
      </div>

      <div>
        <p>Device Settings</p>
        {deviceSettingsGenerator(
          props.device,
          deviceSettingsState,
          setDeviceSettingsState
        )}
      </div>
    </>
  );
}

export default DeviceSettings;
