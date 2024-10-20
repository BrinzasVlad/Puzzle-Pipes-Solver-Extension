const cellElementToCellObject = function(cellDOMElement) {
    // Get element classes that define type and rotation
    const currentGridPipeClass = cellDOMElement.className.match(/pipe[1-9][0-4]?/); // 'pipe1' to 'pipe14'
    const currentGridRotationClass = cellDOMElement.className.match(/cell-[0-3]/); // 'cell-0' to 'cell-3'

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

    return new CellClassToCreate(cellDOMElement, cellFacingDirection);
}