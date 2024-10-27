const scanGrid = function () {
    // We're semi-hacking
    // Grid will be a 2-dimensional array of cells,
    // But we're also injecting a few extra properties into it, like height and width
    const grid = [];

    // ---------------------------------------------------------------
    // | Step 1: Figure puzzle dimensions and if it's a wrap puzzle; |
    // ---------------------------------------------------------------

    const boardElement = document.querySelector(".board-back");
    const boardElementHeight = boardElement.offsetHeight;
    const boardElementWidth = boardElement.offsetWidth;

    // The board element seems to have 1px... padding? margin?
    // And the cells, despite being 25px large each, occupy 28px each due to spacing
    grid.height = (boardElementHeight - 1) / 28;
    grid.width = (boardElementWidth - 1) / 28;

    // Figure out if the puzzle is a wrap-type puzzle
    // By looking for the wrap helper elements
    const aWrapElementChildMaybe = boardElement.querySelector(".wrapH", ".wrapV");
    grid.isWrapActive = (null == aWrapElementChildMaybe) ? false : true;

    // -----------------------------
    // | Step 2: parse board state |
    // -----------------------------

    // Fetch all cell elements from DOM
    const gridCellElements = boardElement.getElementsByClassName("cell");

    // Create cell objects and add into grid object
    for (let colIndex = 0; colIndex < grid.height; ++colIndex) {
        const currentRow = [];
        for (let rowIndex = 0; rowIndex < grid.width; ++rowIndex) {
            // push() current element into currentRow
            const currentGridCellElementIndex = colIndex * grid.width + rowIndex;
            const currentGridCellElement = gridCellElements[currentGridCellElementIndex];

            const currentGridCellObject = cellElementToCellObject(currentGridCellElement);

            currentRow.push(currentGridCellObject);
        }
        grid.push(currentRow);
    }

    // ----------------------------------------
    // | Step 3: set up neighbour connections |
    // ----------------------------------------

    const wallCell = new WallCell(); // Can reuse the same for everyone, since it does no context-dependent processing

    for (let colIndex = 0; colIndex < grid.height; ++colIndex) {
        for (let rowIndex = 0; rowIndex < grid.width; ++rowIndex) {
            if (undefined === grid[colIndex][rowIndex]) {
                alert("Grid at [" + colIndex + "][" + rowIndex + "] is undefined!!");
                return grid;
            }

            // UP neighbour
            if (0 === colIndex) {
                if (grid.isWrapActive) {
                    // Wrap around to bottommost cell
                    grid[colIndex][rowIndex].neighbours[Directions.UP] = grid[grid.height - 1][rowIndex];
                }
                else {
                    // Above us is just wall
                    grid[colIndex][rowIndex].neighbours[Directions.UP] = wallCell;
                }
            }
            else {
                // Neighbour is cell one above
                grid[colIndex][rowIndex].neighbours[Directions.UP] = grid[colIndex - 1][rowIndex];
            }

            // DOWN neighbour
            if (grid.height - 1 === colIndex) {
                if (grid.isWrapActive) {
                    // Wrap around to topmost cell
                    grid[colIndex][rowIndex].neighbours[Directions.DOWN] = grid[0][rowIndex];
                }
                else {
                    // Below us is just wall
                    grid[colIndex][rowIndex].neighbours[Directions.DOWN] = wallCell;
                }
            }
            else {
                // Neighbour is cell one below
                grid[colIndex][rowIndex].neighbours[Directions.DOWN] = grid[colIndex + 1][rowIndex];
            }

            // LEFT neighbour
            if (0 == rowIndex) {
                if (grid.isWrapActive) {
                    // Wrap around to rightmost cell
                    grid[colIndex][rowIndex].neighbours[Directions.LEFT] = grid[colIndex][grid.width - 1];
                }
                else {
                    // Left of us is just wall
                    grid[colIndex][rowIndex].neighbours[Directions.LEFT] = wallCell;
                }
            }
            else {
                // Neighbour is cell one to the left
                grid[colIndex][rowIndex].neighbours[Directions.LEFT] = grid[colIndex][rowIndex - 1];
            }

            // RIGHT neighbour
            if (grid.width == rowIndex) {
                if (grid.isWrapActive) {
                    // Wrap around to leftmost cell
                    grid[colIndex][rowIndex].neighbours[Directions.RIGHT] = grid[colIndex][0];
                }
                else {
                    // Right of us is just wall
                    grid[colIndex][rowIndex].neighbours[Directions.RIGHT] = wallCell
                }
            }
            else {
                // Neighbour is cell one to the right
                grid[colIndex][rowIndex].neighbours[Directions.RIGHT] = grid[colIndex][rowIndex + 1];
            }
        }
    }

    // Finally, return the grid object
    return grid;
}