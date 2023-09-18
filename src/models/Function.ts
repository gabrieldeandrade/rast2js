import {Term} from "./Term";
import {Parameter} from "./Parameter";

export interface Function extends Term {
    parameters: Parameter[];
    value: Term
}