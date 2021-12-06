import { useState, useEffect } from 'react';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {
  getDeviceSettings,
  setDeviceFriendlyName,
} from '../../services/mqttService';
import { deviceSettingsGenerator } from './generator';
import EditableText from '../EditableText/EditableText';
import { deviceDescription } from '../../utils/deviceUtilities';

import styled from 'styled-components';

const EditableHeader = styled(EditableText)`
  font-weight: bold;
  font-size: 2rem;
`;

function DeviceSettings(props) {
  const [deviceSettingsState, setDeviceSettingsState] = useState();
  const [deviceFriendlyNameState, setDeviceFriendlyNameState] = useState(
    props.device.friendly_name
  );

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
        <EditableHeader
          text={deviceFriendlyNameState}
          onChange={(event) => {
            const newFriendlyName = event.target.value;
            setDeviceFriendlyNameState(newFriendlyName);
          }}
          onEditFinish={() => {
            setDeviceFriendlyName(
              props.device.friendly_name,
              deviceFriendlyNameState
            );
          }}
        />
        <h4>{deviceDescription(deviceDefinition)}</h4>
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
