import { createContext } from "react";

const initialState = {
	divClassName : "slider",
	setDivClassName : () => {},

	labelClassName : "slider-label",
	setLabelClassName : () => {},

	labelHtmlFor : "slider",
	setLabelHtmlFor : () => {},

	labelInner : "Slider",
	setLabelInner : () => {},

	inputClassName : "slider-input",
	setInputClassName : () => {},

	id : "slider",
	setId : () => {},

	min : 0,
	setMin : () => {},

	max : 100,
	setMax : () => {},

	step : 1,
	setStep : () => {},

	value : 0,
	setValue : () => {},

	onChange : () => {},

	style : {},
	setStyle : () => {},
};
const SliderContext = createContext(initialState);

export default SliderContext;
