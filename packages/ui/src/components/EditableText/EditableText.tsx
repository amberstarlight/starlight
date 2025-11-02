// SPDX-FileCopyrightText: © 2021 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from "react";
import styled from "styled-components";

const StyledEditable = styled.input`
  background: transparent;
  border: none;
  color: ${(props) => props.theme.text};

  font-family: "Lilex Medium", monospace;
  font-size: 2em;

  height: 48px;
  margin-bottom: 1em;
  padding: 10px 0px;
  width: auto;

  @media only screen and (max-width: 500px) {
    max-width: 100%;
  }

  @media only screen and (min-width: 768px) {
    max-width: 75%;
  }

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

const StyledEditableLabel = styled.label`
  display: flex;
  flex-direction: column;
  color: ${(props) => props.theme.text};

  &:hover,
  &:has(input:read-write) {
    color: ${(props) => props.theme.accent};
  }

  transition: all 0.15s ease;
`;

interface EditableTextProps {
  label: string;
  text: string;
  onChange: Function;
  onEditFinish: Function;
}

function EditableText(props: EditableTextProps) {
  const [editable, setEditable] = useState(false);

  const handleBlur = (event) => {
    setEditable(false);
    props.onEditFinish();
  };

  const handleFocus = () => {
    setEditable(true);
  };

  return (
    <StyledEditableLabel>
      {props.label}
      <StyledEditable
        value={props.text}
        onChange={props.onChange}
        readOnly={!editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onEditFinish={props.onEditFinish}
      ></StyledEditable>
    </StyledEditableLabel>
  );
}

export default EditableText;
