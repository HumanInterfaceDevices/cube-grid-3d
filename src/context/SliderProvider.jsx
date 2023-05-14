import { useState } from "react";
import { SliderContext } from "./SliderContext";


const SliderProvider = ({ children }) => {
	const [divClassName, setDivClassName] = useState("slider");
	const [labelClassName, setLabelClassName] = useState("slider-label");
	const [labelHtmlFor, setLabelHtmlFor] = useState("slider");
	const [labelInner, setLabelInner] = useState("Slider");
	const [inputClassName, setInputClassName] = useState("slider-input");
	const [id, setId] = useState("slider");
	const [min, setMin] = useState(0);
	const [max, setMax] = useState(100);
	const [step, setStep] = useState(1);
	const [sliderValue, setSliderValue] = useState(0);
	const [style, setStyle] = useState({});
	const [onChange, setOnChange] = useState(() => {});

	const value = {
		divClassName,
		setDivClassName,
		labelClassName,
		setLabelClassName,
		labelHtmlFor,
		setLabelHtmlFor,
		labelInner,
		setLabelInner,
		inputClassName,
		setInputClassName,
		id,
		setId,
		min,
		setMin,
		max,
		setMax,
		step,
		setStep,
		sliderValue,
		setSliderValue,
		style,
		setStyle,
		onChange,
		setOnChange,
	};

	return <SliderProvider.Context value={value}>
		{children}
	</SliderProvider.Context>;
};