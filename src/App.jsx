import React, { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { OrbitControls } from "@react-three/drei";

import { generateRandomDuration, generateRandomLocation } from "./utils/randomGenerators";
import useCubeColor from "./hooks/useCubeColor";
import Slider, { sliderStyle } from "./components/Slider";
import { Cube } from "./components/Cube";

import SliderContext from "./context/SliderContext";
import { HueSlider, LightnessSlider, SaturationSlider } from "./components/Sliders";

// Background gradient
const gradientStyle = { background: "linear-gradient(145deg, rgb(128,0,0), rgb(32,0,0), rgb(0,32,32), rgb(0,255,255))" };

/** Controls component. Handles camera controls.
 * @param {Vector3} center - The center of the grid.
 * @param {number} gridsize - The size of the grid.
 * @returns {React.Element} - The rendered camera.
 */
const Controls = ({ center, gridsize }) => {
  const { camera } = useThree();
  const controls = useRef();

  // Recenter the camera if gridsize changes
  useEffect(() => {
    camera.position.set(center.x + gridsize / 3, center.y + gridsize, center.z + gridsize / 3);
    camera.lookAt(center.x, center.y, center.z);
  }, [gridsize]);

  return <OrbitControls ref={controls} args={[camera]} />;
};

/** Main App component.
 * @returns {React.Element} - The rendered App component.
 */
const App = () => {
  // const {} = useContext(SliderContext);

  const { colorBase, setColorBase, calculateCubeColor, hslToRgb } = useCubeColor();

  const [isSolid, setIsSolid] = useState(true); // Set solid or wireframe cubes
  const [solidButtonColor, setSolidButtonColor] = useState({ backgroundColor: `black` });
  const [wireframeButtonColor, setWireframeButtonColor] = useState({ borderColor: `black` });

  const [gridsize, setGridsize] = useState(5); // Set initial gridsize
  const [numberOfBubbles, setNumberOfBubbles] = useState(1); // Set initial number of bubbles
  const [animation, setAnimation] = useState(1); // Set initial animation
  const [margin, setMargin] = useState(0); // Set initial margin

  const [colorPercent, setColorPerent] = useState(0); // Set initial heightmap color percentage
  const [hue, setHue] = useState(0.5); // Set initial hue for base color
  const [saturation, setSaturation] = useState(0.5); // Set initial saturation for base color
  const [lightness, setLightness] = useState(0.5); // Set initial lightness for base color

  const [bubbles, setBubbles] = useState([{ location: [0, 0], duration: 0, due: 0, complete: false },]); // Set initial bubbles
  const cubes = [];
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2); // Set Camera center

  // Pushes new bubbles or truncates the bubbles array if the number of bubbles changes
  useEffect(
    (gridsize, margin) => {
      if (numberOfBubbles < bubbles.length) {
        bubbles.length = parseInt(numberOfBubbles);
      } else {
        for (let i = bubbles.length; i < numberOfBubbles; i++) {
          let location = generateRandomLocation(gridsize, margin);
          let duration = generateRandomDuration(1000, 6000);
          let due = Date.now() + duration;
          bubbles.push({
            location,
            duration,
            due,
            complete: false,
          });
        }
      }
    },
    [numberOfBubbles]
  );

  // Set the color of the solid/wireframe button
  useEffect(() => {
    const newColor = `rgb(${colorBase.r}, ${colorBase.g}, ${colorBase.b})`;
    if (isSolid) {
      setSolidButtonColor({
        backgroundColor: `black`,
      });
      setWireframeButtonColor({
        borderColor: newColor,
        display: "flex",
      });
    } else {
      setSolidButtonColor({
        backgroundColor: newColor,
      });
      setWireframeButtonColor({
        borderColor: newColor,
        display: "none",
      });
    }
  }, [isSolid, colorBase]);

  // Generate cubes
  for (let x = 0; x < gridsize; x++) {
    for (let z = 0; z < gridsize; z++) {
      const position = new Vector3(x, 0, z);
      cubes.push(
        <Cube
          key={`${x}-${z}`}
          position={position}
          animation={animation}
          gridsize={gridsize}
          colorPercent={colorPercent}
          isSolid={isSolid}
          margin={margin}
          hue={hue}
          saturation={saturation}
          lightness={lightness}
          calculateCubeColor={calculateCubeColor}
          hslToRgb={hslToRgb}
          setColorBase={setColorBase}
          bubbles={bubbles}
          setBubbles={setBubbles}
          numberOfBubbles={numberOfBubbles}
        />
      );
    }
  }

  // Handle solid button click
  const handleSolidChange = (event) => setIsSolid(!isSolid);

  // Handle hue slider change
  const handleHueChange = (event) => setHue(parseFloat(event.target.value));

  // Handle saturation slider change
  const handleSaturationChange = (event) => setSaturation(parseFloat(event.target.value));

  // Handle lightness slider change
  const handleLightnessChange = (event) => setLightness(parseFloat(event.target.value));

  // Handle gridsize slider change
  const handleGridSizeChange = (event) => setGridsize(parseInt(event.target.value, 10));

  // Handle cube color slider change
  const handleColorChange = (event) => setColorPerent(parseInt(event.target.value, 10));

  // Handle animation slider change
  const handleAnimationChange = (event) => setAnimation(parseInt(event.target.value, 10));

  // Handle number of bubbles slider change
  const handleNumBubblesChange = (event) => setNumberOfBubbles(parseInt(event.target.value, 10));

  // Render the App
  return (
    <SliderContext.Provider>
      <div className="bg fixed inset-0 flex items-center justify-center" style={gradientStyle}>
        <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
          <ambientLight />
          <pointLight position={[10, 20, 20]} />
          <React.Fragment>{cubes}</React.Fragment>
          <Controls center={center} gridsize={gridsize} />
        </Canvas>
        <div className="slider-row absolute top-0">
          <div className="control-box solidbutton">
            <button
              className="button"
              id="solid-button"
              type="button"
              value={isSolid}
              onClick={handleSolidChange}
              style={{ ...solidButtonColor }}
            >
              <div className="wireframeButton" style={{ ...wireframeButtonColor }}></div>
            </button>
          </div>

          <Slider {...LightnessSlider} onChange={handleLightnessChange} />
          <Slider {...SaturationSlider} onChange={handleSaturationChange} />
          <Slider {...HueSlider} onChange={handleHueChange} />

          <div className="control-box">
            <label className="slider" htmlFor="color-slider">
              H Color:
            </label>
            <input
              className="slider"
              id="color-slider"
              type="range"
              min="0"
              max="100"
              value={colorPercent}
              style={{ ...sliderStyle }}
              onChange={handleColorChange}
            />
          </div>
          <div className="control-box">
            <label className="slider" htmlFor="gridsize-slider">
              Grid size:
            </label>
            <input
              className="slider"
              id="gridsize-slider"
              type="range"
              min="5"
              max="40"
              value={gridsize}
              style={{ ...sliderStyle }}
              onChange={handleGridSizeChange}
            />
          </div>
          <div className="control-box">
            <label className="slider" htmlFor="animation-slider">
              Animation:
            </label>
            <input
              className="slider"
              id="animation-slider"
              type="range"
              min="1"
              max="4"
              value={animation}
              style={{ ...sliderStyle }}
              onChange={handleAnimationChange}
            />
          </div>
          <div className="control-box">
            <label className="slider" htmlFor="num-of-bubbles-slider">
              Bubbles:
            </label>
            <input
              className="slider"
              id="num-of-bubbles-slider"
              type="range"
              min="1"
              max="25"
              value={numberOfBubbles}
              style={{ ...sliderStyle }}
              onChange={handleNumBubblesChange}
            />
          </div>
        </div>
      </div>
    </SliderContext.Provider>
  );
};

export default App;
