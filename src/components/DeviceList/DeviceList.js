import DeviceCard from '../DeviceCard/DeviceCard';

function DeviceList(props) {
  return (
    <div>
      {props.devices.map((device) => (
        <DeviceCard
          device={device}
          key={device.ieee_address}
          onClick={() => props.onClick(device)}
        />
      ))}
    </div>
  );
}

export default DeviceList;
