// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from "react";
import styled from "styled-components";

const StyledEditable = styled.input`
  background: transparent;
  border: none;

  font-family: "rubikregular", sans-serif;
  font-size: 2em;

  height: 48px;
  margin-bottom: 1em;
  padding: 10px 0px;
  width: auto;

  text-align: left;

  &:read-only {
    border-bottom: 2px solid ${(props) => props.theme.shadow};
  }

  &:read-write {
    border-bottom: 2px solid ${(props) => props.theme.accent};
  }

  &:focus {
    outline: none;
  }

  transition: all 0.15s ease;
`;

interface EditableTextProps {
  text: string;
  onChange: Function;
  onEditFinish: Function;
}

function EditableText(props: EditableTextProps) {
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState(props.text);

  const handleBlur = (event) => {
    setEditable(false);
    console.log(event.target.defaultValue);
  };

  const handleFocus = () => {
    setEditable(true);
  };

  return (
    <StyledEditable
      value={value}
      onChange={props.onChange}
      readOnly={!editable}
      onBlur={handleBlur}
      onFocus={handleFocus}
    ></StyledEditable>
  );
}

export default EditableText;
