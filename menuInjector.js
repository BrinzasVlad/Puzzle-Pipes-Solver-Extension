// -------------------------------------------------------------------------------------------
// | Step 1: Locate the DOM element storing the puzzle buttons (like Done, Start Over, etc.) |
// -------------------------------------------------------------------------------------------
const buttonsPanelDOMElement = document.querySelector(".puzzleButtons");

// ------------------------------------------
// | Step 1.5: Set up night mode compliance |
// ------------------------------------------
const nightModeCheckBox = document.querySelector("#night-mode");
const nightModeCompliantElements = [];
let isNightModeOn = nightModeCheckBox.checked;
const NIGHTMODE_CLASS_NAME = "nightmode";
nightModeCheckBox.addEventListener("change", () => {
    isNightModeOn = nightModeCheckBox.checked;
    for (const element of nightModeCompliantElements) {
        element.classList.toggle(NIGHTMODE_CLASS_NAME);
    }
});

// ----------------------------------------
// | Step 2: Produce our own little panel |
// ----------------------------------------
// Helper function to nicely tag all the elements we add
const createPipesSolverElement = function(...args) {
    const element = document.createElement(...args);
    element.className = "pipesSolver";

    // Night mode compliance
    if (isNightModeOn) element.classList.add("nightmode");
    nightModeCompliantElements.push(element);

    return element;
};

// Indentation used to show which thing goes where, but it'd probably be better to use
// files or functions or some other form of separation
const solverMenuPanel = createPipesSolverElement("div");
solverMenuPanel.id = "solverMenuPanel";
    const showGridSubPanel = createPipesSolverElement("div");
    showGridSubPanel.id = "showGridSubPanel";
    showGridSubPanel.classList.add("subPanel");
        const gridDisplayDiv = createPipesSolverElement("div");
        gridDisplayDiv.id = "gridDisplay";

        const refreshGridDisplayButton = createPipesSolverElement("button");
        refreshGridDisplayButton.classList.add("button");
        refreshGridDisplayButton.id = "refreshGridDisplayButton"
        refreshGridDisplayButton.innerText = "Refresh Grid Display"
        refreshGridDisplayButton.onclick = (clickEvent) => {
            // Without preventDefault(), puzzle-pipes.com refreshes the page sort-of,
            // which erases our nicely-added ASCII display
            clickEvent.preventDefault();

            // Kinda' hacky that we use these values here without saying
            // that we're borrowing them from solver.js
            gridDisplayDiv.innerHTML = stringifyGrid(grid, "<br>");
        }

        showGridSubPanel.appendChild(refreshGridDisplayButton);
        showGridSubPanel.appendChild(gridDisplayDiv);
    solverMenuPanel.appendChild(showGridSubPanel);

    const solveOneCellPanel = createPipesSolverElement("div");
    solveOneCellPanel.id = "solveOneCellPanel";
    solveOneCellPanel.classList.add("subPanel");
        const solveOneCellSolutionPanel = createPipesSolverElement("div");
        solveOneCellSolutionPanel.id = "solveOneCellSolutionPanel";

        const solveOneCellButton = createPipesSolverElement("button");
        solveOneCellButton.classList.add("button");
        solveOneCellButton.id = "solveOneCellButton";
        solveOneCellButton.innerText = "Solve One Cell";

        // Keep track of already-solved-and-highlighted cells
        // so as to not pick them again when clicking the button.
        // Using a set for handy remove (and as a just-in-case
        // guard against double adding).
        const currentlyHighlightedCellIndices = new Set();
        solveOneCellButton.onclick = (clickEvent) => {
            // Without preventDefault(), puzzle-pipes.com refreshes the page sort-of,
            // which erases our nicely-added ASCII display
            clickEvent.preventDefault();

            grid = scanGrid(); // Rescan grid, just in case
            // Grid is 99% of the time actually correct, but scanning is fast enough to be
            // unnoticeable to the user, and some edge scenarios (see possible_issues.txt)
            // sometimes can cause desyncs.
            
            // Iterate through all cells in grid
            let solvedOne = false;
            const totalCells = grid.height * grid.width;

            // Start from a random index for a more natural user experience
            // Loop index around if it goes past the maximum index
            for (
                let cellsChecked = 0, cellIndex = Math.floor(Math.random() * totalCells);
                cellsChecked < totalCells;
                ++cellsChecked, cellIndex = (cellIndex + 1) % totalCells
            ) {
                const colIndex = Math.floor(cellIndex / grid.width);
                const rowIndex = cellIndex % grid.width;
                const currentCell = grid[colIndex][rowIndex];

                // If cell is already highlighted, skip it (it's already solved)
                if (currentlyHighlightedCellIndices.has(cellIndex)) continue;

                // Try solving this cell
                const correctFacingDirection = currentCell.attemptSolve();
                if (null !== correctFacingDirection) {
                    // Indicate correct alignment
                    solveOneCellSolutionPanel.innerHTML =
                        "You should rotate the cell at"
                      + " [" + (colIndex + 1) + ", " + (rowIndex + 1) + "]"
                      + " until it is highlighted forest green,"
                      + " then pin it.";

                    // Highlight cell with correct colour
                    const solvedCellDOMElement = currentCell.DOMElement;
                    const initialHighlightClass = 
                        "pipesSolverHighlight-"
                      + currentCell.rotationsNeededToFaceDirection(correctFacingDirection)
                      + "-away";
                    solvedCellDOMElement.classList.add(initialHighlightClass);

                    // Add cell to highlighted cells set
                    currentlyHighlightedCellIndices.add(cellIndex);

                    // Update highlight as user rotates cell
                    // FIXME: update listener does NOT cover cell rotate via keyboard
                    const updateHighlightListener = () => {
                        const updatedHightlightClass = 
                            "pipesSolverHighlight-"
                            + currentCell.rotationsNeededToFaceDirection(correctFacingDirection)
                            + "-away";

                        solvedCellDOMElement.className = solvedCellDOMElement.className
                            .replace(/pipesSolverHighlight-[0-3]-away/, updatedHightlightClass);
                    };
                    solvedCellDOMElement.addEventListener("click", updateHighlightListener);

                    // Remove highlight (and listeners) when the user pins the cell correctly
                    // FIXME: this does NOT cover cell edit via keyboard
                    const removeHighlightListener = () => {
                        const rotationsStillNeeded = currentCell.rotationsNeededToFaceDirection(correctFacingDirection);

                        if (0 == rotationsStillNeeded) {
                            const currentHightlightClass = "pipesSolverHighlight-" + rotationsStillNeeded + "-away";

                            solvedCellDOMElement.classList.remove(currentHightlightClass);
                            currentlyHighlightedCellIndices.delete(cellIndex);

                            solvedCellDOMElement.removeEventListener("click", updateHighlightListener);
                            solvedCellDOMElement.removeEventListener("contextmenu", removeHighlightListener);
                        }
                    };
                    solvedCellDOMElement.addEventListener("contextmenu", removeHighlightListener);

                    // We do NOT need to remove the listeners when the user clicks the 'solve one' button
                    // In fact, multiple cells can be highlighted simultaneously and will track separately

                    // We found one solvable cell, take note and break out of loop
                    solvedOne = true;
                    break;
                }
            }

            // Display failure message if we couldn't find a cell to solve
            if (!solvedOne) {
                solveOneCellSolutionPanel.innerText = "Our solver did not manage to solve any cell.";
            }
        }

        solveOneCellPanel.appendChild(solveOneCellButton);
        solveOneCellPanel.appendChild(solveOneCellSolutionPanel);
    solverMenuPanel.appendChild(solveOneCellPanel);

// ---------------------------------------------------------------
// | Step 3: Insert our own buttons panel below the current ones |
// ---------------------------------------------------------------
// We attach after the share container, but the <p> below it with the YouTube
// tutorial could also be a decent choice, or we could just appendChild() and sit
// at the certified end
const sharePanelDOMElement = buttonsPanelDOMElement.querySelector("#shareContainer");
buttonsPanelDOMElement.insertBefore(solverMenuPanel, sharePanelDOMElement.nextSibling);
