import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { BoxGeometry, Vector3, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, BoxBufferGeometry, Mesh, Line } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

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

const generateRandomLocations = (gridsize, numberOfLocations) => {
  const locations = [];
  for (let i = 0; i < numberOfLocations; i++) {
    const x = Math.floor(Math.random() * gridsize);
    const z = Math.floor(Math.random() * gridsize);
    locations.push(new Vector3(x, 0, z));
  }
  return locations;
};

const animation1 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const delayX = (position.x + 2) * 0.7;
  const delayZ = (position.z + 2) * 0.9;
  const waveSpeed = 2.0;

  return (Math.sin(time * waveSpeed + delayX) + Math.sin(time * waveSpeed + delayZ)) * 0.15;
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
  const height = Math.sin(time * waveSpeed - phaseOffset) * Math.max(0, 1 - distance * decayFactor) * 0.5;

  return height;
};

const animation3 = (state, position, gridsize, randomOffsets) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 12.0;
  const raindropSize = 1.0;
  const raindropIntensity = 0.3;

  const offsetX = randomOffsets[position.x][position.z];

  const height = Math.sin(time * waveSpeed + offsetX) * Math.cos(time * waveSpeed + offsetX) * raindropSize;

  return height * raindropIntensity;
};

const animation4 = (state, position, gridsize, numberOfRipples, randomLocations) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = 8; // Fixed small radius
  const timeDecayFactor = 1.5; // Adjust this value to control how quickly ripples get shorter

  let height = 0;

  randomLocations.forEach((location, index) => {
    const dx = position.x - location.x;
    const dz = position.z - location.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= rippleRadius) {
      const phaseOffset = distance;
      const adjustedTime = time - index * (1.0 / numberOfRipples);
      const timeDecay = Math.exp(-adjustedTime * timeDecayFactor);
      const decayFactor = 1.0 / rippleRadius;

      height += timeDecay * Math.sin(adjustedTime * waveSpeed - phaseOffset) * Math.max(0, 1 - distance * decayFactor) * 0.5;
    }
  });

  return height;
};

const animation5 = () => {};
const animation6 = () => {};
const animation7 = () => {};
const animation8 = () => {};
const animation9 = () => {};


const Cube = ({
  position,
  animation,
  gridsize,
  numberOfRipples,
  randomLocations,
  randomOffsets,
}) => {
  const ref = useRef();
  const [materialColor, setMaterialColor] = useState("white");

  const centeredPosition = useMemo(() => new Vector3(
    position.x - (gridsize - 1) / 2,
    0,
    position.z - (gridsize - 1) / 2
  ), [position, gridsize]);

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
        newY = animation3(
          state,
          position,
          gridsize,
          randomOffsets
        );
        break;
        case 4:
        newY = animation4(state, position, gridsize, numberOfRipples, randomLocations);
        break;
      default:
        break;
    }

    if (newY !== 0) {
      setMaterialColor("red");
    } else {
      setMaterialColor("white");
    }

    ref.current.position.y = newY;
  });

  return (
    <group ref={ref} position={centeredPosition}>
      <mesh geometry={new BoxBufferGeometry(1, 1, 1)} material={<MeshStandardMaterial color={materialColor} transparent={true} opacity={0.5} />} />
      <line geometry={edges} material={new LineBasicMaterial({ linewidth: 2, transparent: true, opacity: 0.7, color: "cyan" })} />
    </group>
  );
};




const Controls = ({ center }) => {
  const { camera, gl } = useThree();
  const controls = useRef();

  useEffect(() => {
    camera.position.set(center.x + 15, 15, center.z + 15);
    camera.rotation.x = -Math.PI / 4;
    controls.current.target.set(center.x, 0, center.z);
  }, [camera, center]);

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
  const gridsize = 70;
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const numberOfRipples = 3;
  const randomOffsets = useMemo(() => generateRandomOffsets(gridsize), [gridsize]);
  const randomLocations = useMemo(() => generateRandomLocations(gridsize, numberOfRipples), [gridsize, numberOfRipples]);


  for (let x = 0; x < gridsize; x++) {
    for (let z = 0; z < gridsize; z++) {
      const position = new Vector3(x, 0, z);
      cubes.push(
        <Cube
          key={`${x}-${z}`}
          position={position}
          animation={animation}
          gridsize={gridsize}
          numberOfRipples={numberOfRipples}
          randomLocations={randomLocations}
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
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 20, 20]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls center={center} />
        <CameraHandler />
      </Canvas>
    </div>
  );
};


export default App;
