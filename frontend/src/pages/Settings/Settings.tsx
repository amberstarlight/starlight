// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

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
            <Button text={"Disable Join"} onClick={() => {}} />
          </>
        ) : (
          <>
            <p>Devices cannot join.</p>
            <Button text={"Permit Join"} onClick={() => {}} />
          </>
        )}
      </>
    );
  }

  return <>{settingsContent !== undefined ? settingsContent : ""}</>;
}

export default Settings;
