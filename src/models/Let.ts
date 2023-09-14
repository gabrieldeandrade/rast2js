import {Term} from "./Term";
import {Parameter} from "./Parameter";

export interface Let {
    name: Parameter;
    value: Term;
    next: Term;
}