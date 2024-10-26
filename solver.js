// ---------------------------------------------------------------
// | Step 1: Figure puzzle dimensions and if it's a wrap puzzle; |
// ---------------------------------------------------------------

const boardElement = document.querySelector(".board-back");
const boardElementHeight = boardElement.offsetHeight;
const boardElementWidth = boardElement.offsetWidth;

// The board element seems to have 1px... padding? margin?
// And the cells, despite being 25px large each, occupy 28px each due to spacing
const GRID_HEIGHT = (boardElementHeight - 1) / 28;
const GRID_WIDTH = (boardElementWidth - 1) / 28;

// Figure out if the puzzle is a wrap-type puzzle
// By looking for the wrap helper elements
const aWrapElementChildMaybe = boardElement.querySelector(".wrapH", ".wrapV");
const WRAP_ACTIVE = (null == aWrapElementChildMaybe) ? false : true;

// Log grid size for easy checking
console.log("Pipes Solver: "
          + "grid is " + GRID_HEIGHT + " by " + GRID_WIDTH
          + ", and it " + (WRAP_ACTIVE ? "wraps" : "doesn't wrap") + "."
);

// -----------------------------
// | Step 2: parse board state |
// -----------------------------

// Fetch all cell elements from DOM
const gridCellElements = boardElement.getElementsByClassName("cell");

// Define some useful enums
const Directions = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",

    // TODO: might be bad practice to put this function here?
    rotateClockwise(direction, times = 1) {
        const cycle = [this.UP, this.RIGHT, this.DOWN, this.LEFT];
        const initialIndex = cycle.indexOf(direction);
        if(-1 === initialIndex) return null; // not a valid direction

        const finalIndex = (initialIndex + times) % 4;

        return cycle[finalIndex];
    }
});

// Grid will be a matrix (array of arrays) of AbstractGridCell-derived objects
const grid = [];
for (let colIndex = 0; colIndex < GRID_HEIGHT; ++colIndex) {
    const currentRow = [];
    for (let rowIndex = 0; rowIndex < GRID_WIDTH; ++rowIndex) {
        // push() current element into currentRow
        const currentGridCellElementIndex = colIndex * GRID_WIDTH + rowIndex;
        const currentGridCellElement = gridCellElements[currentGridCellElementIndex];

        const currentGridCellObject = cellElementToCellObject(currentGridCellElement);

        currentRow.push(currentGridCellObject);
    }
    grid.push(currentRow);
}

// Log stringified grid for easy checking (and style points)
console.log("Your grid should look like this:\n" + stringifyGrid(grid, GRID_HEIGHT, GRID_WIDTH));