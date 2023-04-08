import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  Vector3,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  MeshStandardMaterial,
  BoxBufferGeometry,
  MeshBasicMaterial,
} from "three";
import { OrbitControls } from "@react-three/drei";
extend({ OrbitControls });

/** Get the current time in milliseconds since the Unix epoch.
 * @returns {number} Current time in milliseconds.
 */
const timeNow = () => Date.now();

/** Generate a 2D array of random offsets for a grid of given size.
 * @param {number} gridsize - The size of the grid.
 * @returns {Array<Array<number>>} 2D array of random offsets.
 */
const generateRandomOffsets = (gridsize) => {
  const offsets = [];
  for (let x = 0; x < gridsize; x++) {
    offsets[x] = [];
    for (let z = 0; z < gridsize; z++) {
      offsets[x][z] = Math.random() * 2 * Math.PI;
    }
  }
  return offsets;
};

/** Generate a random duration within a specified range.
 * @param {number} minDuration - The minimum duration.
 * @param {number} maxDuration - The maximum duration.
 * @returns {number} A random duration between minDuration and maxDuration.
 */
const generateRandomDuration = (minDuration, maxDuration) => {
  const duration = Math.random() * (maxDuration - minDuration) + minDuration;
  return duration;
};

/** Generate a random location within a grid.
 * @param {number} gridsize - The size of the grid.
 * @param {number} margin - The margin around the grid.
 * @returns {Vector3} A Vector3 representing the random location.
 */
const generateRandomLocation = (gridsize, margin) => {
  const x = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
  const z = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
  return new Vector3(x, 0, z);
};

const raindrops = [];
/** Generate raindrops with random locations and durations
 * @param {number} numDrops - The number of raindrops to generate.
 * @param {number} gridsize - The size of the grid.
 * @param {number} margin - The margin around the grid.
 */
const newDropsCount = (numDrops, gridsize, margin) => {
  if (numDrops < raindrops.length) {
    raindrops.length = parseInt(numDrops);
  } else {
    for (let i = 0; i < numDrops; i++) {
      let location = generateRandomLocation(gridsize, margin);
      let duration = generateRandomDuration(1, 6);
      let due = timeNow() + duration;
      raindrops.push({
        location,
        duration,
        due,
        complete: false,
      });
    }
  }
};

/** Calculate the color of a cube based on its height.
 * @param {number} height - The height of the cube.
 * @param {number} colorPercent - How much color is applied to the cube.
 * @returns {string} A string representing the color in RGB format.
 */
const calculateCubeColor = (height, colorPercent) => {
  const threshold = 2;
  const color1 = { r: 0, g: 0, b: 255 }; // Blue - Lowest
  const color2 = { r: 255, g: 0, b: 0 }; // Red - Neutral
  const color3 = { r: 0, g: 255, b: 0 }; // Green - Highest
  const colorThreshold = { r: 255, g: 255, b: 255 }; // White - Threshold
  const colorBase = { r: 255, g: 0, b: 0 }; // Red - Base
  let color;

  // Calculate extreme negatives first
  if (height < -threshold) {
    color = colorThreshold;
    // Calculate extreme positives next
  } else if (height > threshold) {
    color = colorThreshold;
    // Calculate the negative middle range
  } else if (height < 0) {
    const t = 1- Math.abs(height / threshold);
    const r = Math.floor(
      colorBase.r * (1 - colorPercent / 100) +
        (color1.r * (1 - t) + color2.r * t) * (colorPercent / 100)
    );
    // Interpolate the values between the colors
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
    ); // Interpolate the values between the colors
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

/** Animation Functions
 */
const animation1 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const delayX = (position.x + 2) * 0.7;
  const delayZ = (position.z + 2) * 0.9;
  const waveSpeed = 2.0;

  return (
    ((Math.sin(time * waveSpeed + delayX) +
      Math.sin(time * waveSpeed + delayZ)) *
    0.15)*4
  );
};

const animation2 = (state, position, gridsize, margin) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = gridsize / 2 - margin;
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const decayFactor = 1.0 / rippleRadius; // Adjust decay factor based on ripple radius

  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  const phaseOffset = distance;
  const height =
    Math.sin(time * waveSpeed - phaseOffset) *
    Math.max(0, 1 - distance * decayFactor);

  return height * 1.5;
};

const animation3 = (state, position, randomOffsets) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 12.0;
  const raindropSize = 1.0;
  const raindropIntensity = 0.3;

  const offsetX = randomOffsets[position.x][position.z];

  const height =
    Math.sin(time * waveSpeed + offsetX) *
    Math.cos(time * waveSpeed + offsetX) *
    raindropSize;

  return height * raindropIntensity;
};

const animation4 = (state, position, gridsize, margin, raindrops) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 12.0;
  const rippleRadius = 4;
  const heightMultiplier = 1; // Start at twice the height
  const timeDecayFactor = 1.0; // Controls how quickly ripples get shorter

  let height = 0;

  raindrops.forEach((raindrop) => {
    let { location, duration, due, complete } = raindrop;

    // Create adjustedTime to control how long until the ripples disappear
    const adjustedTime =
      ((raindrop.due - 0.5 - timeNow()) * timeDecayFactor) / 2000;

    if (timeNow() >= raindrop.due) {
      raindrop.complete = true;
    }

    if (complete) {
      location = generateRandomLocation(gridsize, margin);
      raindrop.location = location;
      duration = generateRandomDuration(500, 4000);
      raindrop.duration = duration;
      due = timeNow() + duration;
      raindrop.due = due;
      complete = false;
      raindrop.complete = complete;
    }

    const intensity = (due - timeNow()) / duration;
    const dx = position.x - location.x;
    const dz = position.z - location.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= rippleRadius) {
      const decayFactor = 1.0 / rippleRadius; // Adjust decay factor based on ripple radius

      const phaseOffset = distance;
      height +=
        Math.sin((time + adjustedTime) * waveSpeed - phaseOffset) *
        Math.max(0, 1 - distance * decayFactor) *
        adjustedTime *
        intensity;
    }
  });

  const scaledHeight = height * heightMultiplier;

  return scaledHeight;
};

const animation5 = () => {};
const animation6 = () => {};
const animation7 = () => {};
const animation8 = () => {};
const animation9 = () => {};

const UPDATE_ONLY_ANIMATED_CUBES = false;

/** Cube component. Renders a cube at the given position with the specified animation.
 * @param {Vector3} position - The position of the cube.
 * @param {number} animation - The animation number to apply.
 * @param {number} gridsize - The size of the grid.
 * @param {string} colorPercent - How much of the color to use.
 * @param {boolean} isSolid - Whether the cube is solid or wireframe.
 * @param {number} margin - The margin around the grid.
 * @param {Array<Array<number>>} randomOffsets - 2D array of random offsets.
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
}) => {
  const ref = useRef();
  const [materialColor, setMaterialColor] = useState("white");
  const [prevIsSolid, setPrevIsSolid] = useState(isSolid);

  const centeredPosition = useMemo(
    () =>
      new Vector3(
        position.x - (gridsize - 1) / 2,
        0,
        position.z - (gridsize - 1) / 2
      ),
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
        newY = animation4(state, position, gridsize, margin, raindrops);
        break;
      default:
        break;
    }

    const newMaterialColor = calculateCubeColor(newY, colorPercent);
    const shouldUpdateWireframe = !UPDATE_ONLY_ANIMATED_CUBES || (UPDATE_ONLY_ANIMATED_CUBES && newY !== 0);

    if (newMaterialColor !== materialColor || prevIsSolid !== isSolid) {
      setMaterialColor(newMaterialColor);
      cubeMaterial.color.set(newMaterialColor);
      edgeMaterial.color.set(newMaterialColor);

      if (shouldUpdateWireframe) {
        cubeMaterial.wireframe = !isSolid;
      }

      setPrevIsSolid(isSolid);
    }

    ref.current.position.y = newY;
  });

  return (
    <group ref={ref} position={centeredPosition}>
      <mesh geometry={new BoxBufferGeometry(1, 1, 1)} material={cubeMaterial} />
      <lineSegments geometry={edges} material={edgeMaterial} />
    </group>
  );
};

/** Controls component. Handles camera controls.
 * @param {Vector3} center - The center of the grid.
 * @param {number} gridsize - The size of the grid.
 * @returns {React.Element} The rendered camera.
 */
const Controls = ({ center, gridsize }) => {
  const { camera, gl } = useThree();
  const controls = useRef();

  useEffect(() => {
    camera.position.set(
      center.x + gridsize / 3,
      center.y + gridsize,
      center.z + gridsize / 3
    );
    camera.lookAt(center.x, center.y, center.z);
  }, [gridsize]); // Empty dependency array to run this effect only on initial mount

  return <OrbitControls camera={camera} />;
};

/** Main App component.
 * @returns {React.Element} The rendered App component.
 */
const App = () => {
  const [animation, setAnimation] = useState(1); // Set initial animation
  const [gridsize, setGridsize] = useState(10); // Set initial gridsize
  const [colorPercent, setColorPerent] = useState(0); // Set initial cube color
  const [isSolid, setIsSolid] = useState(1); // Set solid or wireframe
  const [margin, setMargin] = useState(0); // Set initial margin
  const [numberOfDrops, setNumberOfDrops] = useState(1); // Set initial number of raindrops
  const cubes = [];
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const randomOffsets = useMemo(
    () => generateRandomOffsets(gridsize),
    [gridsize]
  );

  newDropsCount(numberOfDrops, gridsize);

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
        />
      );
    }
  }

  // Handle solid button click
  const handleSolidChange = (event) => {
    if (isSolid === 0) {
      setIsSolid(1);
    } else {
      setIsSolid(0);
    }
  };

  // Handle gridsize slider change
  const handleGridSizeChange = (event) =>
    setGridsize(parseInt(event.target.value, 10));

  // Handle cube color slider change
  const handleColorChange = (event) =>
    setColorPerent(parseInt(event.target.value, 10));

  // Handle animation slider change
  const handleAnimationChange = (event) =>
    setAnimation(parseInt(event.target.value, 10));

  // Handle number of drops slider change
  const handleNumDropsChange = (event) => {
    setNumberOfDrops(parseInt(event.target.value, 10));
    newDropsCount(numberOfDrops, gridsize);
  };

  // Background gradient rotation animation
  const gradientStyle = {
    background:
      "linear-gradient(15deg, rgb(20,0,0), rgb(70,0,0), rgb(20,0,0), rgb(70,0,0))",
    backgroundSize: "200% 200%",
    animation: "rotateGradient 1s linear infinite",
  };

  // Render the App
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={gradientStyle}
    >
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        {/* <color attach="background" args={["black"]} /> */}
        <ambientLight />
        <pointLight position={[10, 20, 20]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls center={center} gridsize={gridsize} />
      </Canvas>
      <div className="slider-row absolute top-4 left-4">
        <div className="control-box solidbutton">
          <button
            className="button"
            id="solid-button"
            type="button"
            value={isSolid}
            onClick={handleSolidChange}
          ></button>
        </div>
        <div className="control-box">
          <label className="slider" htmlFor="color-slider">
            Color:
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
            min="10"
            max="60"
            value={gridsize}
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleGridSizeChange}
          />
        </div>
        <div className="control-box">
          <label className="slider" htmlFor="num-of-drops-slider">
            Number of drops:
          </label>
          <input
            className="slider"
            id="num-of-drops-slider"
            type="range"
            min="1"
            max="40"
            value={numberOfDrops}
            style={{ ...sliderTrackStyle, ...sliderThumbStyle }}
            onChange={handleNumDropsChange}
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
      </div>
    </div>
  );
};

export default App;
