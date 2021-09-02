
function LightbulbCard(props) {
  return (
    <div onClick={props.onClick}>
      <p>💡</p>
      <p>{props.name || "Lightbulb"}</p>
    </div>
  )
}

export default LightbulbCard;