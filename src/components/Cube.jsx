import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, EdgesGeometry, BoxGeometry, BoxBufferGeometry, MeshStandardMaterial, LineBasicMaterial } from "three";

import { Animation1, Animation2, Animation3, Animation4 } from "./Animations";
import { generateRandomOffsets } from "../utils/randomGenerators";

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
 * @param {Array<Vector3>} bubbles - Array of bubble positions.
 * @param {number} numberOfBubbles - The number of bubbles to render.
 * @returns {React.Element} The rendered Cube component.
 */
export const Cube = ({
  position,
  animation,
  gridsize,
  colorPercent,
  isSolid,
  margin,
  hue,
  saturation,
  lightness,
  calculateCubeColor,
  hslToRgb,
  setColorBase,
  bubbles = [],
  setBubbles,
  numberOfBubbles,
}) => {
  const ref = useRef();
  const [materialColor, setMaterialColor] = useState("white");
  const randomOffsets = useMemo(() => generateRandomOffsets(gridsize), [gridsize]);

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

  // This is where my memory leak was coming from. I was creating a new box every time the component re-rendered. If the height map color was applied, the materials in the new box were never disposed. Memoizing the box was the solution. It causes warnings, but it works without memory leaks.
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
        newY = Animation1(state, position, margin);
        break;
      case 2:
        newY = Animation2(state, position, gridsize, margin);
        break;
      case 3:
        newY = Animation3(state, position, randomOffsets);
        break;
      case 4:
        newY = Animation4(state, position, gridsize, margin, bubbles, setBubbles, numberOfBubbles);
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
