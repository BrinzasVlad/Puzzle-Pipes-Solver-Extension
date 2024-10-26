/// Base class that other cells extend from
/// Contains shared functionality like rotating,
/// DOM element access, and other utils
class AbstractGridCell {
    DOMElement; // the actual cell in the HTML DOM corresponding to this
    facingDirection; // direction this cell is facing; in the "default" look, cell is facing DOWN
    isPinned; // whether this cell is pinned (marked as "correct" and uneditable) on the grid
    neighbours; // neighbour cells in each direction
    solveStrategies = []; // list of strategies for solving this cell; subclasses should populate in constructor

    // TODO: Neighbours must be added separately, which is a bit smelly
    constructor(cellDOMElement, facingDirection, isPinned = false) {
        this.DOMElement = cellDOMElement;
        this.facingDirection = facingDirection;
        this.isLocked = isPinned;
    }

    rotate() {
        console.log("Attempting to rotate cell " + this);
        console.log("Internal direction: " + this.facingDirection);
        this.DOMElement.click(); // Rotates clockwise once, as per current puzzle-pipes.com functionality
        this.facingDirection = Directions.rotateClockwise(this.facingDirection);
        console.log("New direction: ", this.facingDirection);
    }

    togglePinned() {
        // FIXME: currently sending anything other than a click() command DOES NOT WORK
        // This is a limitation of Chrome Extensions, and is unlikely to be overcome
        // As such, this part will not work, so the user won't get visual updates on this
        const rightClickEvent = new MouseEvent("contextmenu", { button: 2 });
        this.DOMElement.dispatchEvent(rightClickEvent);

        this.isPinned = !this.isPinned;
    }
}

/// Those bulb-shaped cells with a single path out
/// In default look, cell is facing DOWN and that's the
/// direction the single path out points
class BulbCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch (this.facingDirection) {
            case Directions.UP: return '╹';
            case Directions.DOWN: return '╻';
            case Directions.LEFT: return '╸';
            case Directions.RIGHT: return '╺';
        }
    }
}

/// The line-shaped cells
/// In default look, cell is facing DOWN and the pipe
/// is aligned UP-DOWN
/// Note that facing UP/DOWN and facing LEFT/RIGHT are
/// identical for this type of cell
class LineCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection)
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
}

/// The elbow-shaped cells
/// In default look, cell is facing DOWN and it
/// looks like the letter L (so one pipe goes UP
/// and one pipe goes RIGHT)
class ElbowCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┓';
            case Directions.DOWN: return '┗';
            case Directions.LEFT: return '┏';
            case Directions.RIGHT: return '┛';
        }
    }
}

/// The T-shaped cells with a single blocked path
/// In default look, cell is facing DOWN and it
/// looks like the letter T (so blocked path is UP)
class ThreeWayCell extends AbstractGridCell {
    constructor(cellDOMElement, facingDirection) {
        super(cellDOMElement, facingDirection);
    }

    toString() {
        switch(this.facingDirection) {
            case Directions.UP: return '┻';
            case Directions.DOWN: return '┳';
            case Directions.LEFT: return '┫';
            case Directions.RIGHT: return '┣';
        }
    }
}