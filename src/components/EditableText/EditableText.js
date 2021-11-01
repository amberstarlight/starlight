import { useState } from 'react';

function EditableText(props) {
  const [editable, setEditable] = useState(false);

  return (
    <>
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
    </>
  );
}

export default EditableText;
