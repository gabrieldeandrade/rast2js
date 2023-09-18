import {Term} from "./Term";
import {Parameter} from "./Parameter";

export interface Let extends Term{
    name: Parameter;
    value: Term;
    next: Term;
}