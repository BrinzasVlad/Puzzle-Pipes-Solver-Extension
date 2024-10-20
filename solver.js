// Step 1: Figure puzzle dimensions and if it's a wrap puzzle;
/*const puzzleInfoElement = document.querySelector(".puzzleInfo");
const puzzleInfoRawHTML = puzzleInfoElement.innerHTML;
const puzzleDescriptionText = puzzleInfoRawHTML.search(/[0-9]+x[0-9]+ Pipes /g); */

const boardElement = document.querySelector(".board-back");
const boardElementHeight = boardElement.offsetHeight;
const boardElementWidth = boardElement.offsetWidth;

// The board element seems to have 1px... padding? margin?
// And the tiles, despite being 25px large each, occupy 28px each due to spacing
const GRID_HEIGHT = (boardElementHeight - 1) / 28;
const GRID_WIDTH = (boardElementWidth - 1) / 28;