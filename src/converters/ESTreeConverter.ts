import {File} from "../models/File";
import {Program, Statement,} from "estree";
import {genProgram, nextTerm, shadowize} from "./ESTreeNodeGenerators"

export class ESTreeConverter {
    private rinhaFile: File;
    private program: Program = genProgram();

    constructor(rinhaFile: File) {
        this.rinhaFile = rinhaFile;
    }

    convert(): Program {
        let rootTerm: Statement[] = nextTerm(this.rinhaFile.expression);
        this.program.body = [...shadowize(rootTerm)]
        return this.program;
    }

}