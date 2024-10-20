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
    UP: Symbol("up"),
    DOWN: Symbol("down"),
    LEFT: Symbol("left"),
    RIGHT: Symbol("right"),

    // TODO: might be bad practice to put this function here?
    rotateClockwise(direction, times) {
        const cycle = [this.UP, this.RIGHT, this.DOWN, this.LEFT];
        const initialIndex = cycle.indexOf(direction);
        if(-1 === initialIndex) return null; // not a valid direction

        const finalIndex = (initialIndex + times) % 4;

        return cycle[finalIndex];
    }
});

// Define some cell objects
class AbstractGridCell {
    DOMElement; // the actual cell in the HTML DOM corresponding to this
    blockedDirections; // directions (as per enum) in which this cell CANNOT connect
    forcedDirections; // directions (as per enum) in which this cell MUST connect
    facingDirection; // direction this cell is facing; in the "default" look, cell is facing DOWN

    constructor(cellDOMElement, facingDirection) {
        this.DOMElement = cellDOMElement;
        this.blockedDirections = new Set();
        this.forcedDirections = new Set();
        this.facingDirection = facingDirection;
    }

    rotate() {
        this.DOMElement.click(); // Rotates clockwise once, as per current puzzle-pipes.com functionality
        this.facingDirection = Directions.rotateClockwise(this.facingDirection);
    }

    handleBlockedDirection(direction) {
        console.log("Abstract method handleBlockedDirection used! You should override it!");
    }
    blockDirection(direction) {
        if(!Object.values(Directions).includes(direction)) {
            console.log("Was requested to block invalid direction " + direction);
        }
        this.blockedDirections.add(direction);
        this.handleBlockedDirection(direction);
    }

    handleForcedDirection(direction) {
        console.log("Abstract method handleForcedDirection used! You should override it!");
    }
    forceDirection(direction) {
        if(!Object.values(Directions).includes(direction)) {
            console.log("Was requested to force invalid direction " + direction);
        }
        this.forcedDirections.add(direction);
        this.handleForcedDirection(direction);
    }
}

/// Those nub-shaped cells with a single path out
/// In default look, cell is facing DOWN and that's the
/// direction the single path out points
class NubCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch (this.facingDirection) {
            case Directions.UP: return '╹';
            case Directions.DOWN: return '╻';
            case Directions.LEFT: return '╸';
            case Directions.RIGHT: return '╺';
        }
    }
}

/// The line-shaped cells
/// In default look, cell is facing DOWN and the pipe
/// is aligned UP-DOWN
/// Note that facing UP/DOWN and facing LEFT/RIGHT are
/// identical for this type of cell
class LineCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection)
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP:
            case Directions.DOWN:
                return '┃';
            case Directions.LEFT:
            case Directions.RIGHT:
                return '━';
        }
    }
}

/// The elbow-shaped cells
/// In default look, cell is facing DOWN and it
/// looks like the letter L (so one pipe goes UP
/// and one pipe goes RIGHT)
class ElbowCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┓';
            case Directions.DOWN: return '┗';
            case Directions.LEFT: return '┏';
            case Directions.RIGHT: return '┛';
        }
    }
}

/// The T-shaped cells with a single blocked path
/// In default look, cell is facing DOWN and it
/// looks like the letter T (so blocked path is UP)
class ThreeWayCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┻';
            case Directions.DOWN: return '┳';
            case Directions.LEFT: return '┫';
            case Directions.RIGHT: return '┣';
        }
    }
}

// Grid will be a matrix (array of arrays) of AbstractGridCell-derived objects
const grid = [];
for (let colIndex = 0; colIndex < GRID_HEIGHT; ++colIndex) {
    const currentRow = [];
    for (let rowIndex = 0; rowIndex < GRID_WIDTH; ++rowIndex) {
        // push() current element into currentRow
        const currentGridCellElementIndex = colIndex * GRID_WIDTH + rowIndex;
        const currentGridCellElement = gridCellElements[currentGridCellElementIndex];

        const currentGridPipeClass = currentGridCellElement.className.match(/pipe[1-9][0-4]?/); // 'pipe1' to 'pipe14'
        const currentGridRotationClass = currentGridCellElement.className.match(/cell-[0-3]/); // 'cell-0' to 'cell-3'

        // Hacky lambda to enclose a switch in an assignment
        const clockwiseRotationsFromRotationClass = ((currentGridRotationClass) => {
            // Hack: turn back to primitive JavaScript string (as opposed to
            // String *object*, so switch calls can work properly)
            switch (String(currentGridRotationClass)) {
                case "cell-0": return 0;
                case "cell-3": return 1;
                case "cell-2": return 2;
                case "cell-1": return 3;
            }
        })(currentGridRotationClass);

        // Hacky lambda AND ugly switch; maybe we'd want a hard-coded map or something?
        // TODO: consider alternatives to a hard-coded switch
        const {CellClassToCreate, clockwiseRotationsFromPipeClass} = ((currentGridPipeClass) => {
            let CellClassToCreate, clockwiseRotationsFromPipeClass;
            
            // Hack: turn back to primitive JavaScript string (as opposed to
            // String *object*, so switch calls can work properly)
            currentGridPipeClass = String(currentGridPipeClass);

            // Figure what type of cell this is
            switch (currentGridPipeClass) {
                case "pipe1":
                case "pipe2":
                case "pipe4":
                case "pipe8":
                    CellClassToCreate = NubCell;
                    break;
                case "pipe3":
                case "pipe6":
                case "pipe9":
                case "pipe12":
                    CellClassToCreate = ElbowCell;
                    break;
                case "pipe5":
                case "pipe10":
                    CellClassToCreate = LineCell;
                    break;
                case "pipe7":
                case "pipe11":
                case "pipe13":
                case "pipe14":
                    CellClassToCreate = ThreeWayCell;
                    break;
            }

            // Figure how many times it rotated from the "default" orientation for that type
            switch (currentGridPipeClass) {
                case "pipe3":
                case "pipe8":
                case "pipe10":
                case "pipe13":
                    clockwiseRotationsFromPipeClass = 0;
                    break;
                case "pipe4":
                case "pipe5":
                case "pipe9":
                case "pipe14":
                    clockwiseRotationsFromPipeClass = 1;
                    break;
                case "pipe2":
                case "pipe7":
                case "pipe12":
                    clockwiseRotationsFromPipeClass = 2;
                    break;
                case "pipe1":
                case "pipe6":
                case "pipe11":
                    clockwiseRotationsFromPipeClass = 3;
                    break;
            }

            return {CellClassToCreate, clockwiseRotationsFromPipeClass};
        })(currentGridPipeClass);

        // Figure out cell facing direction (default in our system is DOWN)
        const totalRotations = clockwiseRotationsFromRotationClass + clockwiseRotationsFromPipeClass;
        const cellFacingDirection = Directions.rotateClockwise(Directions.DOWN, totalRotations);
        
        if (rowIndex == 0 && colIndex == 0) {
            alert("CellClass: " + CellClassToCreate.name + ", rotations: " + totalRotations);
        }

        // TypeScript would be angry at me for using a dynamically-decided class :D
        // But I'm sure there's some less JavaScript-y way to do this, too
        const currentGridCell = new CellClassToCreate(currentGridCellElement, cellFacingDirection);

        currentRow.push(currentGridCell);
    }
    grid.push(currentRow);
}

// Form a string representation of the grid, just because:
let stringifiedGrid = "";
for (let colIndex = 0; colIndex < GRID_HEIGHT; ++colIndex) {
    for (let rowIndex = 0; rowIndex < GRID_WIDTH; ++rowIndex) {
        stringifiedGrid += grid[colIndex][rowIndex];
    }
    stringifiedGrid += '\n';
}

// Try showing it to be sure:
alert("Your grid should look like this:\n" + stringifiedGrid);
