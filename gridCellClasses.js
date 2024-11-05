/// Base class that other cells extend from
/// Contains shared functionality like rotating,
/// DOM element access, and other utils
class AbstractGridCell {
    DOMElement; // the actual cell in the HTML DOM corresponding to this
    facingDirection; // direction this cell is facing; in the "default" look, cell is facing DOWN
    isPinned; // whether this cell is pinned (marked as "correct" and uneditable) on the grid
    neighbours = {}; // neighbour cells in each direction
    // TODO: currently neighbours is not iterable, but maybe it should be
    // If you implement this, you should ideally make sure you ONLY iterate
    // through the four directions, even if someone adds some extra stuff to neighbours

    // List of strategies for solving this cell; subclasses should populate in constructor
    // Each strategy should be callable with the cell object as the parameter (i.e.
    // strategy(this) should work from within the cell object), and should return:
    // - the facing direction the cell should take to be correctly positioned
    // - null if the correct direction cannot be determined
    solveStrategies = [];

    // TODO: Neighbours must be added separately, which is a bit smelly
    constructor(cellDOMElement, facingDirection, isPinned = false) {
        this.DOMElement = cellDOMElement;
        this.facingDirection = facingDirection;
        this.isPinned = isPinned;

        // Extra setup for non-Wall cells
        if(this.DOMElement) {
            // Add listeners to stay in sync with grid
            this.DOMElement.addEventListener("click", () => {
                this.rotate();
            });
            // FIXME: this does NOT cover rotating via selector
            // FIXME: it's possible Ctrl-Click does a reverse rotate instead
            this.DOMElement.addEventListener("contextmenu", () => {
                this.togglePinned();
            })
        }
    }

    rotate() {
        this.facingDirection = Directions.rotateClockwise(this.facingDirection);
    }

    togglePinned() {
        this.isPinned = !this.isPinned;
    }

    // Tests whether this cell has a connection in the specified direction
    // Returns:
    // - true if this cell MUST have a connection in that direction
    // - false if this cell CANNOT have a connection in that direction
    // - null otherwise
    hasConnection(direction) {
        console.log("You are attempting to call the hasConnection method on an abstract class object.");
        console.log("If you are seeing this message, either you forgot to override the method in a sub-class, "
                  + "or something very wrong happened with your object initialization." )
        
        return null;
    }

    // Attempts to determine the correct position of this cell
    //
    // If the cell was solved, returns a non-DOM-attached cell object that
    // is pinned and has the correct direction set in, so you can call
    // methods like toString() on it to display it to the user.
    //
    // If the cell was not successfully solved OR if the cell was
    // already solved (i.e. pinned) and so no further solving is possible,
    // returns null.
    //
    // TODO: this is needlessly inefficient
    // since we still do the extra setup steps in the dummy return object,
    // like setting up solve strategies and such.
    // Would probably be more effective to return just the correct
    // facing direction and cell type, and then set up some code
    // that can display that
    attemptSolve() {
        if (this.isPinned) return null; // Already solved, no change

        for (const strategy of this.solveStrategies) {
            const correctFacingDirection = strategy(this);

            if (null !== correctFacingDirection) { // Strategy returned a valid answer
                // This feels hacky, but is a JS-legitimate way to get
                // this object's actual class
                const CellType = this.constructor;
                
                // Return cell object with null DOM element reference
                return new CellType(null, correctFacingDirection, true);
            }
        }

        // No strategies worked, cell remains unsolved
        return false;
    }
}

// Not really a full-fledged cell, but rather meant to represent the boundaries of the grid
class WallCell extends AbstractGridCell {
    constructor() {
        super(null, null, true);
    }

    hasConnection(direction) {
        return false; // No cells can connect to the wall
    }
}

/// Those bulb-shaped cells with a single path out
/// In default look, cell is facing DOWN and that's the
/// direction the single path out points
class BulbCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection, isPinned) {
        super(cellDOMElement, facingDirection, isPinned);

        // FIXME: feels wrong to declare these in the constructor
        this.solveStrategies.push(
            // AnyOneDirectionConnected strategy
            (bulbCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (bulbCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        // Neighbour is pointing at us
                        return direction;
                    }
                }
                return null;
            },
            // ThreeDirectionsBlockedOrBulb strategy
            (bulbCell) => {
                const directionsNotBlocked = new Set(Directions.all());
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (bulbCell.neighbours[direction].hasConnection(backwardsDirection) === false) {
                        // Neighbour connection to us is blocked
                        directionsNotBlocked.delete(direction);
                    }
                    if (bulbCell.neighbours[direction] instanceof BulbCell) {
                        // Neighbour is a bulb cell also
                        // We cannot connect to them, else we'd have an isolated
                        // Bulb-Bulb system cut off from the grid
                        directionsNotBlocked.delete(direction);
                    }
                }
                if (1 == directionsNotBlocked.size) {
                    // Last direction available must be correct
                    const [lastDirectionRemaining] = directionsNotBlocked;
                    return lastDirectionRemaining;
                }
                return null;
            }
        );
    }

    toString() {
        switch (this.facingDirection) {
            case Directions.UP: return '╹';
            case Directions.DOWN: return '╻';
            case Directions.LEFT: return '╸';
            case Directions.RIGHT: return '╺';
        }
    }

    // @Override
    hasConnection(direction) {
        if (this.isPinned) {
            if (this.facingDirection === direction) return true;
            else return false;
        }
        else return null;
    }
}

/// The line-shaped cells
/// In default look, cell is facing DOWN and the pipe
/// is aligned UP-DOWN
/// Note that facing UP/DOWN and facing LEFT/RIGHT are
/// identical for this type of cell
class LineCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection, isPinned) {
        super(cellDOMElement, facingDirection, isPinned);
        
        // FIXME: feels wrong to declare these in the constructor
        this.solveStrategies.push(
            // AnyOneDirectionConnected strategy
            (lineCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (lineCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        // Neighbour is pointing at us
                        return direction;
                    }
                }
                return null;
            },
            // AnyOneDirectionBlocked strategy
            (lineCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (lineCell.neighbours[direction].hasConnection(backwardsDirection) === false) {
                        // Neighbour walls us out
                        // So we must be perpendicular to its direction
                        return Directions.rotateClockwise(direction);
                    }
                }
                return null;
            },
            // LineCellBetweenOpposingBulbs strategy
            (lineCell) => {
                for (const direction of Directions) {
                    const oppositeDirection = Directions.opposite(direction);
                    if (lineCell.neighbours[direction] instanceof BulbCell
                     && lineCell.neighbours[oppositeDirection] instanceof BulbCell
                    ) {
                        // Line cell cannot face in that direction.
                        // Because if it did, we'd have a Bulb-Line-Bulb system
                        // disconnected from the rest of the grid
                        // Hence, it must face perpendicular to that.
                        return Directions.rotateClockwise(direction);
                    }
                }
                return null;
            }
        );
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

    // @Override
    hasConnection(direction) {
        if (this.isPinned) {
            if (this.facingDirection === direction
             || Directions.rotateClockwise(this.facingDirection, 2) === direction) {
                // Line cell is 180°-rotation symmetrical, so must check both directions
                return true;
            }
            else return false;
        }
        else return null;
    }
}

/// The elbow-shaped cells
/// In default look, cell is facing DOWN and it
/// looks like the letter L (so one pipe goes UP
/// and one pipe goes RIGHT)
class ElbowCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection, isPinned) {
        super(cellDOMElement, facingDirection, isPinned);
        
        // FIXME: feels wrong to declare these in the constructor
        this.solveStrategies.push(
            // AnyTwoConsecutiveDirectionsConnected strategy
            (elbowCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (elbowCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        const consecutiveDirection = Directions.rotateClockwise(direction);
                        const backwardsConsecutiveDirection = Directions.opposite(consecutiveDirection);
                        if (elbowCell.neighbours[consecutiveDirection]
                            .hasConnection(backwardsConsecutiveDirection) === true) {
                                // Two consecutive directions, elbow can be pinned
                                // Based on the 'default look', elbow cell must point in
                                // OPPOSITE direction from the first connection
                                // (e.g. if connected UP and RIGHT, elbow points DOWN)
                                return Directions.opposite(direction);
                            }
                    }
                }
                return null;
            },
            // AnyTwoConsecutiveDirectionsBlocked strategy
            (elbowCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (elbowCell.neighbours[direction].hasConnection(backwardsDirection) === false) {
                        const consecutiveDirection = Directions.rotateClockwise(direction);
                        const backwardsConsecutiveDirection = Directions.opposite(consecutiveDirection);
                        if (elbowCell.neighbours[consecutiveDirection]
                            .hasConnection(backwardsConsecutiveDirection) === false) {
                                // Two consecutive directions, elbow can be pinned
                                // If two directions are blocked, the other two
                                // (opposites of these two) must be connected.
                                // So if e.g. DOWN and LEFT are blocked, then
                                // UP and RIGHT must be connected, so based on
                                // the 'default look' elbow must point DOWN
                                // So the correct facing direction is the same
                                // as the first blocked direction
                                return direction;
                            }
                    }
                }
                return null;
            },
            // OneDirectionConnectedPlusAdjacentBlocked strategy
            (elbowCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (elbowCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        const directionClockwise = Directions.rotateClockwise(direction);
                        const backwardsDirectionClockwise = Directions.opposite(directionClockwise);
                        if (elbowCell.neighbours[directionClockwise]
                            .hasConnection(backwardsDirectionClockwise) === false
                        ) {
                            // Next direction clockwise is blocked, elbow
                            // must connect towards original direction and
                            // the counterclockwise neighbour.
                            // So based on the 'default look', elbow must point
                            // towards the clockwise direction.
                            return directionClockwise;
                        }
                        
                        const directionCounterclockwise = Directions.rotateCounterclockwise(direction);
                        const backwardsDirectionCounterclockwise = Directions.opposite(directionCounterclockwise);
                        if (elbowCell.neighbours[directionCounterclockwise]
                            .hasConnection(backwardsDirectionCounterclockwise) === false
                        ) {
                            // Previous direction counterclockwise is blocked,
                            // so elbow must connect towards original direction
                            // and the clockwise neighbour.
                            // Based on 'default look', elbow must point towards
                            // the NEXT clockwise direction, which is the
                            // opposite of the original direction.
                            return Directions.opposite(direction);
                        }
                    }
                }
                return null; 
            },
            // TsOrElbowsWithCommonBaseMustFaceAway strategy
            (elbowCell) => {
                for (const direction of Directions) {
                    const neighbour = elbowCell.neighbours[direction];
                    if (neighbour instanceof ElbowCell || neighbour instanceof ThreeWayCell) {
                        // Check if they are connected to a common base
                        // Meaning this is connected to a cell,
                        // and the three-way / elbow neighbour to another,
                        // and those two cells are themselves connected.
                        const baseDirections = [
                            Directions.rotateClockwise(direction),
                            Directions.rotateCounterclockwise(direction)
                        ];
                        for (const baseDirection of baseDirections) {
                            const thisCellBaseNeighbour = elbowCell.neighbours[baseDirection];
                            const otherCellBaseNeighbour = neighbour.neighbours[baseDirection];
                            const backwardsDirection = Directions.opposite(baseDirection);
                            if (
                                // this cell is connected to base
                                thisCellBaseNeighbour.hasConnection(backwardsDirection)
                                // the other elbow / three-way cell is connected to base
                             && otherCellBaseNeighbour.hasConnection(backwardsDirection)
                                // the base cells are connected themselves
                             && thisCellBaseNeighbour.hasConnection(direction)
                            ) {
                                // This cell and the other elbow/three-way have a common base
                                // Hence, they cannot connect to one another
                                // Because if they did, they would form a closed loop
                                // Therefore, this cell must connect to the base (given)
                                // and point away from the other elbow/three-way
                                const firstConnectedDirection = baseDirection;
                                const secondConnectedDirection = Directions.opposite(direction);
                                if (secondConnectedDirection === Directions.rotateClockwise(firstConnectedDirection)) {
                                    // As per 'default look', this cell must point
                                    // opposite to firstConnectedDirection
                                    // e.g. if first is UP and second is RIGHT,
                                    // this must point DOWN
                                    return Directions.opposite(firstConnectedDirection);
                                }
                                else {
                                    // It means it's the opposite - first is 90° clockwise from second
                                    return Directions.opposite(secondConnectedDirection);
                                }
                            }
                        }
                    }
                }
                return null;
            }
        );
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┓';
            case Directions.DOWN: return '┗';
            case Directions.LEFT: return '┏';
            case Directions.RIGHT: return '┛';
        }
    }

    // @Override
    hasConnection(direction) {
        if (this.isPinned) {
            if (Directions.rotateCounterclockwise(this.facingDirection, 1) === direction
             || Directions.rotateCounterclockwise(this.facingDirection, 2) == direction) {
                // When facingDirection is DOWN, connected directions are RIGHT and UP
                // So 1 and 2 counterclockwise 90°-rotations from facingDirection
                return true;
            }
            else return false;
        }
        else {
            // If an elbow cell is NOT pinned but its opposite direction
            // is fixed (be it connected or blocked), we can give partial
            // information.
            // e.g. if neighbour UP has connection with this cell, then
            // this cell must have a connection UP, and so it cannot have
            // a connection DOWN, even if we don't know its exact position.
            const oppositeDirection = Directions.opposite(direction);
            const oppositeNeighbourConnectionStatus = this.neighbours[oppositeDirection].hasConnection(direction);
            if (oppositeNeighbourConnectionStatus !== null) {
                return !oppositeNeighbourConnectionStatus;
            }
        }
        // Default to saying 'I don't know'
        return null;
    }
}

/// The T-shaped cells with a single blocked path
/// In default look, cell is facing DOWN and it
/// looks like the letter T (so blocked path is UP)
class ThreeWayCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection, isPinned) {
        super(cellDOMElement, facingDirection, isPinned);

        // FIXME: feels wrong to declare these in the constructor
        this.solveStrategies.push(
            // AnyOneDirectionBlocked strategy
            (threeWayCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (threeWayCell.neighbours[direction].hasConnection(backwardsDirection) === false) {
                        // Direction is blocked, T-cell must face
                        // in the opposite direction.
                        return Directions.opposite(direction);
                    }
                }
                return null;
            },
            // ThreeDirectionsConnected strategy
            (threeWayCell) => {
                const directionsNotConnected = new Set(Directions.all());
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (threeWayCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        // Neighbour has connection this way
                        directionsNotConnected.delete(direction);
                    }
                }
                if (1 == directionsNotConnected.size) {
                    // Last direction remaining must be blocked
                    // So T-cell must face in the opposite direction.
                    const [lastDirectionRemaining] = directionsNotConnected;
                    return Directions.opposite(lastDirectionRemaining);
                }
                return null;
            },
            // TsOrElbowsWithCommonBaseMustFaceAway strategy
            (threeWayCell) => {
                for (const direction of Directions) {
                    const neighbour = threeWayCell.neighbours[direction];
                    if (neighbour instanceof ElbowCell || neighbour instanceof ThreeWayCell) {
                        // Check if they are connected to a common base
                        // Meaning this is connected to a cell,
                        // and the three-way / elbow neighbour to another,
                        // and those two cells are themselves connected.
                        const baseDirections = [
                            Directions.rotateClockwise(direction),
                            Directions.rotateCounterclockwise(direction)
                        ];
                        for (const baseDirection of baseDirections) {
                            const thisCellBaseNeighbour = threeWayCell.neighbours[baseDirection];
                            const otherCellBaseNeighbour = neighbour.neighbours[baseDirection];
                            const backwardsDirection = Directions.opposite(baseDirection);
                            if (
                                // this cell is connected to base
                                thisCellBaseNeighbour.hasConnection(backwardsDirection)
                                // the other elbow / three-way cell is connected to base
                             && otherCellBaseNeighbour.hasConnection(backwardsDirection)
                                // the base cells are connected themselves
                             && thisCellBaseNeighbour.hasConnection(direction)
                            ) {
                                // This cell and the other elbow/three-way have a common base
                                // Hence, they cannot connect to one another
                                // Because if they did, they would form a closed loop
                                // Therefore, this cell must point the opposite direction
                                // from the other elbow/three-way cell, as per 'default look'
                                return Directions.opposite(direction);
                            }
                        }
                    }
                }
                return null;
            }
        );
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┻';
            case Directions.DOWN: return '┳';
            case Directions.LEFT: return '┫';
            case Directions.RIGHT: return '┣';
        }
    }

    // @Override
    hasConnection(direction) {
        if (this.isPinned) {
            // Only direction a three-way cell is NOT connected is 180° from its facing direction
            if (Directions.rotateClockwise(this.facingDirection, 2) === direction) return false;
            else return true;
        }
        else return null;
    }
}