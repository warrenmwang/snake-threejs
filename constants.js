import * as THREE from "three";

// create blocks of different colors that represent our game board.
// White (0xEDEADE) - Empty Blocks (0)
// Green (0x00ff00) - Snake (1)
// Red   (0xFF3131) - Apple (2)
export const WHITE_MESH = new THREE.MeshBasicMaterial({ color: 0xedeade });
export const GREEN_MESH = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
export const RED_MESH = new THREE.MeshBasicMaterial({ color: 0xff3131 });
export const CUBE_LENGTH = 2;

export const DEBUG = false;

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 10;

export const CAMERA_INIT_X = 8.038550399035287;
export const CAMERA_INIT_Y = -7.938420425963009;
export const CAMERA_INIT_Z = 23.310943527177738;

export const ORBIT_CENTER_X = 8.123054907353353;
export const ORBIT_CENTER_Y = -8.211440997275972;
export const ORBIT_CENTER_Z = -3.6883635283458607;

export const BEST_SCORE_LS_KEY = "snake-threejs.best_score";
export const INIT_FIRST_TIME_INSTRUCTIONS_LS_KEY =
  "snake-threejs.hasSeenInstructions";

// Convert milliseconds to moves per second for the slider
export const MIN_MOVES_PER_SECOND = 1; // 1 move per second (1000ms)
export const MAX_MOVES_PER_SECOND = 20; // 20 moves per second (50ms)
export const DEFAULT_MOVES_PER_SECOND = 10; // 10 moves per second (100ms)
