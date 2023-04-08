const useCubeColor = () => {
  const threshold = 2;
  const color1 = { r: 0, g: 0, b: 255 }; // Blue - Lowest
  const color2 = { r: 255, g: 0, b: 0 }; // Red - Neutral
  const color3 = { r: 0, g: 255, b: 0 }; // Green - Highest
  const colorThreshold = { r: 255, g: 255, b: 255 }; // White - Threshold
  const colorBase = { r: 255, g: 0, b: 0 }; // Red - Base

  const calculateCubeColor = (height, colorPercent) => {
    let color;

    // Calculate extremes first
    if (height < -threshold || height > threshold) {
      color = colorThreshold;
      // Calculate the negative middle range
    } else if (height < 0) {
      const t = 1 - Math.abs(height / threshold);
      const r = Math.floor(
        colorBase.r * (1 - colorPercent / 100) +
          (color1.r * (1 - t) + color2.r * t) * (colorPercent / 100)
      );
      const g = Math.floor(
        colorBase.g * (1 - colorPercent / 100) +
          (color1.g * (1 - t) + color2.g * t) * (colorPercent / 100)
      );
      const b = Math.floor(
        colorBase.b * (1 - colorPercent / 100) +
          (color1.b * (1 - t) + color2.b * t) * (colorPercent / 100)
      );
      color = { r, g, b };
      // Calculate the positive middle range
    } else if (height > 0) {
      const t = Math.abs(height / threshold);
      const r = Math.floor(
        colorBase.r * (1 - colorPercent / 100) +
          (color2.r * (1 - t) + color3.r * t) * (colorPercent / 100)
      );
      const g = Math.floor(
        colorBase.g * (1 - colorPercent / 100) +
          (color2.g * (1 - t) + color3.g * t) * (colorPercent / 100)
      );
      const b = Math.floor(
        colorBase.b * (1 - colorPercent / 100) +
          (color2.b * (1 - t) + color3.b * t) * (colorPercent / 100)
      );
      color = { r, g, b };
      // If the height is 0, use color2
    } else color = color2;

    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  };

  return {
    calculateCubeColor,
    color1,
    color2,
    color3,
    colorThreshold,
    colorBase,
  };
};

export default useCubeColor;
