import { Vector3 } from "three";

  /** Generate a 2D array of random offsets for a grid of given size.
   * @param {number} gridsize - The size of the grid.
   * @returns {Array<Array<number>>} 2D array of random offsets.
   */
  export const generateRandomOffsets = (gridsize) => {
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
  export const generateRandomDuration = (minDuration, maxDuration) => {
    const duration = Math.random() * (maxDuration - minDuration) + minDuration;
    return duration;
  };

  /** Generate a random location within a grid.
   * @param {number} gridsize - The size of the grid.
   * @param {number} margin - The margin around the grid.
   * @returns {Vector3} A Vector3 representing the random location.
   */
  export const generateRandomLocation = (gridsize, margin) => {
    const x = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
    const z = Math.floor(Math.random() * (gridsize - 2 * margin) + margin);
    return new Vector3(x, 0, z);
  };
