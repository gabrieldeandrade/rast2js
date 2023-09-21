import {Location} from "./Location";

export interface Term {
    kind: 'Int' | 'Str' | 'Call' | 'Binary' | 'Function' | 'Let' | 'If' | 'Print' | 'First' | 'Second' | 'Bool' | 'Tuple' | 'Var';
    location?: Location;
}