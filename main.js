import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import SnakeGame from "./game.js";
import {
  createCameraModeIndicator,
  createEndGameComponents,
  createFirstTimeUserInstructionsPopup,
  createScoreContainer,
  createShowInstructionsButton,
  createSpeedSlider,
  disableSpeedSlider,
  enableSpeedSlider,
} from "./ui.js";
import { generateBoard, updateBoard } from "./graphics.js";
import {
  BEST_SCORE_LS_KEY,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CAMERA_INIT_X,
  CAMERA_INIT_Y,
  CAMERA_INIT_Z,
  DEBUG,
  DEFAULT_MOVES_PER_SECOND,
  ORBIT_CENTER_X,
  ORBIT_CENTER_Y,
  ORBIT_CENTER_Z,
} from "./constants.js";

class Main {
  constructor() {
    this.prevMovementKey = undefined;
    this.gameOver = false;
    this.cameraAdjustToggle = false;

    // use a dict as a mapping of {row,col} -> cube
    // so that later we can use the cell coords to get the cube
    // reference that we may want to alter the color of
    // in the scene to show updates to our game...
    this.cubeDB = new Map();

    // time units are in milliseconds
    this.lastGameUpdateTime = performance.now();
    this.gameSpeed = Math.round(1000 / DEFAULT_MOVES_PER_SECOND);

    this.initThreeJS();
    this.initUI();
    this.game = new SnakeGame(BOARD_WIDTH, BOARD_HEIGHT);
    generateBoard(this.cubeDB, this.game.board, this.scene);
    this.animate();
  }

  initThreeJS() {
    // SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 250, 1400);

    // Camera
    let camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Set up camera position and rotation
    camera.position.set(CAMERA_INIT_X, CAMERA_INIT_Y, CAMERA_INIT_Z);
    camera.rotation.x = THREE.MathUtils.degToRad(-0.3676640949393464);
    camera.rotation.y = THREE.MathUtils.degToRad(-0.18356858283079163);
    camera.rotation.z = THREE.MathUtils.degToRad(-0.0011703362383742087);
    camera.rotation.order = "XYZ";
    this.camera = camera;

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Controls
    // Setup OrbitControls for camera rotation with mouse
    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(ORBIT_CENTER_X, ORBIT_CENTER_Y, ORBIT_CENTER_Z);
    controls.update();
    this.controls = controls;

    if (DEBUG) {
      // Add camera to window for debugging
      window.debugCamera = camera;
      window.debugControls = controls;

      // Add debug helper function
      window.getCameraInfo = function () {
        return {
          position: {
            x: debugCamera.position.x,
            y: debugCamera.position.y,
            z: debugCamera.position.z,
          },
          rotation: {
            x: THREE.MathUtils.radToDeg(debugCamera.rotation.x),
            y: THREE.MathUtils.radToDeg(debugCamera.rotation.y),
            z: THREE.MathUtils.radToDeg(debugCamera.rotation.z),
            order: debugCamera.rotation.order,
          },
          target: {
            x: debugControls.target.x,
            y: debugControls.target.y,
            z: debugControls.target.z,
          },
        };
      };
    }

    // Allow camera movement with WASD, space to go up and shift to go down
    this.keyState = {};
    document.addEventListener(
      "keydown",
      (event) => (this.keyState[event.code] = true)
    );
    document.addEventListener(
      "keyup",
      (event) => (this.keyState[event.code] = false)
    );
  }

  initUI() {
    // init ui
    let [currScoreText, bestScoreText] = createScoreContainer();
    this.currScoreText = currScoreText;
    this.bestScoreText = bestScoreText;

    let [instructionsPopup, blurOverlay] =
      createFirstTimeUserInstructionsPopup();
    this.instructionsPopup = instructionsPopup;
    this.blurOverlay = blurOverlay;

    createShowInstructionsButton(instructionsPopup, blurOverlay);
    this.speedSlider = createSpeedSlider((newSpeed) => {
      this.gameSpeed = newSpeed;
    });

    this.cameraModeIndicator = createCameraModeIndicator();
    document.body.appendChild(this.cameraModeIndicator);
  }

  displayGameEndMessage(text) {
    // Show overlay
    this.blurOverlay.style.display = "block";

    let [gameEndText, gameOverTitle, gameOverMessage, restartButton] =
      createEndGameComponents(text);

    gameEndText.appendChild(gameOverTitle);
    gameEndText.appendChild(gameOverMessage);
    gameEndText.appendChild(restartButton);

    document.body.appendChild(gameEndText);
    this.gameEndText = gameEndText;

    restartButton.addEventListener("click", () => {
      this.restartGame();
    });
  }

  updateGame() {
    // update game at regular timing
    // if the user enters a keystroke that is a registered
    // input for our game, capture it and forward it to the game logic
    let inputKeystroke;
    let movementKeystroke;

    // get user movement input (refreshes as fast as the screen is drawn)
    if (this.keyState["KeyW"]) {
      movementKeystroke = 0;
    } else if (this.keyState["KeyD"]) {
      movementKeystroke = 1;
    } else if (this.keyState["KeyS"]) {
      movementKeystroke = 2;
    } else if (this.keyState["KeyA"]) {
      movementKeystroke = 3;
    } else if (this.keyState["KeyR"]) {
      inputKeystroke = "r";
    } else if (this.keyState["KeyC"]) {
      inputKeystroke = "c";
    }

    if (DEBUG) {
      if (inputKeystroke !== undefined)
        console.log(`entered inputKeystroke: ${inputKeystroke}`);
      if (movementKeystroke !== undefined)
        console.log(`entered movementKeystroke: ${movementKeystroke}`);
    }

    // check for a camera toggle
    if (inputKeystroke === "c") {
      if (this.updateInterval()) {
        if (!this.cameraAdjustToggle) {
          this.cameraAdjustToggle = true;
          this.cameraModeIndicator.style.display = "block";
        } else {
          this.cameraAdjustToggle = false;
          this.cameraModeIndicator.style.display = "none";
        }
      }
    }

    // check for a game restart
    if (inputKeystroke === "r") {
      this.restartGame();
      return;
    }

    // do not allow movement of snake
    // if camera toggle is enabled, don't want double movements
    if (this.cameraAdjustToggle) {
      return;
    }

    // do not update game if game is over
    // unless it is a request to restart the game
    if (this.gameOver) {
      return;
    }

    if (movementKeystroke !== undefined) {
      this.prevMovementKey = movementKeystroke;
      disableSpeedSlider(this.speedSlider);
    }

    if (this.prevMovementKey !== undefined) {
      // update game if enough time passed since last update
      if (!this.updateInterval()) {
        return;
      }

      // pass movementKey to game
      let returnedGameState = this.game.nextGameState(this.prevMovementKey);
      let newBoard = this.game.board;

      if (DEBUG) {
        console.log("updateGame - received newBoard:");
        newBoard.forEach((row) => {
          console.log(row.join(" "));
        });
      }

      // update board in scene
      updateBoard(newBoard, this.cubeDB);

      // update current score
      let currScore = this.game.getScore();
      this.updateScoreBoard(currScore);

      // end game if met end of game
      switch (returnedGameState) {
        case 0: // continue game
          return;
        case 1: // a win (very unlikely) game is over
          // TODO: update the scene if game is over
          this.gameOver = true;
          this.displayGameEndMessage(
            "Wow, you actually beat the game. Congrats!"
          );
          break;
        case -1: // a loss, game is over
          // TODO: update the scene if game is over
          this.gameOver = true;
          this.displayGameEndMessage(
            `Game over. You finished with score: ${currScore}`
          );
          break;
      }
    }
  }

  moveCamera() {
    if (this.cameraAdjustToggle) {
      let movementSpeed = 0.1;
      let upVector = new THREE.Vector3(0, 1, 0); // Up vector
      let forwardVector = new THREE.Vector3()
        .subVectors(this.controls.target, this.camera.position)
        .normalize(); // Forward vector
      let sideVector = new THREE.Vector3()
        .crossVectors(forwardVector, upVector)
        .normalize(); // Side vector

      if (this.keyState["KeyW"]) {
        // Move Forward
        this.camera.position.addScaledVector(forwardVector, movementSpeed);
        this.controls.target.addScaledVector(forwardVector, movementSpeed);
      }
      if (this.keyState["KeyS"]) {
        // Move Backward
        this.camera.position.addScaledVector(forwardVector, -movementSpeed);
        this.controls.target.addScaledVector(forwardVector, -movementSpeed);
      }
      if (this.keyState["KeyA"]) {
        // Move Left
        this.camera.position.addScaledVector(sideVector, -movementSpeed);
        this.controls.target.addScaledVector(sideVector, -movementSpeed);
      }
      if (this.keyState["KeyD"]) {
        // Move Right
        this.camera.position.addScaledVector(sideVector, movementSpeed);
        this.controls.target.addScaledVector(sideVector, movementSpeed);
      }
      if (this.keyState["Space"]) {
        // Move Up
        this.camera.position.addScaledVector(upVector, movementSpeed);
        this.controls.target.addScaledVector(upVector, movementSpeed);
      }
      if (this.keyState["ShiftLeft"]) {
        // Move Down
        this.camera.position.addScaledVector(upVector, -movementSpeed);
        this.controls.target.addScaledVector(upVector, -movementSpeed);
      }
    }
  }

  updateInterval() {
    // only pass user input to the game at regular interval (that is, game state
    // is updated much slower than the actual refresh rate of the scene drawing.)
    // check to see if it has been at least updateInterval time since the last update
    // return true if allow to update
    // else return false if not allow to update yet

    let currentTime = performance.now();
    let timeSinceLastGameUpdate = currentTime - this.lastGameUpdateTime;

    // Check if it's time to update the game based on the game speed
    if (timeSinceLastGameUpdate < this.gameSpeed) {
      return false; // Not time to update the game yet
    }

    // Update the last game update time
    this.lastGameUpdateTime = currentTime;

    return true;
  }

  restartGame() {
    if (!this.updateInterval()) {
      return;
    }

    // clear prevMovementKey
    this.prevMovementKey = undefined;

    // re-enable speed slider
    enableSpeedSlider(this.speedSlider);

    // clear the game end message if any
    if (this.gameEndText !== undefined) {
      document.body.removeChild(this.gameEndText);
      this.gameEndText = undefined;
      this.blurOverlay.style.display = "none";
    }

    // Exit camera mode if active
    if (this.cameraAdjustToggle) {
      this.cameraAdjustToggle = false;
      this.cameraModeIndicator.style.display = "none";
    }

    this.gameOver = false;

    // pass movementKey to game
    this.game.nextGameState(-1);
    let newBoard = this.game.board;

    // update board in scene
    updateBoard(newBoard, this.cubeDB);

    // update current score
    let currScore = this.game.getScore();
    this.updateScoreBoard(currScore);
  }

  updateScoreBoard(score) {
    // update the current score given the newscore [int]
    this.currScoreText.innerHTML = `Current Score: ${score}`;
    if (score > localStorage.getItem(BEST_SCORE_LS_KEY)) {
      localStorage.setItem(BEST_SCORE_LS_KEY, score);
      this.bestScoreText.innerHTML = `Best Score: ${score}`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Always update camera movement and render at the screen's refresh rate
    this.moveCamera();

    // Update the game logic at the specified game speed
    this.updateGame();

    // Always render at the screen's refresh rate
    this.renderer.render(this.scene, this.camera);
  }
}

new Main();
