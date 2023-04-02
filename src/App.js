import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  Vector3,
  EdgesGeometry,
  LineBasicMaterial,
  MeshStandardMaterial,
  BoxBufferGeometry,
  // Mesh,
  // Line,
} from "three";
import {
  OrbitControls,
  // MapControls,
} from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

// Numerical constants
let numberOfDrops = 20;
let gridsize = 50;
let margin = 0;
let cubeColorOn = false;

const timeNow = () => {
  return Date.now();
};

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

const generateRandomDuration = (minDuration, maxDuration) => {
  const duration = Math.random() * (maxDuration - minDuration) + minDuration;
  return duration;
};

const generateRandomLocation = (gridsize, margin) => {
  const x = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
  const z = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
  return new Vector3(x, 0, z);
};

const raindrops = [];
for (let i = 0; i < numberOfDrops; i++) {
  let location = generateRandomLocation(gridsize, margin);
  let duration = generateRandomDuration(1, 6);
  let due = timeNow() + duration;
  raindrops.push({
    location,
    due,
    complete: false,
  });
}

const lerpColor = (color1, color2, factor) => {
  const r = color1.r + factor * (color2.r - color1.r);
  const g = color1.g + factor * (color2.g - color1.g);
  const b = color1.b + factor * (color2.b - color1.b);

  return { r, g, b };
};

const calculateCubeColor = (height) => {
  const colorNegative = { r: 0, g: 0, b: 255 }; // Blue for negative heights
  const colorZero = { r: 0, g: 255, b: 0 }; // Green for zero height
  const colorPositive = { r: 255, g: 0, b: 0 }; // Red for positive heights

  let color;

  if (height < -0.01) {
    color = colorNegative;
    // const factor = Math.abs(height) / Math.abs(height + 1); // Adjust the factor if needed
    // color = lerpColor(colorZero, colorNegative, factor);
  } else if (height > 0.01) {
    color = colorPositive;
    // const factor = height / (height + 1); // Adjust the factor if needed
    // color = lerpColor(colorZero, colorPositive, factor);
  } else {
    color = colorZero;
  }

  return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

const animation1 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const delayX = (position.x + 2) * 0.7;
  const delayZ = (position.z + 2) * 0.9;
  const waveSpeed = 2.0;

  return (
    (Math.sin(time * waveSpeed + delayX) +
      Math.sin(time * waveSpeed + delayZ)) *
    0.15
  );
};

const animation2 = (state, position, gridsize) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = gridsize / 2 - 1; // Adjust this value to change the ripple size
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const decayFactor = 1.0 / rippleRadius; // Adjust decay factor based on ripple radius

  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  const phaseOffset = distance;
  const height =
    Math.sin(time * waveSpeed - phaseOffset) *
    Math.max(0, 1 - distance * decayFactor) *
    0.5;

  return height;
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

const animation4 = (state, position, raindrops) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = 4;
  const heightMultiplier = 2; // Start at twice the height
  const timeDecayFactor = 1.0; // Controls how quickly ripples get shorter

  let height = 0;

  raindrops.forEach((raindrop) => {
    let { location, duration, complete } = raindrop;

    // Create adjustedTime to control how long until the ripples disappear
    const adjustedTime =
      ((raindrop.due - 0.5 - timeNow()) * timeDecayFactor) / 4000;

    if (complete) {
      location = generateRandomLocation(gridsize, margin);
      raindrop.location = location;
      duration = generateRandomDuration(500, 4000);
      raindrop.due = timeNow() + duration;
      complete = false;
      raindrop.complete = complete;
    }

    const dx = position.x - location.x;
    const dz = position.z - location.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= rippleRadius) {
      const decayFactor = 1.0 / rippleRadius; // Adjust decay factor based on ripple radius

      const phaseOffset = distance;
      height +=
        Math.sin((time + adjustedTime) * waveSpeed - phaseOffset) *
        Math.max(0, 1 - distance * decayFactor) *
        0.5 *
        adjustedTime;
    }

    if (timeNow() >= raindrop.due) {
      raindrop.complete = true;
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

const Cube = ({ position, animation, gridsize, randomOffsets }) => {
  const ref = useRef();
  const [materialColor, setMaterialColor] = useState("white");

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

  useFrame((state) => {
    let newY = 0;
    switch (animation) {
      case 1:
        newY = animation1(state, position);
        break;
      case 2:
        newY = animation2(state, position, gridsize);
        break;
      case 3:
        newY = animation3(state, position, randomOffsets);
        break;
      case 4:
        newY = animation4(state, position, raindrops);
        break;
      default:
        break;
    }

    setMaterialColor((cubeColorOn ? calculateCubeColor(newY):"red"));

    ref.current.position.y = newY;
  });

  return (
    <group ref={ref} position={centeredPosition}>
      <mesh
        geometry={new BoxBufferGeometry(1, 1, 1)}
        material={
          <MeshStandardMaterial
            color={materialColor}
            transparent={true}
            opacity={0.5}
          />
        }
      />
      <line
        geometry={edges}
        material={
          new LineBasicMaterial({
            linewidth: 1,
            transparent: true,
            opacity: 0.7,
            color: materialColor,
          })
        }
      />
    </group>
  );
};

const Controls = ({ center, gridsize }) => {
  const { camera, gl } = useThree();
  const controls = useRef(); // Store controls in a ref so that they aren't recreated on every render

  useEffect(() => {
    camera.position.set(center.x, center.y + Math.sqrt(gridsize) * 2, center.z);
    camera.rotation.x = -Math.PI / 4;
    controls.current.target.set(center.x, 0, center.z);
  }, [camera, center, gridsize]);

  useEffect(() => {
    controls.current.addEventListener("change", gl.forceRender);
    return () => controls.current.removeEventListener("change", gl.forceRender);
  }, [gl]);

  return <orbitControls ref={controls} args={[camera, gl.domElement]} />;
};

const CameraHandler = () => {
  const { camera } = useThree();

  const onKeyDown = (event) => {
    const moveSpeed = 0.1;
    const rotationSpeed = 0.025;

    switch (event.code) {
      case "ArrowUp":
        camera.translateZ(-moveSpeed);
        break;
      case "ArrowDown":
        camera.translateZ(moveSpeed);
        break;
      case "ArrowLeft":
        camera.translateX(-moveSpeed);
        break;
      case "ArrowRight":
        camera.translateX(moveSpeed);
        break;
      case "KeyW":
        camera.rotateX(rotationSpeed);
        break;
      case "KeyA":
        camera.rotateY(rotationSpeed);
        break;
      case "KeyS":
        camera.rotateX(-rotationSpeed);
        break;
      case "KeyD":
        camera.rotateY(-rotationSpeed);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
};

const App = () => {
  const [animation, setAnimation] = useState(1);
  const cubes = [];
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const randomOffsets = useMemo(
    () => generateRandomOffsets(gridsize),
    [gridsize]
  );

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
        />
      );
    }
  }

  const onKeyDown = (event) => {
    const digit = parseInt(event.key, 10);
    if (digit >= 1 && digit <= 9) {
      setAnimation(digit);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={["black"]} />
        <ambientLight />
        <pointLight position={[10, 20, 20]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls center={center} gridsize={gridsize} />
        <CameraHandler />
      </Canvas>
    </div>
  );
};

export default App;
