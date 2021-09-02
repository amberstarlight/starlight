import { useState } from 'react';

import Slider from '../Slider/Slider';
import Checkbox from "../Checkbox/Checkbox";

function DeviceSettings(props) {
  const [deviceState, setDeviceState] = useState({
    powered: false,
    colourTemp: 2700,
    brightness: 0
  });

  return (
    <>
      <h2>{props.deviceName}</h2>
      <h4>{props.deviceType}</h4>

      <Checkbox
        label="Power"
        checked={deviceState.powered}
        onChange={(event) => {
          setDeviceState({
            ...deviceState,
            powered: event.target.checked
          })
        }}
      />

      <Slider
        label="Colour Temperature"
        min="2700"
        max="5000"
        step="100"
        value={deviceState.colourTemp}
        onChange={(event) => {
          setDeviceState({
            ...deviceState,
            colourTemp: event.target.value
          })
        }}
      />
      
      <Slider
        label="Brightness"
        min="0"
        max="100"
        step="1"
        value={deviceState.brightness}
        onChange={(event) => {
          setDeviceState({
            ...deviceState,
            brightness: event.target.value
          })
        }}
      />
    </>
  )
}

export default DeviceSettings;