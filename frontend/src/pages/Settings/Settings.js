// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as mqttService from "../../services/mqttService";

import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

function Settings(props) {
  let settingsContent = undefined;

  if (!props.bridgeState) {
    settingsContent = <LoadingSpinner />;
  }

  if (props.bridgeState) {
    const permitJoin = props.bridgeState.permit_join;

    settingsContent = (
      <>
        {permitJoin === true ? (
          <>
            <p>Devices can join.</p>
            <Button
              text={"Disable Join"}
              onClick={() => {
                mqttService.sendMqttMessage(
                  "zigbee2mqtt/bridge/request/permit_join",
                  { value: false },
                );
              }}
            />
          </>
        ) : (
          <>
            <p>Devices cannot join.</p>
            <Button
              text={"Permit Join"}
              onClick={() => {
                mqttService.sendMqttMessage(
                  "zigbee2mqtt/bridge/request/permit_join",
                  { value: true },
                );
              }}
            />
          </>
        )}
      </>
    );
  }

  return <>{settingsContent !== undefined ? settingsContent : ""}</>;
}

export default Settings;
