import {Term} from "./Term";

export interface Call extends Term {
    callee: Term;
    arguments: Term[];
}