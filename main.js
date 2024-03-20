import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SnakeGame } from './game.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

// LIGHTS
// const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
// dirLight.position.set( 0, 0, 1 ).normalize();
// scene.add( dirLight );

// const pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
// pointLight.color.setHSL( Math.random(), 1, 0.5 );
// pointLight.position.set( 0, 100, 90 );
// scene.add( pointLight );

// define the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 20;
// camera.rotation.set(0,0,0);

// define the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup OrbitControls for camera rotation with mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // Set the point to orbit around

// Allow camera movement with WASD, space to go up and shift to go down
const keyState = {};
document.addEventListener('keydown', (event) => keyState[event.code] = true);
document.addEventListener('keyup', (event) => keyState[event.code] = false);

function moveCamera() {
    let movementSpeed = 0.1;
    let upVector = new THREE.Vector3(0, 1, 0); // Up vector
    let forwardVector = new THREE.Vector3().subVectors(controls.target, camera.position).normalize(); // Forward vector
    let sideVector = new THREE.Vector3().crossVectors(forwardVector, upVector).normalize(); // Side vector

    if (keyState['KeyW']) { // Move Forward
        camera.position.addScaledVector(forwardVector, movementSpeed);
        controls.target.addScaledVector(forwardVector, movementSpeed);
    }
    if (keyState['KeyS']) { // Move Backward
        camera.position.addScaledVector(forwardVector, -movementSpeed);
        controls.target.addScaledVector(forwardVector, -movementSpeed);
    }
    if (keyState['KeyA']) { // Move Left
        camera.position.addScaledVector(sideVector, -movementSpeed);
        controls.target.addScaledVector(sideVector, -movementSpeed);
    }
    if (keyState['KeyD']) { // Move Right
        camera.position.addScaledVector(sideVector, movementSpeed);
        controls.target.addScaledVector(sideVector, movementSpeed);
    }
    if (keyState['Space']) { // Move Up
        camera.position.addScaledVector(upVector, movementSpeed);
        controls.target.addScaledVector(upVector, movementSpeed);
    }
    if (keyState['ShiftLeft'] || keyState['ShiftRight']) { // Move Down
        camera.position.addScaledVector(upVector, -movementSpeed);
        controls.target.addScaledVector(upVector, -movementSpeed);
    }
}


// Text For Scoreboard. 

// // font loader
// const loader = new FontLoader();
// loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

// 	const textGeometry = new TextGeometry( 'Scoreboard', {
// 		font: font,
// 		size: 80,
// 		height: 5,
// 		curveSegments: 12,
// 		bevelEnabled: true,
// 		bevelThickness: 10,
// 		bevelSize: 8,
// 		bevelOffset: 0,
// 		bevelSegments: 5
// 	} );

//   // Create a material
//   var textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//   // Create a mesh with the text geometry
//   var textMesh = new THREE.Mesh(textGeometry, textMaterial);
//   // Add it to the scene
//   scene.add(textMesh);
// } );

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
  const cubeLength = 1;
  const geometry = new THREE.BoxGeometry( cubeLength, cubeLength, cubeLength );
  const material = new THREE.MeshBasicMaterial( { color: color } );
  let cube = new THREE.Mesh( geometry, material );
  cube.position.set(row*cubeLength, col*cubeLength, 3); // (x,y,z)

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

  moveCamera()

  renderer.render(scene, camera);
}

function main() {
  let game = new SnakeGame(10, 10); // width, height

  // generate the initial board in the scene
  generateBoard(game.board);

  animate();
}

main();