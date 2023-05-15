export const sliderStyle = {
  appearance: "none",
  width: "200px",
  height: "4px",
  background: "red",
  borderRadius: "3px",
  cursor: "finger",
};

function Slider(props) {
  return (
    <div className={props.divClassName}>
      <label className={props.labelClassName} htmlFor={props.labelHtmlFor}>
        {props.labelInner}
      </label>
      <input
        className="slider"
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.sliderValue}
        style={props.style}
        onChange={(event) => props.onChange(event)}
        />
    </div>
  );
}

export default Slider;
