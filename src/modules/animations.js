import { Vector3 } from "three";
import { generateRandomDuration, generateRandomLocation } from "./randomGenerator";

export const animation1 = (state, position) => {
  const time = state.clock.getElapsedTime();
  const delayX = (position.x + 2) * 0.7;
  const delayZ = (position.z + 2) * 0.9;
  const waveSpeed = 2.0;

  return Math.sin(time * waveSpeed + delayX) + Math.sin(time * waveSpeed + delayZ);
};

export const animation2 = (state, position, gridsize, margin) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 5.0;
  const rippleRadius = gridsize / 2 - margin;
  const center = new Vector3((gridsize - 1) / 2, 0, (gridsize - 1) / 2);
  const decayFactor = 1.0 / rippleRadius; // Adjust decay factor based on ripple radius

  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  const phaseOffset = distance;
  const height = Math.sin(time * waveSpeed - phaseOffset) * Math.max(0, 1 - distance * decayFactor);

  return height * 1.5;
};

export const animation3 = (state, position, randomOffsets) => {
  const time = state.clock.getElapsedTime();
  const waveSpeed = 12.0;
  const scale = 1;

  const offsetX = randomOffsets[position.x][position.z];

  const height = Math.sin(time * waveSpeed + offsetX) * Math.cos(time * waveSpeed + offsetX) * scale;

  return height;
};

export const animation4 = (state, position, gridsize, margin, bubbles) => {
  const time = state.clock.getElapsedTime();
  const timeNow = Date.now();
  const waveSpeed = 12.0;
  const rippleRadius = 4;
  const heightMultiplier = 1; // Start at twice the height
  const timeDecayFactor = 1.0; // Controls how quickly ripples get shorter

  let height = 0;

  bubbles.forEach((bubble) => {
    let { location, duration, due, complete } = bubble;

    // Create adjustedTime to control how long until the ripples disappear
    const adjustedTime = ((bubble.due - 0.5 - timeNow) * timeDecayFactor) / 2000;

    if (timeNow >= bubble.due - 50) {
      bubble.complete = true;
    }

    if (complete) {
      location = generateRandomLocation(gridsize, margin);
      bubble.location = location;
      duration = generateRandomDuration(500, 4000);
      bubble.duration = duration;
      due = timeNow + duration;
      bubble.due = due;
      complete = false;
      bubble.complete = complete;
    }

    const intensity = (due - timeNow) / duration;
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

export const animation5 = () => {};
export const animation6 = () => {};
export const animation7 = () => {};
export const animation8 = () => {};
export const animation9 = () => {};
