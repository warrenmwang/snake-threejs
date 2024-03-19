/*
  I don't have enough experience with javascript. So let's make a simple
  snake game that will be set in a 3D environment. The game will be
  first have a 2D version and then we will add the 3D environment, if
  I can figure that out.
*/

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

// compute the euclidean distance between two points
function euclideanDistance(cell1, cell2){
  return Math.sqrt((cell1.row - cell2.row)**2 + (cell1.col - cell2.col)**2);
}

export class SnakeGame {
  constructor(gridWidth, gridHeight){
    this.score = 0;
    this.board = [];
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // init board
    this.clearBoard()

    // init snake position
    this.head = this.getRandomBoardCell();
    this.board[this.head.row][this.head.col] = 1;
    this.snakeBody = [this.head];
    this.tail = this.head;

    // all apples must spawn at least alpha blocks away
    // from the head
    this.alpha = 2;
    this.genApple();
  }

  // expect cell to be Object[int,int]
  // returns true if given cell coordinate does not coincide
  // with any part of the snake's current body (including head
  // and tail), otherwise return false
  checkCellNotInBody(cell){
    const row = cell.row;
    const col = cell.col;
    for (const v of this.snakeBody) {
      if (row === v.row || col === v.col){
        return false;
      }
    }
    return true;
  }

  // need to generate an apple at a position that is at least
  // alpha blocks away from the snake's head AND
  // isn't in the snake's body in any way
  genApple(){
    let x = this.getRandomBoardCell();
    while(!this.checkCellNotInBody(x) && 
          (Math.trunc(euclideanDistance(this.head, x)) >= this.alpha)){
      x = this.getRandomBoardCell();
    }
    this.board[x.row][x.col] = 2;
  }

  // TODO: grow the snake if head coincides with apple cell
  growSnake(){
    
  }

  // TODO: im not sure how im supposed to handle the movement of the snake
  // like, how do i know how to make the snake body turn wherever the head had turned ? 
  updateSnake(){

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
  // returns: Object with 2 properties - row and col (both ints)
  // oh i want types, but we have to walk (js) before we run (ts).
  getRandomBoardCell(){
    let row = Math.trunc(randomValueInRange(0, this.gridHeight));
    let col = Math.trunc(randomValueInRange(0, this.gridWidth));
    return {row:row, col:col};
  }
}

// function devTesting(){
//   let game = new SnakeGame(GRIDSIZE_WIDTH, GRIDSIZE_HEIGHT);
//   // print the board
//   for (const x of game.board) {
//     for (const y of x) {
//       process.stdout.write(`${y} `);
//     }
//     console.log(`\n`);
//   }
// }

// devTesting();