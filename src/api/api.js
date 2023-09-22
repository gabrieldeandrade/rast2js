// Rinha API:

function print(val) {
    if (isTuple(val)) {
        const tupleString = "(" + val.getX() + ", " + val.getY() + ")";
        console.log(tupleString);
        return tupleString + '\n';
    }
    console.log(val);
    return val + '\n';
}

function newTuple(x, y) {
    return {
        getX: function() {
            return x;
        },
        getY: function() {
            return y;
        }
    };
}

function getFirst(tuple) {
    if (!isTuple(tuple)) {
        throw new Error("First() was called with a non Tuple value as its argument!");
    }
    return tuple.getX();
}

function getSecond(tuple) {
    if (!isTuple(tuple)) {
        throw new Error("Second() was called with a non Tuple value as its argument!");
    }
    return tuple.getY();
}

function isTuple(obj) {
    return typeof obj.getX === "function" &&
           typeof obj.getY === "function";
}

// Generated code: