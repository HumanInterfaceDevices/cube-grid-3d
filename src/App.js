import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { BoxGeometry, Vector3, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, BoxBufferGeometry, Mesh, Line } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const Cube = ({ position }) => {
  const ref = useRef();
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const delayX = (position.x + 2) * 0.7;
    const delayZ = (position.z + 2) * 0.9;
    const waveSpeed = 2.0;

    ref.current.position.y =
      (Math.sin(time * waveSpeed + delayX) + Math.sin(time * waveSpeed + delayZ)) * 0.15;
  });

  return (
    <group ref={ref} position={position}>
      <mesh geometry={new BoxBufferGeometry(1, 1, 1)} material={new MeshStandardMaterial({ transparent: true, opacity: 0.5 })} />
      <line geometry={edges} material={new LineBasicMaterial({ linewidth: 2, transparent: true, opacity: 0.7, color: "cyan" })} />
    </group>
  );
};

const Controls = () => {
  const { camera, gl } = useThree();
  const controls = useRef();

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
  const cubes = [];

  for (let x = 0; x < 30; x++) {
    for (let z = 0; z < 30; z++) {
      cubes.push(<Cube key={`${x}-${z}`} position={new Vector3(x - 4.5, 0, z - 4.5)} />);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Canvas camera={{ position: [4, 10, 10], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 20, 20]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls />
        <CameraHandler />
      </Canvas>
    </div>
  );
};

export default App;
