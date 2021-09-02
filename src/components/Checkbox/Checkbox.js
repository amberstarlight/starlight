function Checkbox(props) {
  return (
    <label>
      {props.label}
      <input
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
      />
    </label>
  )
}

export default Checkbox;