function Slider(props) {
  return (
    <>
      <label>
        {props.label}
        <input
          type="range"
          min={props.min}
          max={props.max}
          disabled={props.disabled || false}
          step={props.step}
          value={props.value}
          onChange={props.onChange}
        />
      </label>
      <p>{props.value}</p>
    </>
  );
}

export default Slider;
