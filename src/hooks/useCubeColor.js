import { useState } from "react";

const useCubeColor = () => {
  const threshold = 2;
  const colorLow = { r: 0, g: 0, b: 255 }; // Blue - Lowest
  const colorMid = { r: 128, g: 0, b: 0 }; // Red - Neutral
  const colorHigh = { r: 0, g: 255, b: 0 }; // Green - Highest
  const colorThreshold = { r: 255, g: 255, b: 255 }; // White - Threshold
  const [colorBase, setColorBase] = useState({ r: 64, g: 0, b: 0 }); // Red - Base

  const hslToRgb = (hue, saturation, lightness) => {
    // Helper function to convert a hue value to its corresponding RGB value
    function hueToRgb(pivot, interpolated, tempHue) {
      if (tempHue < 0) tempHue += 1;
      if (tempHue > 1) tempHue -= 1;
      if (tempHue < 1 / 6) return pivot + (interpolated - pivot) * 6 * tempHue;
      if (tempHue < 1 / 2) return interpolated;
      if (tempHue < 2 / 3)
        return pivot + (interpolated - pivot) * (2 / 3 - tempHue) * 6;
      return pivot;
    }

    let red, green, blue;

    if (saturation === 0) {
      red = green = blue = lightness; // greyscale
    } else {
      const interpolated =
        lightness < 0.5
          ? lightness * (1 + saturation)
          : lightness + saturation - lightness * saturation;
      const pivot = 2 * lightness - interpolated;
      red = hueToRgb(pivot, interpolated, hue + 1 / 3);
      green = hueToRgb(pivot, interpolated, hue);
      blue = hueToRgb(pivot, interpolated, hue - 1 / 3);
    }

    return {
      r: Math.round(red * 255),
      g: Math.round(green * 255),
      b: Math.round(blue * 255),
    };
  };

  const calculateCubeColor = (height, colorPercent) => {
    let color, color1, color2;
    let thresholdRatio;

    // Calculate extremes first
    if (height < -threshold || height > threshold) {
      color = colorThreshold;
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
      // Negative range
    } else if (height < 0) {
        thresholdRatio = 1 - Math.abs(height / threshold);
      color1 = { ...colorLow };
      color2 = { ...colorMid };
      // Positive range
    } else {
        thresholdRatio = Math.abs(height / threshold);
      color1 = { ...colorMid };
      color2 = { ...colorHigh };
    }
    // Actually mathing the color to the height
    const r = Math.floor(
      colorBase.r * (1 - colorPercent / 100) +
        (color1.r * (1 - thresholdRatio) + color2.r * thresholdRatio) * (colorPercent / 100)
    );
    const g = Math.floor(
      colorBase.g * (1 - colorPercent / 100) +
        (color1.g * (1 - thresholdRatio) + color2.g * thresholdRatio) * (colorPercent / 100)
    );
    const b = Math.floor(
      colorBase.b * (1 - colorPercent / 100) +
        (color1.b * (1 - thresholdRatio) + color2.b * thresholdRatio) * (colorPercent / 100)
    );
    color = { r, g, b };

    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  };

  return {
    colorBase,
    setColorBase,
    calculateCubeColor,
    hslToRgb,
  };
};

export default useCubeColor;
