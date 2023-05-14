import { useContext } from "react";
import SliderContext from "../context/SliderContext";

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


function Slider( sliderProps ) {
  const {divClassName, labelClassName, labelHtmlFor, labelInner, inputClassName, id, min, max, step, sliderValue, onChange, style} = useContext(SliderContext);

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
        value={sliderValue}
        style={style}
        onChange={onChange}
      />
    </div>
  );
}

export default Slider;
