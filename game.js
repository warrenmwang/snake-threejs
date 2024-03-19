/*
  I don't have enough experience with javascript. So let's make a simple
  snake game that will be set in a 3D environment. The game will be
  first have a 2D version and then we will add the 3D environment, if
  I can figure that out.
*/

var assert = require('assert');

// assume these are in pixels
const WIDTH = 500;
const HEIGHT = 500;

// assume a square game board
const GRIDSIZE_WIDTH = 20;
const GRIDSIZE_HEIGHT = 10;

/*
  Let us define the values in the board that will represent different things:
  0 - Empty Space
  1 - Snake Body
  2 - Apple
  And that's all the parts there are to snake, as I remember it.
*/

// returns a random value in range [min, max)
function randomValueInRange(min, max){
  return Math.random() * (max - min) + min;
}

class SnakeGame {
  constructor(gridWidth, gridHeight){
    this.score = 0;
    this.board = [];
    assert.notEqual(gridWidth, undefined)
    assert(gridHeight, undefined)
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // init board
    this.clearBoard()
  }

  // clears board
  clearBoard(){
    for(let i = 0; i < this.gridHeight; i++){
      let tmp = [];
      for(let j = 0; j < this.gridWidth; j++){
        tmp.push(0);
      }
      this.board.push(tmp);
    }
  }

  // get a random valid board position
  // will be used to spawn in apples
  getRandomBoardCell(){
    let row = Math.trunc(randomValueInRange(0, this.gridHeight));
    let col = Math.trunc(randomValueInRange(0, this.gridWidth));
    return {row:row, col:col};
  }
}

function devTesting(){
  let game = new SnakeGame(GRIDSIZE_WIDTH, GRIDSIZE_HEIGHT);
  console.log(game.board);
  console.log(game.getRandomBoardCell())
}

devTesting();