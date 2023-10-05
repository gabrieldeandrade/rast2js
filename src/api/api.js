// Rinha API:

function __print(val) {
    if (__isTuple(val)) {
        const tupleString = '(' + val.getX() + ', ' + val.getY() + ')';
        console.log(tupleString);
        return tupleString + '\n';
    }
    console.log(val);
    return val + '\n';
}

function __newTuple(x, y) {
    return {
        getX: function() {
            return x;
        },
        getY: function() {
            return y;
        }
    };
}

function __getFirst(tuple) {
    if (!__isTuple(tuple)) {
        throw new Error('First() was called with a non Tuple value as its argument!');
    }
    return tuple.getX();
}

function __getSecond(tuple) {
    if (!__isTuple(tuple)) {
        throw new Error('Second() was called with a non Tuple value as its argument!');
    }
    return tuple.getY();
}

function __isTuple(obj) {
    return typeof obj.getX === 'function' &&
           typeof obj.getY === 'function';
}

// Generated code:
