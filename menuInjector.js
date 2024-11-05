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

    const solveCellTestButton = createPipesSolverElement("button");
    solveCellTestButton.classList.add("button");
    solveCellTestButton.id = "solveTestButton";
    solveCellTestButton.innerText = "Test Solve";
    solveCellTestButton.onclick = (clickEvent) => {
        // Without preventDefault(), puzzle-pipes.com refreshes the page sort-of,
        // which erases our nicely-added ASCII display
        clickEvent.preventDefault();

        grid = scanGrid(); // Rescan grid
        
        const isSolveSuccessful = grid[0][0].attemptSolve();
        console.log("Was the solve successful? " + (isSolveSuccessful ? "Yes" : "No"));
        console.log("Tile is now " + (grid[0][0].isPinned ? "" : "NOT " + "pinned."));
        console.log("Tile correct position: " + grid[0][0]);
    }
    solverMenuPanel.appendChild(solveCellTestButton);

// ---------------------------------------------------------------
// | Step 3: Insert our own buttons panel below the current ones |
// ---------------------------------------------------------------
// We attach after the share container, but the <p> below it with the YouTube
// tutorial could also be a decent choice, or we could just appendChild() and sit
// at the certified end
const sharePanelDOMElement = buttonsPanelDOMElement.querySelector("#shareContainer");
buttonsPanelDOMElement.insertBefore(solverMenuPanel, sharePanelDOMElement.nextSibling);
