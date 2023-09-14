import {Term} from "./Term";

export interface If extends Term {
    condition: Term;
    then: Term;
    otherwise: Term;
}