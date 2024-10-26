const cellElementToCellObject = function(cellDOMElement) {
    // Define class-to-value equivalence maps
    // These are hard-coded from observation; if puzzle-pipes.com makes changes,
    // they may need to be re-researched and updated
    const rotationClassToNumberOfRotations = new Map([
        ["cell-0", 0],
        ["cell-3", 1],
        ["cell-2", 2],
        ["cell-1", 3]
    ]);
    const pipeClassToCellClassAndStartingRotations = new Map([
        ["pipe1",  { cls: BulbCell,      rot: 3 }],
        ["pipe2",  { cls: BulbCell,      rot: 2 }],
        ["pipe3",  { cls: ElbowCell,    rot: 0 }],
        ["pipe4",  { cls: BulbCell,      rot: 1 }],
        ["pipe5",  { cls: LineCell,     rot: 1 }],
        ["pipe6",  { cls: ElbowCell,    rot: 3 }],
        ["pipe7",  { cls: ThreeWayCell, rot: 2 }],
        ["pipe8",  { cls: BulbCell,      rot: 0 }],
        ["pipe9",  { cls: ElbowCell,    rot: 1 }],
        ["pipe10", { cls: LineCell,     rot: 0 }],
        ["pipe11", { cls: ThreeWayCell, rot: 3 }],
        ["pipe12", { cls: ElbowCell,    rot: 2 }],
        ["pipe13", { cls: ThreeWayCell, rot: 0 }],
        ["pipe14", { cls: ThreeWayCell, rot: 1 }]
    ]);

    // Get element CSS classes that identify type and rotation

    // Hack: these return JavaScript String objects, which do not match with JavaScript
    // native string literals if === is used instead of ==. Both maps and switch()
    // statements - the solutions I tried - do a === check, however.
    // So, to hack our way around that, we turn these back into native strings.
    // (That's what the String(...) does.)
    const currentGridPipeClass = String(cellDOMElement.className.match(/pipe[1-9][0-4]?/)); // 'pipe1' to 'pipe14'
    const currentGridRotationClass = String(cellDOMElement.className.match(/cell-[0-3]/)); // 'cell-0' to 'cell-3'

    // Figure out what type of cell it needs to be
    // and fetch rotation data to compute facing direction later
    const clockwiseRotationsFromRotationClass = rotationClassToNumberOfRotations.get(currentGridRotationClass);
    const { cls: CellClassToCreate, rot: clockwiseRotationsFromPipeClass }
        = pipeClassToCellClassAndStartingRotations.get(currentGridPipeClass);

    // Figure out cell facing direction (default in our system is DOWN)
    const totalRotations = clockwiseRotationsFromRotationClass + clockwiseRotationsFromPipeClass;
    const cellFacingDirection = Directions.rotateClockwise(Directions.DOWN, totalRotations);

    // Figure out whether cell is pinned or not
    const isCellPinned = cellDOMElement.classList.contains("pinned");

    return new CellClassToCreate(cellDOMElement, cellFacingDirection, isCellPinned);
}