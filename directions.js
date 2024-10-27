const Directions = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",

    all() {
        return [this.UP, this.DOWN, this.LEFT, this.RIGHT];
    },

    // Allow iterating via `for direction of Directions`
    [Symbol.iterator]() {
    	return this.all()[Symbol.iterator]();
    },

    // TODO: might be bad practice to put this function here?
    rotateClockwise(direction, times = 1) {
        const cycle = [this.UP, this.RIGHT, this.DOWN, this.LEFT];
        const initialIndex = cycle.indexOf(direction);
        if(-1 === initialIndex) return null; // not a valid direction

        const finalIndex = (initialIndex + times) % 4;

        return cycle[finalIndex];
    },

    opposite(direction) {
        // Could just return this.rotateClockwise(direction, 2), but let's be efficient
        switch (direction) {
            case this.UP: return this.DOWN;
            case this.DOWN: return this.UP;
            case this.LEFT: return this.RIGHT;
            case this.RIGHT: return this.LEFT;
            default: return null; // not a valid direction
        }
    }
});