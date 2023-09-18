import {Term} from "./Term";
import {BinaryOp} from "./BinaryOp";

export interface Binary extends Term {
    lhs: Term;
    op: "Add"|
        "Sub"|
        "Mul"|
        "Div"|
        "Rem"|
        "Eq"|
        "Neq"|
        "Lt"|
        "Gt"|
        "Lte"|
        "Gte"|
        "And"|
        "Or";
    rhs: Term;
}