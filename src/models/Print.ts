import {Term} from "./Term";

export interface Print extends Term{
    value: Term; // Only Str, Int, Bool, Tuple and whatever Closure means. Maybe we should implement a Function printer?!
}