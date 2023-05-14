
const HueSlider = (props) => {
	divClassName = "control-box",
	labelClassName = "slider",
	labelHtmlFor = "lightness-slider",
	labelInner = "Lightness",
	inputClassName = "slider",
	id = "slider",
	min = 0,
	max = 1,
	step = 0.004,
	value = "{props.lightness}",
	style = "{...sliderTrackStyle, ...sliderThumbStyle}",
	onChange = "{props.handleLightnessChange}",
};
	