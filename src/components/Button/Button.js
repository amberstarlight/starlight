function Button(props) {
  return (
    <button
      className={props.className}
      type={props.type || 'button'}
      disabled={props.disabled || false}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}

export default Button;
