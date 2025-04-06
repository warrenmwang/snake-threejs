import {
  BEST_SCORE_LS_KEY,
  DEFAULT_MOVES_PER_SECOND,
  INIT_FIRST_TIME_INSTRUCTIONS_LS_KEY,
  MAX_MOVES_PER_SECOND,
  MIN_MOVES_PER_SECOND,
} from "./constants";

export function createScoreContainer() {
  let scoreContainer = document.createElement("div");
  scoreContainer.style.position = "absolute";
  scoreContainer.style.width = 250;
  scoreContainer.style.padding = "15px";
  scoreContainer.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  scoreContainer.style.borderRadius = "10px";
  scoreContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  scoreContainer.style.top = 20 + "px";
  scoreContainer.style.left = 20 + "px";
  scoreContainer.style.fontFamily = "Arial, sans-serif";

  let currScoreText = document.createElement("div");
  currScoreText.style.fontSize = "18px";
  currScoreText.style.fontWeight = "bold";
  currScoreText.style.marginBottom = "5px";
  currScoreText.innerHTML = `Current Score: 1`;

  let bestScore = localStorage.getItem(BEST_SCORE_LS_KEY);
  if (bestScore === null) {
    bestScore = 0;
    localStorage.setItem(BEST_SCORE_LS_KEY, bestScore);
  }
  let bestScoreText = document.createElement("div");
  bestScoreText.style.fontSize = "16px";
  bestScoreText.style.color = "#555";
  bestScoreText.innerHTML = `Best Score: ${bestScore}`;

  scoreContainer.appendChild(currScoreText);
  scoreContainer.appendChild(bestScoreText);
  document.body.appendChild(scoreContainer);

  return [currScoreText, bestScoreText];
}

export function createFirstTimeUserInstructionsPopup() {
  let instructionsPopup = document.createElement("div");
  instructionsPopup.style.position = "fixed";
  instructionsPopup.style.top = "50%";
  instructionsPopup.style.left = "50%";
  instructionsPopup.style.transform = "translate(-50%, -50%)";
  instructionsPopup.style.width = "600px";
  instructionsPopup.style.maxWidth = "90%";
  instructionsPopup.style.padding = "20px";
  instructionsPopup.style.backgroundColor = "white";
  instructionsPopup.style.borderRadius = "10px";
  instructionsPopup.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)";
  instructionsPopup.style.zIndex = "1000";
  instructionsPopup.style.display = "none";
  instructionsPopup.style.fontFamily = "Arial, sans-serif";

  // Overlay for blur effect
  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.backdropFilter = "blur(5px)";
  overlay.style.webkitBackdropFilter = "blur(5px)"; // For Safari
  overlay.style.zIndex = "999";
  overlay.style.display = "none";
  document.body.appendChild(overlay);

  // Instructions content
  let instructionsTitle = document.createElement("h2");
  instructionsTitle.style.marginTop = "0";
  instructionsTitle.style.color = "#333";
  instructionsTitle.innerHTML = "How to Play Snake";

  let instructionsContent = document.createElement("div");
  instructionsContent.style.marginBottom = "20px";
  instructionsContent.style.lineHeight = "1.5";
  instructionsContent.innerHTML = `
  <p><strong>Controls:</strong></p>
  <ul>
    <li>Use <strong>WASD</strong> keys to control the snake's direction</li>
    <li>Press <strong>R</strong> to restart the game</li>
    <li>Press <strong>C</strong> to toggle camera control mode</li>
    <li>In camera mode, use <strong>WASD</strong>, <strong>Space</strong>, and <strong>Shift</strong> to move the camera</li>
    <li>Use the mouse to rotate the camera view (click and drag)</li>
  </ul>
  <p><strong>Gameplay:</strong></p>
  <ul>
    <li>Eat the red apples to grow longer and increase your score</li>
    <li>Avoid hitting the walls or your own tail</li>
    <li>Use the speed slider to adjust the snake's movement speed</li>
  </ul>
`;

  // Popup Close button
  let closeButton = document.createElement("button");
  closeButton.innerHTML = "Got it!";
  closeButton.style.padding = "8px 16px";
  closeButton.style.backgroundColor = "#4CAF50";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "4px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "14px";

  instructionsPopup.appendChild(instructionsTitle);
  instructionsPopup.appendChild(instructionsContent);
  instructionsPopup.appendChild(closeButton);
  document.body.appendChild(instructionsPopup);

  closeButton.addEventListener("click", function () {
    instructionsPopup.style.display = "none";
    overlay.style.display = "none";
    localStorage.setItem(INIT_FIRST_TIME_INSTRUCTIONS_LS_KEY, "true");
  });

  // Show instructions on first visit
  if (!(localStorage.getItem(INIT_FIRST_TIME_INSTRUCTIONS_LS_KEY) === "true")) {
    instructionsPopup.style.display = "block";
    overlay.style.display = "block";
  }

  return [instructionsPopup, overlay];
}

export function createShowInstructionsButton(instructionsPopup, blueOverlay) {
  // Create a button to show instructions at any time
  let showInstructionsButton = document.createElement("button");
  showInstructionsButton.innerHTML = "?";
  showInstructionsButton.style.position = "fixed";
  showInstructionsButton.style.top = "20px";
  showInstructionsButton.style.right = "20px";
  showInstructionsButton.style.width = "40px";
  showInstructionsButton.style.height = "40px";
  showInstructionsButton.style.borderRadius = "50%";
  showInstructionsButton.style.backgroundColor = "#4CAF50";
  showInstructionsButton.style.color = "white";
  showInstructionsButton.style.border = "none";
  showInstructionsButton.style.fontSize = "20px";
  showInstructionsButton.style.cursor = "pointer";
  showInstructionsButton.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
  showInstructionsButton.style.zIndex = "999";

  document.body.appendChild(showInstructionsButton);

  showInstructionsButton.addEventListener("click", function () {
    instructionsPopup.style.display = "block";
    blueOverlay.style.display = "block";
  });
}

export function createSpeedSlider(updateGameSpeedFn) {
  // Add speed slider UI
  let speedSliderContainer = document.createElement("div");
  speedSliderContainer.style.position = "absolute";
  speedSliderContainer.style.width = 300;
  speedSliderContainer.style.padding = "15px";
  speedSliderContainer.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  speedSliderContainer.style.borderRadius = "10px";
  speedSliderContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  speedSliderContainer.style.top = 100 + "px";
  speedSliderContainer.style.left = 20 + "px";
  speedSliderContainer.style.fontFamily = "Arial, sans-serif";

  let speedLabel = document.createElement("label");
  speedLabel.innerHTML = "Snake Speed: ";
  speedLabel.style.marginRight = "10px";
  speedLabel.style.fontWeight = "bold";
  speedLabel.style.fontSize = "16px";

  let speedSlider = document.createElement("input");
  speedSlider.type = "range";
  speedSlider.min = MIN_MOVES_PER_SECOND;
  speedSlider.max = MAX_MOVES_PER_SECOND;
  speedSlider.value = DEFAULT_MOVES_PER_SECOND;
  speedSlider.style.width = "200px";
  speedSlider.style.height = "8px";
  speedSlider.style.webkitAppearance = "none";
  speedSlider.style.appearance = "none";
  speedSlider.style.background = "#ddd";
  speedSlider.style.outline = "none";
  speedSlider.style.borderRadius = "4px";
  speedSlider.style.margin = "10px 0";

  // Custom slider thumb
  speedSlider.style.webkitAppearance = "none";
  speedSlider.style.appearance = "none";
  speedSlider.style.cursor = "pointer";

  // Add custom thumb styling with CSS
  let style = document.createElement("style");
  style.textContent = `
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
  }
  input[type=range]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
`;
  document.head.appendChild(style);

  let speedValue = document.createElement("span");
  speedValue.innerHTML = `${DEFAULT_MOVES_PER_SECOND} moves/sec`;
  speedValue.style.fontSize = "14px";
  speedValue.style.color = "#555";
  speedValue.style.marginLeft = "10px";

  speedSliderContainer.appendChild(speedLabel);
  speedSliderContainer.appendChild(speedSlider);
  speedSliderContainer.appendChild(speedValue);
  document.body.appendChild(speedSliderContainer);

  speedSlider.addEventListener("input", function () {
    const movesPerSecond = parseInt(this.value);
    updateGameSpeedFn(Math.round(1000 / movesPerSecond));
    speedValue.innerHTML = `${movesPerSecond} moves/sec`;
  });

  return speedSlider;
}

export function disableSpeedSlider(slider) {
  slider.disabled = true;
  slider.style.opacity = 0.5;
  slider.style.pointerEvents = "none";
}

export function enableSpeedSlider(slider) {
  slider.disabled = false;
  slider.style.opacity = 1;
  slider.style.pointerEvents = "auto";
}

export function createCameraModeIndicator() {
  // Create camera mode indicator
  let cameraModeIndicator = document.createElement("div");
  cameraModeIndicator.style.position = "fixed";
  cameraModeIndicator.style.top = "20px";
  cameraModeIndicator.style.left = "50%";
  cameraModeIndicator.style.transform = "translateX(-50%)";
  cameraModeIndicator.style.padding = "8px 16px";
  cameraModeIndicator.style.backgroundColor = "rgba(7, 128, 54, 0.7)";
  cameraModeIndicator.style.color = "white";
  cameraModeIndicator.style.borderRadius = "20px";
  cameraModeIndicator.style.fontFamily = "Arial, sans-serif";
  cameraModeIndicator.style.fontSize = "14px";
  cameraModeIndicator.style.fontWeight = "bold";
  cameraModeIndicator.style.zIndex = "998";
  cameraModeIndicator.style.display = "none";
  cameraModeIndicator.innerHTML =
    "CAMERA MODE - Use WASD, Space, Shift to move camera";
  return cameraModeIndicator;
}

export function createEndGameComponents(text) {
  // initialize the scoreboard
  let gameEndText = document.createElement("div");
  gameEndText.style.position = "fixed";
  gameEndText.style.top = "50%";
  gameEndText.style.left = "50%";
  gameEndText.style.transform = "translate(-50%, -50%)";
  gameEndText.style.width = "400px";
  gameEndText.style.padding = "20px";
  gameEndText.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  gameEndText.style.borderRadius = "10px";
  gameEndText.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)";
  gameEndText.style.zIndex = "1000";
  gameEndText.style.fontFamily = "Arial, sans-serif";
  gameEndText.style.textAlign = "center";

  let gameOverTitle = document.createElement("h2");
  gameOverTitle.style.color = "#ff3131";
  gameOverTitle.style.marginTop = "0";
  gameOverTitle.innerHTML = "Game Over";

  let gameOverMessage = document.createElement("p");
  gameOverMessage.style.fontSize = "18px";
  gameOverMessage.style.marginBottom = "20px";
  gameOverMessage.innerHTML = text;

  let restartButton = document.createElement("button");
  restartButton.innerHTML = "Play Again";
  restartButton.style.padding = "10px 20px";
  restartButton.style.backgroundColor = "#4CAF50";
  restartButton.style.color = "white";
  restartButton.style.border = "none";
  restartButton.style.borderRadius = "4px";
  restartButton.style.cursor = "pointer";
  restartButton.style.fontSize = "16px";
  restartButton.style.marginTop = "10px";

  return [gameEndText, gameOverTitle, gameOverMessage, restartButton];
}
