const canvas = document.getElementById('gameCanvas');
const generationLabel = document.getElementById("generation");
const context = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 500;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let cellSize = 10;
let boardRowAmount = Math.floor(canvasWidth/cellSize);
let boardColumnAmount =  Math.floor(canvasHeight/cellSize);
let gameIntervalId;
let drawIntervalId;
let generationId = 0;
let grid = [];


//class that represents individual cell with 2 properties
class Cell {
    constructor(){
        this.alive = false;
        this.livingNeighbors = 0;
    }
}

//create the grid and draw the initial borders when the page loads
function init(){
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    grid = initBoard();
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            //draw the borders
            context.strokeRect(row * cellSize, column * cellSize, cellSize, cellSize)
            context.fillStyle = "white";
            context.fillRect(row * cellSize, column * cellSize, cellSize, cellSize);
        }
    }
}

//creating the cell's grid
function initBoard() {
    let grid = [];
    for (let row = 0; row < boardRowAmount; row++) {
      grid[row] = [];
      for (let col = 0; col < boardColumnAmount; col++) {
        grid[row][col] = new Cell();
        }
    }
    return grid;
}

//check if the coordinates are in the canvas boundries
function inBounds(row, column){
    return row >= 0 && row < boardRowAmount && column >= 0 && column < boardColumnAmount;
}

function isUnderPopulated(cell){
    return cell.livingNeighbors < 2;
}

function isOverPopulated(cell){
    return cell.livingNeighbors > 3;
}

function canResurrect(cell){
    return cell.alive === false && cell.livingNeighbors === 3;
}

//check all cell's neighbors (alive or dead)
function checkNeighbors(cell, cellRow, cellColumn){
    for(let row=-1;row<=1;row++){
        for(let column=-1; column<=1; column++){
            //if k and l are 0 it means that we need to skip the cell
            if(!(row === 0 && column === 0)){
                if(inBounds(row + cellRow, column + cellColumn)){
                    let neighbor = grid[row + cellRow][column + cellColumn];
                    if(neighbor.alive){
                        cell.livingNeighbors++;
                    }
                }
            }
        }
    }
}

//check the state of each cell
function checkCellCondition(){
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            //get the current cell
            let cell = grid[row][column];
            if(isUnderPopulated(cell) || isOverPopulated(cell)){
                cell.alive = false;
            }
            else if (canResurrect(cell)){
                cell.alive = true;
            }
        }
    }
}

/*
* This function does 2 things:
* 1. Checks the state of all cell neighbors .
* 2. Checks the condition of each cell and update it respectievly
*/
function game(){
    //check cell neighbors
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            //get the current cell
            let cell = grid[row][column];
            cell.livingNeighbors = 0;
            //check his neighbors and increase living neighbors
            checkNeighbors(cell, row, column);
        }
    }
    //check the condition of the current cell
    checkCellCondition();
    generationId++;
}


//function for drawing cells and borders
function drawCells(){
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            //draw the borders
            context.strokeRect(row * cellSize, column * cellSize, cellSize, cellSize)
            //choose the color that is determined by cell state
            let cell = grid[row][column];
            context.fillStyle = cell.alive ? 'black' : "white";
            context.fillRect(row * cellSize,column * cellSize, cellSize, cellSize);
        }
    }
    generationLabel.innerText = generationId;
}

//function for clearing the board and seeting generation to zero
function clearBoard(){
    console.log("clear");
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            grid[row][column].alive = false;
        }
    }
    generationId = 0;
    generationLabel.innerText = generationId;
}

//*********** This section is for drawing shapes accroding to user choice */

function drawRandom(){
    console.log("random");
    for(let row=0; row<boardRowAmount; row++){
        for(let column=0; column<boardColumnAmount; column++){
            grid[row][column].alive = Math.random() > 0.5;
        }
    }
}

function drawSmallExploder(){
    let middleRow = Math.floor(boardRowAmount/2);
    let middleColumn = Math.floor(boardColumnAmount/2);
    grid[middleRow][middleColumn].alive = true;
    grid[middleRow][middleColumn+1].alive = true;
    grid[middleRow+1][middleColumn+1].alive = true;
    grid[middleRow-1][middleColumn+1].alive = true;
    grid[middleRow+1][middleColumn+2].alive = true;
    grid[middleRow-1][middleColumn+2].alive = true;
    grid[middleRow][middleColumn+3].alive = true;
}

function drawGlider(){
    let middleRow = Math.floor(boardRowAmount/2);
    let middleColumn = Math.floor(boardColumnAmount/2);
    grid[middleRow][middleColumn].alive = true;
    grid[middleRow+1][middleColumn+1].alive = true;
    grid[middleRow-1][middleColumn+2].alive = true;
    grid[middleRow][middleColumn+2].alive = true;
    grid[middleRow+1][middleColumn+2].alive = true;
}

function drawExploder(){
    let middleRow = Math.floor(boardRowAmount/2);
    let middleColumn = Math.floor(boardColumnAmount/2);
    grid[middleRow][middleColumn].alive = true;
    for (let column = middleColumn;column < middleColumn + 5; column++){
        grid[middleRow+2][column].alive = true;
    }
    for (let column = middleColumn;column < middleColumn + 5; column++){
        grid[middleRow-2][column].alive = true;
    }
    grid[middleRow][middleColumn+4].alive = true;
}

function drawTenCellRow(){
    let middleRow = Math.floor(boardRowAmount/2)-5;
    let middleColumn = Math.floor(boardColumnAmount/2);
    for (let row = middleRow; row < middleRow + 10; row++){
        grid[row][middleColumn].alive = true;
    }
}

/***  End of drawing section */

//handeling the choose event from dropdown box
let optionsDropDown = document.getElementById("options");
optionsDropDown.addEventListener("change", function(){
    if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "1"){
        clearBoard();  
    }
    else if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "2"){
        clearBoard();  
        drawRandom();
    }
    else if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "3"){
        clearBoard();  
        drawGlider();
    }
    else if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "4"){
        clearBoard();  
        drawSmallExploder();
    }
    else if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "5"){
        clearBoard();  
        drawExploder();
    }
    else if (optionsDropDown.options[optionsDropDown.selectedIndex].value === "6"){
        clearBoard();  
        drawTenCellRow();
    }
    drawCells();
    
});

//handeling the click event on start button
let startButton = document.getElementById("start");
startButton.addEventListener("click", function(){

    //if the game is running
    if(startButton.value === "start"){
        console.log(startButton.value);
        startButton.value = "stop";
        startButton.innerText = "Stop!"
        gameIntervalId = setInterval(game, 500);
        drawIntervalId = setInterval(drawCells, 500);
    }
    //else the game was stopped
    else{
        console.log(startButton.value);
        startButton.value = "start";
        startButton.innerText = "Start!"
        clearInterval(gameIntervalId);
        clearInterval(drawIntervalId);
    }
});

//this function resurrects a cell by the user clicks on the canvas
function resurrectCell(column, row){
    let cell = grid[row][column];
    cell.alive = cell.alive ? false : true;
    context.fillStyle = cell.alive ? 'black' : "white";
    context.fillRect(row * cellSize,column * cellSize, cellSize, cellSize);
    drawCells();

}

//handeling the click from the user
canvas.addEventListener("click", function(evt){
    let rect = canvas.getBoundingClientRect();
    let x =  evt.clientX - rect.left;
    let y =  evt.clientY - rect.top;
    let row = Math.floor(x/cellSize);
    let column = Math.floor(y/cellSize);
    resurrectCell(column, row);

});

//handeling the board size choice
let cellSizeChoice = document.getElementById("size");
cellSizeChoice.addEventListener("change", function(){
    if(startButton.value === "start"){
        cellSize = cellSizeChoice.value;
        boardRowAmount = Math.ceil(canvasWidth/cellSize);
        boardColumnAmount = Math.ceil(canvasHeight/cellSize);
        init();
        generationId = 0;
        generationLabel.innerText = generationId;
    }
});

init();