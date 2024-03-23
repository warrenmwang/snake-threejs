/*
  I don't have enough experience with javascript. So let's make a simple
  snake game that will be set in a 3D environment. The game will be
  first have a 2D version and then we will add the 3D environment, if
  I can figure that out.
*/

var DEBUG = true;

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
    this.board = []; // store game state 
    this.direction = []; // store the directions snake cells should move in
    this.snakeBody = []; // easy access to snake cells
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    if (DEBUG) { console.log(`Board size: (W,H) = (${this.gridWidth},${this.gridHeight})`)}

    // init board
    this.clearBoard()

    // init snake position
    this.head = this.getRandomBoardCell();
    this.board[this.head.row][this.head.col] = 1;
    this.snakeBody.push(this.head)
    this.tail = this.head; // ptr to tail

    if (DEBUG) { console.log(`Head at (x,y) = (${this.head.col},${this.head.row})`)}

    // all apples must spawn at least alpha blocks away
    // from the head
    this.alpha = 2;
    this.genApple();
  }

  // expect cell to be Object[int,int]
  // returns true if given cell coordinate does not coincide
  // with any part of the snake's current body (including head
  // and tail), otherwise return false
  isCellInBody(cell){
    const row = cell.row;
    const col = cell.col;
    for (const v of this.snakeBody) {
      if (row === v.row && col === v.col){
        return true;
      }
    }
    return false;
  }

  // return true if cell is not in playspace
  // else return false
  isCellInWallOrOutOfBounds(cell){
    // in or jumped beyond any of the walls
    if(cell.row < 0 || cell.col < 0 || cell.row >= this.gridHeight || cell.col >= this.gridWidth){
      return true;
    }
    return false;
  }

  // check if player won snake
  // could check all cells, but that is slower
  // instead, just check the length of the snake body
  // if the len of the snake body is equal to the total numbe of
  // cells in the board, then they have covered the entire board.
  isWin(){
    if(this.snakeBody.length == this.gridWidth*this.gridHeight){
      return true;
    }
    return false;
  }

  // check collision
  // if given cell coincides with either a snake body or a wall
  // return true if no collision, else false
  isNoCollision(cell){
    // snake body
    if( this.isCellInBody(cell) ){
      if (DEBUG) {
        console.log(`Collision detected: cell in snake body. Snake Body:`);
        for(const x of this.snakeBody){
          console.log(`(x,y) = (${x.col},${x.row})`)
        }
      }
      return false;
    }
    // a wall
    if ( this.isCellInWallOrOutOfBounds(cell) ){
      if (DEBUG) {console.log(`Collision detected: cell in a wall`)}
      return false;
    }

    return true;
  }

  // need to generate an apple at a position that is at least
  // alpha blocks away from the snake's head AND
  // isn't in the snake's body in any way
  genApple(){
    let x = this.getRandomBoardCell();
    while(this.isCellInBody(x) && 
          (Math.trunc(euclideanDistance(this.head, x)) >= this.alpha)){
      x = this.getRandomBoardCell();
    }
    this.board[x.row][x.col] = 2;
    if (DEBUG) { console.log(`Apple spawn: (x,y) = (${x.col}, ${x.row})`)}
  }

  // TODO: grow the snake if head coincides with apple cell
  growSnake(moveDirection, nextCell){
    /* grows the snake so the tail should just stay in the same spot 
       and we just update the head forward, thus growing one
       otherwise, if we didn't grow the snake, the "entire body" moves 
       forward.
       therefore, needs to update head, tail, snakebody, directions, board

      Inputs:
      moveDirection - int value indicating a direction in the cardinal directions
      nextCell - next cell that the head is to move in

    */
    if (DEBUG) { console.log('growSnake'); }
    
    // update head
    this.head = nextCell;
    this.snakeBody.unshift(nextCell)

    // update board making nextCell a snake body part
    this.board[nextCell.row][nextCell.col] = 1;
    
    
  }

  updateSnake(moveDirection){
    /* movedirection is an int indicating the direction to move in
      input
      moveDirection
        0 - up
        1 - right
        2 - down
        3 - left
      output
      0 - ok, updated, continue game.
      1 - win, game over - no more cells to move in!
      -1 - loss, game over - collision detected.
    */
    if (DEBUG) { console.log('updateSnake'); }

    // want a shallow copy of head
    let nextCell = { ...this.head };
    // row is y (up and down) , col is x (left and right)
    switch(moveDirection){
      case 0: // up
        nextCell.row--;
        break;
      case 1: // right
        nextCell.col++;
        break;
      case 2: // down
        nextCell.row++;
        break;
      case 3: // left
        nextCell.col--;
        break;
    }

    if (DEBUG) { console.log(`nextCell: (x,y) = (${nextCell.col}, ${nextCell.row})`)}
    
    // check if game over -> hit wall or hit self
    if ( !this.isNoCollision(nextCell) ) {
      return -1;
    }
    // otherwise, update the snake
    this.growSnake(moveDirection, nextCell);
    
    // check win condition (there exists no space left on board)
    // i believe the easiest way to win is if you try hard and 
    // only move your snake in a hamiltonian cycle.
    if (this.isWin()){
      return 1;
    }

    // otherwise, continue the game!
    return 0;
  }

  // clears/resets board
  clearBoard(){
    this.board = [];
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

  // main update entrance function to move from game state n to n+1
  nextGameState(moveDirection){
    /* movedirection is an int indicating the direction to move in
      input
      moveDirection
        0 - up
        1 - right
        2 - down
        3 - left
      output
      0 - ok, updated, continue game.
      1 - win, game over - no more cells to move in!
      -1 - loss, game over - collision detected.
    */

    if (DEBUG) {
      console.log(`Before Board:`);
      printBoard(this.board);
    }
   
    // TODO
    let updateSnakeResult = this.updateSnake(moveDirection);
    console.log(`updateSnake returned: ${updateSnakeResult}`)

    if (DEBUG) {
      console.log(`After Board:`);
      printBoard(this.board);
    }

    return this.board;
  }

}

function printBoard(board) {
  board.forEach(row => {
    console.log(row.join(' '));
  });
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

export default SnakeGame;