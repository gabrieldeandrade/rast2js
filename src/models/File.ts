import {Term} from "./Term";

export interface File {
    name: string;
    expression: Term;
    location: Location;
}