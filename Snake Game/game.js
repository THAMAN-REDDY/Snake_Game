// Game Constants
const SIZE = 20;
const SPEED = 200;

// Game Variables
const foodEmojis = ["🍎", "🍇", "🍓", "🥃", "🍊", "🍉", "🍒", "🍍", "🍋", "🥭","🐤","🐁","🦀","🍄"];
const scoreBoosterFood = 13;
const randomScoreBoosterFood = 3;
let snake = [{ x: 0, y: 0 }];
let direction = "right";
let food = { x: 0, y: 0 };
let score = 0;
let intervalId;
let currentFoodEmoji;
let playerName;

// DOM Elements
const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const scoreElement = document.getElementById("score");

// Event Listeners
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);
pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", restartGame);

document.addEventListener("keydown", handleKeyDown);
gameBoard.addEventListener("touchstart", handleTouchStart,{passive:false});
gameBoard.addEventListener("touchmove", handleTouchMove,{passive:false});

let touchStartX = 0;
let touchStartY = 0;

const specialFoodSound = new Audio("sounds/mega_point.mp3");
const normalFoodSound = new Audio("sounds/normal_points.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const moveSound = new Audio("sounds/move.mp3");
const musicSound = new Audio("sounds/intro.weba");
musicSound.volume=70;
function startGame() {
  // Ask for the player's name each time the game starts
  playerName = prompt("Enter your name:", "Player");
  if (!playerName) {
    playerName = "Player"; // Default name if none provided
  }
  musicSound.play();
  musicSound.loop=true;
  // Greet the player
  document.querySelector("#playerGreetMsg").innerText = `Hello!!!.. ${playerName}`;
  
  resetGame();
  startButton.disabled = true;
  stopButton.disabled = false;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  restartButton.disabled = false;
  intervalId = setInterval(moveSnake, SPEED);
  createSnake();
  generateFood();
}

function stopGame() {
  resetGame();
  musicSound.pause();
  clearInterval(intervalId);
  stopButton.disabled = true;
  startButton.disabled = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
  restartButton.disabled = true;
}

function pauseGame() {
  musicSound.pause();
  clearInterval(intervalId);
  pauseButton.disabled = true;
  resumeButton.disabled = false;
}

function resumeGame() {
  musicSound.play();
  intervalId = setInterval(moveSnake, SPEED);
  pauseButton.disabled = false;
  resumeButton.disabled = true;
}

function restartGame() {
  clearInterval(intervalId);
  resetGame();
  startGame();
}

function resetGame() {
  snake = [{ x: 0, y: 0 }];
  direction = "right";
  score = 0;
  scoreElement.textContent = "Score: 0";
  gameBoard.innerHTML = "";
}

function generateFood() {
  const maxXPos = Math.floor(gameBoard.clientWidth / SIZE) - 1;
  const maxYPos = Math.floor(gameBoard.clientHeight / SIZE) - 1;
  let validPosition = false;

  while (!validPosition) {
    food.x = Math.floor(Math.random() * maxXPos) + 1;
    food.y = Math.floor(Math.random() * maxYPos) + 1;

    validPosition = snake.every(
      (part) => part.x !== food.x || part.y !== food.y
    );
  }

  let randomIndex;
  if (Math.random() < 0.1) {
    randomIndex = Math.floor(Math.random() * (foodEmojis.length - 1));
  } else {
    randomIndex = Math.floor(Math.random() * foodEmojis.length);
  }
  currentFoodEmoji = foodEmojis[randomIndex];
  
  const foodElement = document.createElement("div");
  foodElement.classList.add("food");
  foodElement.innerHTML = currentFoodEmoji;
  foodElement.style.left = food.x * SIZE + "px";
  foodElement.style.top = food.y * SIZE + "px";
  gameBoard.appendChild(foodElement);
}

function createSnake() {
  for (let i = 0; i < 1; i++) {
    snake.push({ x: 0, y: 0 });
  }
}

function moveSnake() {
  const head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  if (head.x < 0) head.x = Math.floor(gameBoard.clientWidth / SIZE) - 1;
  if (head.y < 0) head.y = Math.floor(gameBoard.clientHeight / SIZE) - 1;
  if (head.x >= Math.floor(gameBoard.clientWidth / SIZE)) head.x = 0;
  if (head.y >= Math.floor(gameBoard.clientHeight / SIZE)) head.y = 0;

  snake.unshift(head);
  let currentSpeed;
  if (head.x === food.x && head.y === food.y) {
    const position = foodEmojis.findIndex(item => item === currentFoodEmoji);
    if (scoreBoosterFood === position) {
      score += 5;
      normalFoodSound.pause();
      specialFoodSound.play();
    } else if(randomScoreBoosterFood === position){
      score += Math.floor(Math.random() * 5) + 1;
      normalFoodSound.pause();
      specialFoodSound.play();
    } else {
      score += 1;
      specialFoodSound.pause();
      normalFoodSound.play();
    }
    scoreElement.textContent = "Score: " + score;
    
    generateFood();
    specialFoodSound.currentTime = 0;
    normalFoodSound.currentTime = 0;
  } else {
    snake.pop();
  }

  if (checkCollision(head)) {
    clearInterval(intervalId);
    musicSound.pause();
    gameOverSound.play();
    if (score > 0) {
      if (!localStorage.getItem("playerScore")) {
        localStorage.setItem("playerScore",score);
      } else {
        if (score > localStorage.getItem("playerScore")) {
          localStorage.setItem("playerScore",score);
        }
      }
      const gameOverDialog = document.querySelector("#gameOverDialog");
      document.querySelector("#gameOverDialog p").innerHTML = `<strong>${playerName}</strong>, Your final score is <strong>${score}</strong>`;
      gameOverDialog.showModal();
      document.querySelector("#playerHIScore").innerText = `High Score: ${localStorage.getItem("playerScore") || 0}`;
    }
    resetGame();
    startButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    restartButton.disabled = true;
    return;
  }

  updateGameBoard();
  currentSpeed = SPEED - Math.floor(score / 5) * 10;
  clearInterval(intervalId);
  intervalId = setInterval(moveSnake, currentSpeed > 0 ? currentSpeed : 10);
}

function closeGameOverDialog() {
  gameOverDialog.close();
}

function checkCollision(head) {
  const collision = snake.some(
    (part, index) => index !== 0 && part.x === head.x && part.y === head.y
  );

  return collision;
}

function updateGameBoard() {
  gameBoard.innerHTML = "";
  let snakeColor = Math.floor(Math.random() * 360);
  let snakeColorIncrement = 10;
  snake.forEach((part, index) => {
    const snakePart = document.createElement("div");
    snakePart.className = "snake";
    snakePart.textContent = index === 0 ? "👀" : "";
    snakePart.style.left = part.x * SIZE + "px";
    snakePart.style.top = part.y * SIZE + "px";
    snakeColor += snakeColorIncrement % 360;
    snakePart.style.background = `hsl(${snakeColor}, 100%, 50%)`;
    gameBoard.appendChild(snakePart);
  });

  const foodElement = document.createElement("div");
  foodElement.classList.add("food");
  foodElement.innerHTML = currentFoodEmoji;
  foodElement.style.left = food.x * SIZE + "px";
  foodElement.style.top = food.y * SIZE + "px";
  gameBoard.appendChild(foodElement);
}

function handleKeyDown(event) {
  moveSound.play();
  switch (event.key) {
    case "ArrowUp":
      if (direction !== "down") direction = "up";
      break;
    case "ArrowDown":
      if (direction !== "up") direction = "down";
      break;
    case "ArrowLeft":
      if (direction !== "right") direction = "left";
      break;
    case "ArrowRight":
      if (direction !== "left") direction = "right";
      break;
  }
}

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();
  const touchEndX = event.touches[0].clientX;
  const touchEndY = event.touches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && direction !== "left") direction = "right";
    else if (diffX < 0 && direction !== "right") direction = "left";
  } else {
    if (diffY > 0 && direction !== "up") direction = "down";
    else if (diffY < 0 && direction !== "down") direction = "up";
  }
}