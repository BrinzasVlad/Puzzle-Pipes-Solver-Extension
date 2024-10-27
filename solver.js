let grid = scanGrid(); // Non-const since we might rescan

// Log grid size for easy checking
console.log("Pipes Solver: "
          + "grid is " + grid.height + " by " + grid.width
          + ", and it " + (grid.isWrapActive ? "wraps" : "doesn't wrap") + "."
);

// Log stringified grid for easy checking (and style points)
console.log("Your grid should look like this:\n" + stringifyGrid(grid));