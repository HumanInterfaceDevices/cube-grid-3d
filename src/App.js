import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { BoxGeometry, Vector3, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, BoxBufferGeometry, Mesh, Line } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const Cube = ({ position }) => {
  const ref = useRef();
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), []);

  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.getElapsedTime() + position.x * 2 + position.z * 2) * 0.3;
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

const App = () => {
  const cubes = [];

  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      cubes.push(<Cube key={`${x}-${z}`} position={new Vector3(x - 2, 0, z - 2)} />);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Canvas camera={{ position: [4, 4, 4], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <React.Fragment>{cubes}</React.Fragment>
        <Controls />
      </Canvas>
    </div>
  );
};

export default App;
