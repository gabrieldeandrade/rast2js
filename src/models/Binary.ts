import {Term} from "./Term";
import {BinaryOp} from "./BinaryOp";

export interface Binary extends Term {
    lhs: Term;
    op: BinaryOp;
    rhs: Term;
}