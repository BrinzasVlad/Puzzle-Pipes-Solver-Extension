const stringifyGrid = function(grid, gridHeight, gridWidth, newlineDelimiter = '\n') {
    let stringifiedGrid = "";

    for (let colIndex = 0; colIndex < gridHeight; ++colIndex) {
        for (let rowIndex = 0; rowIndex < gridWidth; ++rowIndex) {
            stringifiedGrid += grid[colIndex][rowIndex];
        }
        stringifiedGrid += newlineDelimiter;
    }

    return stringifiedGrid;
}