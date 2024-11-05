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
        solveOneCellButton.onclick = (clickEvent) => {
            // Without preventDefault(), puzzle-pipes.com refreshes the page sort-of,
            // which erases our nicely-added ASCII display
            clickEvent.preventDefault();

            grid = scanGrid(); // Rescan grid, just in case
            // TODO: if our listeners work well, we shouldn't need to rescan here
            
            // Iterate through all cells in grid
            let solvedOne = false;
            for (let cellIndex = 0; cellIndex < grid.height * grid.width; ++cellIndex) {
                const colIndex = Math.floor(cellIndex / grid.width);
                const rowIndex = cellIndex % grid.width;

                // Try solving this cell
                const solvedCell = grid[colIndex][rowIndex].attemptSolve();
                if (solvedCell) {
                    // Indicate correct alignment
                    solveOneCellSolutionPanel.innerHTML =
                        "You should align the cell at"
                      + " [" + (colIndex + 1) + ", " + (rowIndex + 1) + "]"
                      + " (highlighted in green)"
                      + " like this:"
                      + "<br>" + solvedCell;

                    // Highlight cell
                    const solvedCellDOMElement = grid[colIndex][rowIndex].DOMElement;
                    solvedCellDOMElement.classList.add("pipesSolverHighlight");

                    // Remove highlight on first user interaction with cell
                    // FIXME: this does NOT cover cell edit via keyboard
                    const removeHighlightListener = () => {
                        solvedCellDOMElement.classList.remove("pipesSolverHighlight");
                        solvedCellDOMElement.removeEventListener("click", removeHighlightListener);
                        solvedCellDOMElement.addEventListener("contextMenu", removeHighlightListener);
                    }
                    solvedCellDOMElement.addEventListener("click", removeHighlightListener);
                    solvedCellDOMElement.addEventListener("contextMenu", removeHighlightListener);
                    // {once: true} wouldn't work, since we need to listen for either rotate OR pin

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
