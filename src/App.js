import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, Vector3, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, BoxBufferGeometry } from "three";
import { OrbitControls } from "@react-three/drei";

import { generateRandomDuration, generateRandomLocation, generateRandomOffsets } from "./components/randomGenerator";
import useCubeColor from "./hooks/useCubeColor";
import useAnimation from "./hooks/useAnimation";

// Global variables - These exist because I am not handling and passing them properly yet
const bubbles = [];

// CSS styles - These exist because I have not created proper, independent components yet
// Slider styles
const sliderThumbStyle = {
  appearance: "none",
  width: "200px",
  height: "4px",
  background: "red",
  cursor: "pointer",
};
const sliderTrackStyle = {
  appearance: "none",
  width: "100%",
  height: "4px",
  background: "red",
  borderRadius: "3px",
  cursor: "pointer",
};
// Background gradient rotation animation - **DEBUG** - not working?
const gradientStyle = {
  background: "linear-gradient(15deg, rgb(20,0,20), rgb(70,0,0), rgb(20,0,0), rgb(70,70,0))",
  backgroundSize: "300% 300%",
  animation: "rotateGradient 10s ease infinite",
};

/** Cube component. Renders a cube at the given position with the specified animation.
 * @param {Vector3} position - The position of the cube in the array.
 * @param {number} animation - The animation number to apply.
 * @param {number} gridsize - The size of the grid.
 * @param {string} colorPercent - How much of the heightmap color to use.
 * @param {boolean} isSolid - Whether the cube is solid or wireframe.
 * @param {number} margin - The margin around the grid.
 * @param {Array<Array<number>>} randomOffsets - 2D array of random offsets.
 * @param {number} hue - The hue of the base color.
 * @param {number} saturation - The saturation of the base color.
 * @param {number} lightness - The lightness of the base color.
 * @param {function} calculateCubeColor - Function to calculate the cube color.
 * @param {function} hslToRgb - Function to convert HSL to RGB.
 * @param {function} setColorBase - Function to set the color base.
 * @returns {React.Element} The rendered Cube component.
 */
const Cube = ({
  position,
  animation,
  gridsize,
  randomOffsets,
  colorPercent,
  isSolid,
  margin,
  hue,
  saturation,
  lightness,
  calculateCubeColor,
  hslToRgb,
  setColorBase,
}) => {
  const ref = useRef();
  const [materialColor, setMaterialColor] = useState("white");
  const { animation1, animation2, animation3, animation4 } = useAnimation();

  const centeredPosition = useMemo(
    () => new Vector3(position.x - (gridsize - 1) / 2, 0, position.z - (gridsize - 1) / 2),
    [position, gridsize]
  );

  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), []);

  const cubeMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({ color: materialColor });
    material.wireframe = !isSolid;
    return material;
  }, [materialColor, isSolid]);

  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        linewidth: 1,
        transparent: true,
        opacity: 0.7,
        color: materialColor,
      }),
    [materialColor]
  );

  // This is where my memory leak was coming from. I was creating a new box every time the component re-rendered. If the height map color was applied and the color didn't change, the materials were never disposed. Memoizing the geometry was the solution.
  const boxGeometry = useMemo(() => new BoxBufferGeometry(1, 1, 1), []);

  useEffect(() => {
    return () => {
      cubeMaterial.dispose();
      edgeMaterial.dispose();
    };
  }, [cubeMaterial, edgeMaterial]);

  useFrame((state) => {
    let newY = 0;
    switch (animation) {
      case 1:
        newY = animation1(state, position, margin);
        break;
      case 2:
        newY = animation2(state, position, gridsize, margin);
        break;
      case 3:
        newY = animation3(state, position, randomOffsets);
        break;
      case 4:
        newY = animation4(state, position, gridsize, margin, bubbles);
        break;
      default:
        break;
    }

    // Update the Base Color from the HSL sliders
    const newColorBase = hslToRgb(hue, saturation, lightness);
    setColorBase(newColorBase);

    // Calculate the new color of the cube
    const newMaterialColor = calculateCubeColor(newY, colorPercent);

    if (newMaterialColor !== materialColor) {
      setMaterialColor(newMaterialColor);
      cubeMaterial.color.set(newMaterialColor);
      edgeMaterial.color.set(newMaterialColor);
      cubeMaterial.wireframe = !isSolid;
    }

    ref.current.position.y = newY;
  });

  // Return the cube and its edges as a group, conditionally rendering the edges
  return (
    <group ref={ref} position={centeredPosition}>
      <mesh geometry={boxGeometry} material={cubeMaterial} />
      {!isSolid && <lineSegments geometry={edges} material={edgeMaterial} />}
    </group>
  );
};

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
  const { colorBase, setColorBase, calculateCubeColor, hslToRgb } = useCubeColor();

  const [isSolid, setIsSolid] = useState(true); // Set solid or wireframe cubes
  const [solidButtonColor, setSolidButtonColor] = useState({ backgroundColor: `black` });
  const [wireframeButtonColor, setWireframeButtonColor] = useState({ borderColor: `black` });

  const [gridsize, setGridsize] = useState(5); // Set initial gridsize
  const [numberOfBubbles, setNumberOfBubbles] = useState(1); // Set initial number of bubbles
  const [animation, setAnimation] = useState(1); // Set initial animation
  const [margin, setMargin] = useState(0); // Set initial margin

  const [colorPercent, setColorPerent] = useState(0); // Set initial heightmap color percentage
  const [hue, setHue] = useState(0); // Set initial hue for base color
  const [saturation, setSaturation] = useState(0); // Set initial saturation for base color
  const [lightness, setLightness] = useState(0); // Set initial lightness for base color

  const cubes = [];
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2); // Set Camera center
  const randomOffsets = useMemo(() => generateRandomOffsets(gridsize), [gridsize]);

  useEffect(
    (gridsize, margin) => {
      if (numberOfBubbles < bubbles.length) {
        bubbles.length = parseInt(numberOfBubbles);
      } else {
        for (let i = 0; i < numberOfBubbles; i++) {
          let location = generateRandomLocation(gridsize, margin);
          let duration = generateRandomDuration(1, 6);
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

  useEffect(() => {
    if (isSolid) {
      setSolidButtonColor({ backgroundColor: `black` });
    } else {
      setSolidButtonColor({
        backgroundColor: `rgb(${colorBase.r}, ${colorBase.g}, ${colorBase.b})`,
      });
    }
    setWireframeButtonColor({
      borderColor: `rgb(${colorBase.r}, ${colorBase.g}, ${colorBase.b})`,
    });
  }, [isSolid, hue, saturation, lightness]);

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
          randomOffsets={randomOffsets}
          colorPercent={colorPercent}
          isSolid={isSolid}
          margin={margin}
          hue={hue}
          saturation={saturation}
          lightness={lightness}
          calculateCubeColor={calculateCubeColor}
          hslToRgb={hslToRgb}
          setColorBase={setColorBase}
        />
      );
    }
  }

  // Handle solid button click
  const handleSolidChange = (event) => {
    setIsSolid(!isSolid);
  };

  // Handle hue slider change
  const handleHueChange = (event) => {
    setHue(parseFloat(event.target.value));
  };

  // Handle saturation slider change
  const handleSaturationChange = (event) => {
    setSaturation(parseFloat(event.target.value));
  };

  // Handle lightness slider change
  const handleLightnessChange = (event) => {
    setLightness(parseFloat(event.target.value));
  };

  // Handle gridsize slider change
  const handleGridSizeChange = (event) => setGridsize(parseInt(event.target.value, 10));

  // Handle cube color slider change
  const handleColorChange = (event) => setColorPerent(parseInt(event.target.value, 10));

  // Handle animation slider change
  const handleAnimationChange = (event) => setAnimation(parseInt(event.target.value, 10));

  // Handle number of bubbles slider change
  const handleNumBubblesChange = (event) => {
    setNumberOfBubbles(parseInt(event.target.value, 10));
  };

  // Render the App
  return (
    <div className="bg fixed inset-0 flex items-center justify-center" style={gradientStyle}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        {/* <color attach="background" args={["black"]} /> */}
        <ambientLight />
        <pointLight position={[10, 20, 20]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls center={center} gridsize={gridsize} />
      </Canvas>
      <div className="slider-row absolute top-0">
        <div className="control-box">
          <label className="slider" htmlFor="lightness-slider">
            Lightness:
          </label>
          <input
            className="slider"
            id="lightness-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={lightness}
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleLightnessChange}
          />
        </div>
        <div className="control-box">
          <label className="slider" htmlFor="saturation-slider">
            Saturation:
          </label>
          <input
            className="slider"
            id="saturation-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={saturation}
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleSaturationChange}
          />
        </div>
        <div className="control-box">
          <label className="slider" htmlFor="hue-slider">
            Hue:
          </label>
          <input
            className="slider"
            id="hue-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={hue}
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleHueChange}
          />
        </div>

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
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
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
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
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
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
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
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleNumBubblesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
