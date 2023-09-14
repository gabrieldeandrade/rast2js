import {Term} from "./Term";

export interface Bool extends Term {
    value: Bool; // WTF?!
}