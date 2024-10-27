const stringifyGrid = function(grid, newlineDelimiter = '\n') {
    let stringifiedGrid = "";

    for (let colIndex = 0; colIndex < grid.height; ++colIndex) {
        for (let rowIndex = 0; rowIndex < grid.width; ++rowIndex) {
            stringifiedGrid += grid[colIndex][rowIndex];
        }
        stringifiedGrid += newlineDelimiter;
    }

    return stringifiedGrid;
}