import * as THREE from "three";
import {
  CUBE_LENGTH,
  DEBUG,
  GREEN_MESH,
  RED_MESH,
  WHITE_MESH,
} from "./constants";

// Should only be called from the first time board
// generation.
export function generateCube(row, col, type) {
  // select the right color based on type (which is an int)
  let material = WHITE_MESH;
  if (type === 1) {
    material = GREEN_MESH;
  } else if (type === 2) {
    material = RED_MESH;
  }

  // construct the cube with the right color and location in space
  // z should be a fixed value.
  const geometry = new THREE.BoxGeometry(CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH);
  let cube = new THREE.Mesh(geometry, material);
  cube.position.set(col * CUBE_LENGTH, -row * CUBE_LENGTH, 3); // (x,y,z)

  return cube;
}

// Should only be run once
// generate a bunch of cubes that acts as our game board...
export function generateBoard(cubeDB, board, scene) {
  let cube;
  for (const row in board) {
    for (const col in board[row]) {
      // generate a new cube
      cube = generateCube(row, col, board[row][col]);

      // add cube to our hashmap
      cubeDB[`${row},${col}`] = cube;

      // add cube to the scene
      scene.add(cube);
    }
  }
}

// refresh the entire board (is this a good idea?)
// based on the new board passed in (matrix of ints)
export function updateBoard(board, cubeDB) {
  let newMaterial;
  let newBoardVal;
  for (const row in board) {
    for (const col in board[row]) {
      // get new board value
      newBoardVal = board[row][col];
      if (newBoardVal === 0) {
        newMaterial = WHITE_MESH;
      } else if (newBoardVal === 1) {
        newMaterial = GREEN_MESH;
      } else if (newBoardVal === 2) {
        newMaterial = RED_MESH;
      } else {
        console.error(`Invalid board value encoutered: ${newBoardVal}`);
      }

      if (DEBUG) {
        console.log(`update cube at (x,y) = (${col}, ${row})`);
      }

      // update the corresponding cell's cube's material (color)
      cubeDB[`${row},${col}`].material = newMaterial;
    }
  }
}
