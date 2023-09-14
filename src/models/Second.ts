import {Term} from "./Term";

export interface Second extends Term {
    value: Term;
    // TODO Only Tuple allowed, must be checked on runtime
    //value: Tuple;
}