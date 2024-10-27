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
    }

    rotate() {
        // FIXME: sending HTML events to the puzzle-pipes.com page currently doesn't to work
        // (not even the click()) function, so this code won't apply and the user won't get
        // any feedback on this change unless we display it somewhere
        this.DOMElement.click(); // Rotates clockwise once, as per current puzzle-pipes.com functionality

        this.facingDirection = Directions.rotateClockwise(this.facingDirection);
    }

    togglePinned() {
        // FIXME: sending HTML events to the puzzle-pipes.com page currently doesn't to work
        // (not even the click()) function, so this code won't apply and the user won't get
        // any feedback on this change unless we display it somewhere
        const rightClickEvent = new MouseEvent("contextmenu", { button: 2 });
        this.DOMElement.dispatchEvent(rightClickEvent);

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

    // Attempts to determine the correct position of this cell and align the cell as such and pin it
    // If the cell was solved, returns true
    // If the cell was already solved and pinned, or no solution could be found, returns false
    attemptSolve() {
        if (this.isPinned) return false; // Already solved, no change

        for (const strategy of this.solveStrategies) {
            const correctFacingDirection = strategy(this);

            if (null !== correctFacingDirection) { // Strategy returned a valid answer
                while (this.facingDirection !== correctFacingDirection) {
                    this.rotate();
                }
                this.togglePinned();

                return true;
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
            (nubCell) => {
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (nubCell.neighbours[direction].hasConnection(backwardsDirection) === true) {
                        // Neighbour is pointing at us
                        return direction;
                    }
                }
                return null;
            },
            // ThreeDirectionsBlocked strategy
            (nubCell) => {
                const directionsNotBlocked = new Set(Directions.all());
                for (const direction of Directions) {
                    const backwardsDirection = Directions.opposite(direction);
                    if (nubCell.neighbours[direction].hasConnection(backwardsDirection) === false) {
                        // Neighbour connection to us is blocked
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
            if (Directions.rotateClockwise(this.facingDirection, 1) === direction
             || Directions.rotateClockwise(this.facingDirection, 2) == direction) {
                // When facingDirection is DOWN, connected directions are LEFT and UP
                // So 1 and 2 clockwise 90°-rotations from facingDirection
                return true;
            }
            else return false;
        }
        else return null;
    }
}

/// The T-shaped cells with a single blocked path
/// In default look, cell is facing DOWN and it
/// looks like the letter T (so blocked path is UP)
class ThreeWayCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection, isPinned) {
        super(cellDOMElement, facingDirection, isPinned);
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