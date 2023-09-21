import {Term} from "./Term";

export interface Tuple extends Term{
    first: Term,
    second: Term
}