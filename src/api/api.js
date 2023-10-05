// Rinha API:

function rast2js_print(val) {
    if (rast2js_isTuple(val)) {
        const tupleString = '(' + val.getX() + ', ' + val.getY() + ')';
        console.log(tupleString);
        return tupleString + '\n';
    }
    console.log(val);
    return val + '\n';
}

function rast2js_newTuple(x, y) {
    return {
        getX: function() {
            return x;
        },
        getY: function() {
            return y;
        }
    };
}

function rast2js_getFirst(tuple) {
    if (!rast2js_isTuple(tuple)) {
        throw new Error('First() was called with a non Tuple value as its argument!');
    }
    return tuple.getX();
}

function rast2js_getSecond(tuple) {
    if (!rast2js_isTuple(tuple)) {
        throw new Error('Second() was called with a non Tuple value as its argument!');
    }
    return tuple.getY();
}

function rast2js_isTuple(obj) {
    return typeof obj.getX === 'function' &&
           typeof obj.getY === 'function';
}

// Generated code:
