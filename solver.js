// Step 1: Figure puzzle dimensions and if it's a wrap puzzle;

const boardElement = document.querySelector(".board-back");
const boardElementHeight = boardElement.offsetHeight;
const boardElementWidth = boardElement.offsetWidth;

// The board element seems to have 1px... padding? margin?
// And the tiles, despite being 25px large each, occupy 28px each due to spacing
const GRID_HEIGHT = (boardElementHeight - 1) / 28;
const GRID_WIDTH = (boardElementWidth - 1) / 28;

// Figure out if the puzzle is a wrap-type puzzle
// By looking for the wrap helper elements
const aWrapElementChildMaybe = boardElement.querySelector(".wrapH", ".wrapV");
const WRAP_ACTIVE = (null == aWrapElementChildMaybe) ? false : true;