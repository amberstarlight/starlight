import Slider from '../Slider/Slider';
import Checkbox from '../Checkbox/Checkbox';

const deviceSettingsGenerator = (device) => {
  if (!device || !device.definition || !device.definition.exposes) 
    return <p>This device exposes nothing that can be controlled.</p>;

  const exposes = device.definition.exposes;
  let deviceSettingsList = [];

  for (let feature of exposes[0].features) {
    let settingComponent;
    switch (feature.type) {
    case 'binary':
      settingComponent = <Checkbox label={feature.name} checked={false}/>;
      break;
      
    case 'numeric':
      settingComponent = <Slider label={feature.name} min={feature.value_min || 0} max={feature.value_max || 100} step={feature.value_step || 1}/>;
      break;
    
    default:
        
      break;
    }
    deviceSettingsList.push(settingComponent);
  }

  return deviceSettingsList;
};

function DeviceSettings(props) {
  let deviceDefinition = props.device.definition;

  return (
    <>
      <h2>{props.device.friendly_name}</h2>
      <h4>{deviceDefinition ? `${deviceDefinition.vendor} ${deviceDefinition.model}` : 'Unknown'}</h4>

      {deviceSettingsGenerator(props.device)}

    </>
  );
}

export default DeviceSettings;

// definition.exposes[0].type tells us what it is
// light, fan, switch, etc.

// definition.exposes[0].features is an array of controls
// each control should have a name

// {
//   "type":"numeric",
//   "name":"brightness",
//   "property":"brightness",
//   "value_min":0,
//   "value_max":254,
//   "access":7
// }

// access tells us if the property is 'settable' - we can report data
// but not allow the user to modify
