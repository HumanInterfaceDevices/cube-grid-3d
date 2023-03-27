import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { BoxGeometry, Vector3, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, BoxBufferGeometry, Mesh, Line } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const animation1 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const delayX = (position.x + 2) * 0.7;
  const delayZ = (position.z + 2) * 0.9;
  const waveSpeed = 2.0;

  return (Math.sin(time * waveSpeed + delayX) + Math.sin(time * waveSpeed + delayZ)) * 0.15;
};

const animation2 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = 10;
  const center = { x: 12.5, z: 12.5 };
  const decayFactor = 0.1;

  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  const phaseOffset = distance;
  const height = Math.sin(time * waveSpeed - phaseOffset) * Math.max(0, 1 - distance * decayFactor) * 0.5;

  return height;
};

const animation3 = () => {};
const animation4 = () => {};
const animation5 = () => {};
const animation6 = () => {};
const animation7 = () => {};
const animation8 = () => {};
const animation9 = () => {};


const Cube = ({ position, animation }) => {
  const ref = useRef();

  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), []);

  useFrame((state) => {
    switch (animation) {
      case 1:
        ref.current.position.y = animation1(state, position);
        break;
      case 2:
        ref.current.position.y = animation2(state, position);
        break;
      default:
        break;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh geometry={new BoxBufferGeometry(1, 1, 1)} material={new MeshStandardMaterial({ transparent: true, opacity: 0.5 })} />
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
  const gridsize = 30;
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);

  for (let x = 0; x < gridsize; x++) {
    for (let z = 0; z < gridsize; z++) {
      cubes.push(<Cube key={`${x}-${z}`} position={new Vector3(x, 0, z)} animation={animation} />);
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
