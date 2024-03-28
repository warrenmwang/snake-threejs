import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SnakeGame from './game.js';

const DEBUG = true;

// create blocks of different colors that represent our game board.
// White (0xEDEADE) - Empty Blocks (0)
// Green (0x00ff00) - Snake (1)
// Red   (0xFF3131) - Apple (2)
const WHITE_MESH = new THREE.MeshBasicMaterial( { color : 0xEDEADE } )
const GREEN_MESH = new THREE.MeshBasicMaterial( { color : 0x00ff00 } )
const RED_MESH = new THREE.MeshBasicMaterial( { color : 0xFF3131 } )

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;
const CUBE_LENGTH = 2;

const CAMERA_INIT_X = 0;
const CAMERA_INIT_Y = 0;
const CAMERA_INIT_Z = 30;

const ORBIT_CENTER_X = 10;
const ORBIT_CENTER_Y = -10;
const ORBIT_CENTER_Z = 0;

let renderer, scene, camera, controls, keyState;
let prevMovementKey;
let gameOver = false;
let cameraAdjustToggle = false;
var gameEndText;
// use a dict as a mapping of {row,col} -> cube
// so that later we can use the cell coords to get the cube
// reference that we may want to alter the color of 
// in the scene to show updates to our game...
let cubeDB = new Map();

// time units are in milliseconds
let lastUpdateTime = performance.now();
const GAME_TICK = 150;

// Play instructions at top of screen
var instructionText = document.createElement('div');
instructionText.style.position = 'absolute';
instructionText.style.width = 800;
instructionText.style.height = 90;
instructionText.style.backgroundColor = "white";
instructionText.innerHTML = `Play the game with the WASD keys. Press r to start a new game.
Press c to toggle camera repositioning mode, allowing you to control the camera by using the WASD, space, 
and shift keys. Camera angle can also be adjusted with the mouse, click and drag.`;
instructionText.style.top = 0 + 'px';
instructionText.style.left = 300 + 'px';
document.body.appendChild(instructionText);

// initialize the scoreboard
// current score
var currScoreText = document.createElement('div');
currScoreText.style.position = 'absolute';
currScoreText.style.width = 200;
currScoreText.style.height = 20;
currScoreText.style.backgroundColor = "white";
currScoreText.innerHTML = `Current Score: 1`;
currScoreText.style.top = 0 + 'px';
currScoreText.style.left = 0 + 'px';
document.body.appendChild(currScoreText);
// best score across time
var bestScore = localStorage.getItem("bestScore");
if (bestScore === null){
  bestScore = 0;
  localStorage.setItem("bestScore", bestScore);
}
var bestScoreText = document.createElement('div');
bestScoreText.style.position = 'absolute';
bestScoreText.style.width = 200;
bestScoreText.style.height = 20;
bestScoreText.style.backgroundColor = "white";
bestScoreText.innerHTML = `Best Score: ${bestScore}`;
bestScoreText.style.top = 20 + 'px';
bestScoreText.style.left = 0 + 'px';
document.body.appendChild(bestScoreText);

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
    if (keyState['ShiftLeft']) { // Move Down
        camera.position.addScaledVector(upVector, -movementSpeed);
        controls.target.addScaledVector(upVector, -movementSpeed);
    }
}
// only pass user input to the game at regular interval (that is, game state
// is updated much slower than the actual refresh rate of the scene drawing.)
// check to see if it has been at least updateInterval time since the last update
// return true if allow to update
// else return false if not allow to update yet
function updateInterval(){
  // ---- UPDATE INTERVAL ----
  let currentTime = performance.now();
  let timeSinceLastUpdate = currentTime - lastUpdateTime;
  if (timeSinceLastUpdate < GAME_TICK) {
    return false; // quit if not enough time has passed
  }
  // otherwise, update the game (and the lastUpdatetime)!
  lastUpdateTime = currentTime;

  return true;
}

// restart the game
function restartGame(game){
  if(!updateInterval()){
    return;
  }

  // clear prevMovementKey
  prevMovementKey = undefined;

  // clear the game end message if any
  if (gameEndText !== undefined){
    document.body.removeChild(gameEndText);
    gameEndText = undefined;
  }

  gameOver = false;

  // pass movementKey to game
  game.nextGameState(-1);
  var newBoard = game.board;

  // update board in scene
  updateBoard(newBoard);

  // update current score
  var currScore = game.getScore();
  updateScoreBoard(currScore);
}

// update game at regular timing
// if the user enters a keystroke that is a registered 
// input for our game, capture it and forward it to the game logic
function updateGame(game) {
  /*
    game - the game object
  */

  var inputKeystroke;
  var movementKeystroke;

  // get user movement input (refreshes as fast as the screen is drawn)
  if (keyState['ArrowUp']) {
    movementKeystroke = 0;
  } else if (keyState['ArrowRight']) {
    movementKeystroke = 1;
  } else if (keyState['ArrowDown']) {
    movementKeystroke = 2;
  } else if (keyState['ArrowLeft']) {
    movementKeystroke = 3;
  } else if (keyState['KeyR']){
    inputKeystroke = -1;
  }

  // do not update game if game is over
  // unless it is a request to restart the game
  if (gameOver) {
    if (inputKeystroke === -1){
      restartGame(game);
    }
    return;
  }

  if (DEBUG) {
    console.log(`entered: ${inputKeystroke}`);
  }

  if (movementKeystroke !== undefined) {
    prevMovementKey = movementKeystroke;
  }

  if (prevMovementKey !== undefined) {
    // update game if enough time passed since last update
    if(!updateInterval()){
      return;
    }

    // pass movementKey to game
    var returnedGameState = game.nextGameState(prevMovementKey);
    var newBoard = game.board;

    if (DEBUG) {
      console.log("updateGame - received newBoard:")
      newBoard.forEach(row => {
        console.log(row.join(' '));
      });
    }

    // update board in scene
    updateBoard(newBoard);

    // update current score
    var currScore = game.getScore();
    updateScoreBoard(currScore);
    
    // TODO: update best score if current score is better than current score
    
    // end game if met end of game
    switch(returnedGameState){
      case 0: // continue game
        return;
      case 1: // a win (very unlikely) game is over
        // TODO: update the scene if game is over
        gameOver = true;
        displayGameEndMessage("Wow, you actually beat the game. Congrats!");
        break;
      case -1: // a loss, game is over
        // TODO: update the scene if game is over
        gameOver = true;
        displayGameEndMessage(`Game over. You finished with score: ${currScore}`);
        break;
    }
  } 
}

// update the current score given the newscore [int]
function updateScoreBoard(newscore) {
  currScoreText.innerHTML = `Current Score: ${newscore}`;
  if (newscore > bestScore) {
    localStorage.setItem("bestScore", newscore);
    bestScoreText.innerHTML = `Best Score: ${newscore}`;
  }
}

// display an ending game message
function displayGameEndMessage(text) {
  // initialize the scoreboard
  gameEndText = document.createElement('div');
  gameEndText.style.position = 'absolute';
  gameEndText.style.width = 200;
  gameEndText.style.height = 200;
  gameEndText.style.backgroundColor = "red";
  gameEndText.innerHTML = `${text}. Refresh the page to start a new game!`;
  gameEndText.style.top = 100 + 'px';
  gameEndText.style.left = 0 + 'px';
  document.body.appendChild(gameEndText);
}

// Should only be called from the first time board
// generation.
function generateCube(row, col, type) {

  // select the right color based on type (which is an int)
  let material = WHITE_MESH;
  if (type === 1) {
    material = GREEN_MESH;
  }else if (type === 2) {
    material = RED_MESH;
  }

  // construct the cube with the right color and location in space
  // z should be a fixed value.
  const geometry = new THREE.BoxGeometry( CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH );
  let cube = new THREE.Mesh( geometry, material );
  cube.position.set(col*CUBE_LENGTH, -row*CUBE_LENGTH, 3); // (x,y,z)

  return cube;

}

// Should only be run once
// generate a bunch of cubes that acts as our game board...
function generateBoard(board) {
  let cube;
  for (const row in board){
    for (const col in board[row]) {
      // generate a new cube
      cube = generateCube(row, col, board[row][col]);

      // add cube to our hashmap
      cubeDB[`${row},${col}`] = cube;

      // add cube to the scene
      scene.add( cube );
    }
  }
}

// refresh the entire board (is this a good idea?)
// based on the new board passed in (matrix of ints)
function updateBoard(board) {
  let newMaterial;
  let newBoardVal;
  for (const row in board){
    for (const col in board[row]) {
      // get new board value
      newBoardVal = board[row][col]
      if (newBoardVal === 0) { newMaterial = WHITE_MESH; }
      else if (newBoardVal === 1) { newMaterial = GREEN_MESH; }
      else if (newBoardVal === 2) { newMaterial = RED_MESH; }
      else { console.error(`Invalid board value encoutered: ${newBoardVal}`)}

      if (DEBUG) { console.log(`update cube at (x,y) = (${col}, ${row})`) }

      // update the corresponding cell's cube's material (color)
      cubeDB[`${row},${col}`].material = newMaterial;
    }
  }
}

// animate -- forever loop, runs at refresh rate of screen
function animate(game){
  requestAnimationFrame( () => animate(game) );

  moveCamera()

  updateGame(game);

  renderer.render(scene, camera);
}

function init() {

  // SCENE
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

  // define the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = CAMERA_INIT_X;
  camera.position.y = CAMERA_INIT_Y;
  camera.position.z = CAMERA_INIT_Z;

  // define the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup OrbitControls for camera rotation with mouse
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(ORBIT_CENTER_X, ORBIT_CENTER_Y, ORBIT_CENTER_Z); // Set the point to orbit around

  // Allow camera movement with WASD, space to go up and shift to go down
  keyState = {};
  document.addEventListener('keydown', (event) => keyState[event.code] = true);
  document.addEventListener('keyup', (event) => keyState[event.code] = false);

  // create game object
  var game = new SnakeGame(BOARD_WIDTH, BOARD_HEIGHT); // width, height


  // draw the initial board in the scene from the inited board
  generateBoard(game.board);

  // run the while loop...
  animate(game);
}

init()