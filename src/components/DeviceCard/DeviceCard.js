import { deviceDescription } from '../../utils/deviceUtilities';

const emojiLookup = {
  light: '💡',
  switch: '🔌',
  fan: '🌡️',
  cover: '🪟',
  lock: '🔒',
  climate: '❄️️',
};

function DeviceCard(props) {
  let deviceEmoji = '❓';
  let deviceDefinition = props.device.definition;

  if (deviceDefinition && deviceDefinition.exposes.length > 0) {
    deviceEmoji = emojiLookup[deviceDefinition.exposes[0].type];
  }

  return (
    <div onClick={props.onClick}>
      <p>{deviceEmoji}</p>
      <p>{props.device.friendly_name}</p>
      <p>{deviceDescription(deviceDefinition)}</p>
    </div>
  );
}

export default DeviceCard;
