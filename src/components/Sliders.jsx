import { useContext } from "react";
import { GridContext } from "../context/GridContext";

export const sliderThumbStyle = {
  appearance: "none",
  width: "200px",
  height: "4px",
  background: "red",
  cursor: "finger",
};
export const sliderTrackStyle = {
  appearance: "none",
  width: "100%",
  height: "4px",
  background: "red",
  borderRadius: "3px",
  cursor: "finger",
};


const Slider = () => {
  const {divClassName, labelClassName, labelHtmlFor, labelInner, inputClassName, id, min, max, step, value, onChange, style} = useContext(GridContext)
  return (
    <div className={divClassName}>
      <label className={labelClassName} htmlFor={labelHtmlFor}>
        {labelInner}
      </label>
      <input
        className={inputClassName}
        id={id}
        type="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        style={style}
        onChange={onChange}
      />
    </div>
  );
}

export default Slider;
