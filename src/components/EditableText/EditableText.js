// SPDX-License-Identifier: GPL-3.0-or-later

import { useState } from 'react';
import styled from 'styled-components';

const StyledEditable = styled.div`
  display: flex;
  align-items: center;
`;

function EditableText(props) {
  const [editable, setEditable] = useState(false);

  return (
    <StyledEditable>
      {editable ? (
        <input value={props.text} onChange={props.onChange}></input>
      ) : (
        <p>{props.text}</p>
      )}
      <i
        onClick={() => {
          if (
            editable &&
            props.onEditFinish &&
            props.onEditFinish instanceof Function
          )
            props.onEditFinish();

          setEditable(!editable);
        }}
      >
        ✏️
      </i>
    </StyledEditable>
  );
}

export default EditableText;
