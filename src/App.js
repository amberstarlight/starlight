import { useState } from "react";

import LightbulbCard from './components/LightbulbCard/LightbulbCard';
import DeviceSettings from "./components/DeviceSettings/DeviceSettings";

const devices = [
  {
    name: "Bedside",
    id: "1"
  },
  {
    name: "Outside",
    id: "3"
  },
  {
    name: "Ceiling",
    id: "2"
  }
];

function App() {
  const [selectedDevice, setSelectedDevice] = useState();
  return (
    <div>
      {selectedDevice ?
        <>
          <button onClick={() => setSelectedDevice(undefined)}>Back</button>
          <DeviceSettings
            deviceName={selectedDevice.name}
            deviceType={selectedDevice.deviceType}
          />
        </> : devices.map((element, index) => {
        return (
          <LightbulbCard
            name={element.name}
            id={element.id}
            key={element.id}
            onClick={() => setSelectedDevice(devices[index])}
          />
        )}
      )}
    </div>
  );
}

export default App;
