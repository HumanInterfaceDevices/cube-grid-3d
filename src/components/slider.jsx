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

// function slider(divClassName, labelClassName, inputClassName, id, type, min, max, step, value, onChange) {
//   return (
//     <div className="control-box">
//       <label className="slider" htmlFor="saturation-slider">
//         Saturation:
//       </label>
//       <input
//         className="slider"
//         id="saturation-slider"
//         type="range"
//         min="0"
//         max="1"
//         step="0.004"
//         value={saturation}
//         style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
//         onChange={handleSaturationChange}
//       />
//     </div>
//   );
// }

// export default slider;
