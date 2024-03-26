/*
  I don't have enough experience with javascript. So let's make a simple
  snake game that will be set in a 3D environment. The game will be
  first have a 2D version and then we will add the 3D environment, if
  I can figure that out.
*/

var DEBUG = true;

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

    // init board and direction matrix
    this.clearBoard()
    this.clearDirection()

    // init snake position
    this.head = this.getRandomBoardCell();
    this.board[this.head.row][this.head.col] = 1;
    this.snakeBody.push(this.head)

    if (DEBUG) { console.log(`Head at (x,y) = (${this.head.col},${this.head.row})`)}

    // all apples must spawn at least alpha blocks away
    // from the head
    this.alpha = 5;
    this.apple = this.genApple();
  }

  // expect cell to be Object[int,int]
  // returns true if given cell coordinate is in any part of the snakeBody
  // otherwise return false
  isCellInBody(cell){
    for (const v of this.snakeBody) {
      if (cell.row === v.row && cell.col === v.col){
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
  // return the object holding the apple's coords
  genApple(){
    let x = this.getRandomBoardCell();
    // while random board cell is in the body
    // or if the cell is too close to the head, generate a new cell
    while(this.isCellInBody(x) || (Math.trunc(euclideanDistance(this.head, x)) < this.alpha)){
      x = this.getRandomBoardCell();
    }
    this.board[x.row][x.col] = 2;
    if (DEBUG) { console.log(`Apple spawn: (x,y) = (${x.col}, ${x.row})`)}

    return x;
  }

  growSnake(moveDirection){
    /* This function is called when the snake head eats an apple.
       Just replace the apple with a new snake body (head), 
       update the direction matrix, and respawn an apple.
    */
    if (DEBUG) { console.log('growSnake'); }
    
    // update direction matrix for old head
    this.direction[this.head.row][this.head.col] = moveDirection;

    // spawn a new head (the apple)
    this.snakeBody.unshift(this.apple);
    this.head = this.snakeBody[0];

    // update board
    this.board[this.head.row][this.head.col] = 1;

    // update direction matrix for new head
    this.direction[this.head.row][this.head.col] = moveDirection;

    // spawn a new apple
    this.apple = this.genApple();
  }

  moveSnake(moveDirection){
    /* This function is called if the snake hasn't eaten an apple 
       and thus we need to simulate moving the entire snake forward.
    */
    
    // update the direction matrix with the direction
    // current head is moving
    this.direction[this.head.row][this.head.col] = moveDirection;

    // move snake by using the direction in the direction matrix
    var row, col, currDir;
    for(const i in this.snakeBody){
      row = this.snakeBody[i].row;
      col = this.snakeBody[i].col;
      currDir = this.direction[row][col];

      if (DEBUG) { console.log(`currDir = ${currDir}`)}

      this.board[row][col] = 0; // clear curr
      
      switch(currDir){
        case 0: // up
          row--;
          this.snakeBody[i] = {row: row, col: col};
          this.board[row][col] = 1;
          break;
        case 1: // right
          col++;
          this.snakeBody[i] = {row: row, col: col};
          this.board[row][col] = 1;
          break;
        case 2: // down
          row++;
          this.snakeBody[i] = {row: row, col: col};
          this.board[row][col] = 1;
          break;
        case 3: // left
          col--;
          this.snakeBody[i] = {row: row, col: col};
          this.board[row][col] = 1;
          break;
      }
    }

    // update head pointer (first block in list)
    this.head = this.snakeBody[0];
 
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
    // grow the snake if ate the apple
    if (nextCell.row === this.apple.row && nextCell.col === this.apple.col) {
      this.growSnake(moveDirection);
    } else {
      // just move the snake in moveDirection
      this.moveSnake(moveDirection);
    }

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

  // clears the direction matrix
  clearDirection(){
    this.direction = [];
    for(let i = 0; i < this.gridHeight; i++){
      let tmp = [];
      for(let j = 0; j < this.gridWidth; j++){
        tmp.push(-1);
      }
      this.direction.push(tmp);
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
    */

    if (DEBUG) {
      console.log(`Before Board:`);
      printBoard(this.board);
      console.log(`Before Direction`)
      printBoard(this.direction);
    }
   
    // TODO:
    // Expected output from updateSnake
    // 0 - ok, updated, continue game.
    // 1 - win, game over - no more cells to move in!
    // -1 - loss, game over - collision detected.
    let updateSnakeResult = this.updateSnake(moveDirection);


    if (DEBUG) {
      console.log(`updateSnake returned: ${updateSnakeResult}`)
      console.log(`After Board:`);
      printBoard(this.board);
      console.log(`After Direction`)
      printBoard(this.direction);
    }

    return updateSnakeResult;
  }

}

function printBoard(board) {
  board.forEach(row => {
    console.log(row.join(' '));
  });
}

export default SnakeGame;