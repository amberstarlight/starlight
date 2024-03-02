// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

function ColorPicker(props) {
  return (
    <>
      <label>
        {props.label}
        <input type="color" value={props.value} onChange={props.onChange} />
      </label>
      <p>{props.value}</p>
    </>
  );
}

export default ColorPicker;
