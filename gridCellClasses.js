/// Base class that other cells extend from
/// Contains shared functionality like rotating,
/// DOM element access, and other utils
class AbstractGridCell {
    DOMElement; // the actual cell in the HTML DOM corresponding to this
    blockedDirections; // directions (as per enum) in which this cell CANNOT connect
    forcedDirections; // directions (as per enum) in which this cell MUST connect
    facingDirection; // direction this cell is facing; in the "default" look, cell is facing DOWN

    constructor(cellDOMElement, facingDirection) {
        this.DOMElement = cellDOMElement;
        this.blockedDirections = new Set();
        this.forcedDirections = new Set();
        this.facingDirection = facingDirection;
    }

    rotate() {
        this.DOMElement.click(); // Rotates clockwise once, as per current puzzle-pipes.com functionality
        this.facingDirection = Directions.rotateClockwise(this.facingDirection);
    }

    handleBlockedDirection(direction) {
        console.log("Abstract method handleBlockedDirection used! You should override it!");
    }
    blockDirection(direction) {
        if(!Object.values(Directions).includes(direction)) {
            console.log("Was requested to block invalid direction " + direction);
        }
        this.blockedDirections.add(direction);
        this.handleBlockedDirection(direction);
    }

    handleForcedDirection(direction) {
        console.log("Abstract method handleForcedDirection used! You should override it!");
    }
    forceDirection(direction) {
        if(!Object.values(Directions).includes(direction)) {
            console.log("Was requested to force invalid direction " + direction);
        }
        this.forcedDirections.add(direction);
        this.handleForcedDirection(direction);
    }
}

/// Those nub-shaped cells with a single path out
/// In default look, cell is facing DOWN and that's the
/// direction the single path out points
class NubCell extends AbstractGridCell {
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