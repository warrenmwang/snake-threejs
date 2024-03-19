import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SnakeGame } from './game.js';

const scene = new THREE.Scene();

// define the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 5;
camera.position.y = 4;
camera.position.z = 12;

camera.rotation.set(0,0,0);

// define the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// orbit controls for camera movement with mouse
// const controls = new OrbitControls( camera, renderer.domElement );

// draw an axes helper... 
// The X axis is red. The Y axis is green. The Z axis is blue. 
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// create blocks of different colors that represent our game board.
// White (0xEDEADE) - Empty Blocks (0)
// Green (0x00ff00) - Snake (1)
// Red   (0xFF3131) - Apple (2)

// use a dict as a mapping of {row,col} -> cube
// so that later we can use the cell coords to get the cube
// reference that we may want to alter the color of 
// in the scene to show updates to our game...
let cubeDB = new Map();

function generateCube(row, col, type) {

  // select the right color based on type (which is an int)
  let color = 0xEDEADE;
  if (type === 1) {
    color = 0x00ff00;
  }else if (type === 2) {
    color = 0xFF3131;
  }

  // construct the cube with the right color and location in space
  // z should be a fixed value.
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: color } );
  let cube = new THREE.Mesh( geometry, material );
  cube.position.set(row, col, 3); // (x,y,z)

  // add cube to our hashmap
  cubeDB[{row:row, col:col}] = cube;

  // add cube to the scene
  scene.add( cube );
}

// generate a bunch of cubes that acts as our game board...
function generateBoard(board) {
  for (const row in board){
    for (const col in board[row]) {
      generateCube(row, col, board[row][col]);
    }
  }
}

// animate
function animate(){
  requestAnimationFrame( animate );

  // cube rotations
  // cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

function main() {
  let game = new SnakeGame(10, 10); // width, height

  // generate the initial board in the scene
  generateBoard(game.board);

  animate();
}

main();