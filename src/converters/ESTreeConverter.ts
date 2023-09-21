import {Term} from "../models/Term";
import {File} from "../models/File";
import {ArrowFunctionExpression, Expression, IfStatement, Program, Statement,} from "estree";
import {Function} from "../models/Function";
import {Let} from "../models/Let";
import {Parameter} from "../models/Parameter";
import {If} from "../models/If";
import {Binary} from "../models/Binary";
import {
    genBinaryExpression,
    genBlockStatement,
    genExpression,
    genIdentifier,
    genProgram,
    genReturnStatement,
    genVariableDeclaration
} from "./ESTreeNodeGenerators"

export class ESTreeConverter {
    private rinhaFile: File;
    private program: Program = genProgram();

    constructor(rinhaFile: File) {
        this.rinhaFile = rinhaFile;
    }

    convert(): Program {
        let rootTerm = this.nextTerm(this.rinhaFile.expression);
        // @ts-ignore
        this.program.body = [...rootTerm]
        return this.program;
    }

    private nextTerm(term: Term): Statement[] {
        // console.log('Processing term: ');
        // console.log(term);

        if (term.kind == 'If') {
            const curr: If = term as If;
            const ifStatement: IfStatement = {
                type: 'IfStatement',
                test: genBinaryExpression(curr.condition as Binary),
                consequent: genBlockStatement([
                    genReturnStatement(genExpression(curr.then))
                ]),
                alternate: genBlockStatement([
                    genReturnStatement(genExpression(curr.otherwise))
                ])
            }
            return [ifStatement];
        } else if (term.kind == 'Let') {
            const curr: Let = term as Let;
            const letDeclaration = genVariableDeclaration(curr.name.text)

            if (curr.value.kind == 'Function') {
                const currFunction: Function = curr.value as Function;
                const statements: Statement[] = this.nextTerm(currFunction.value) as Statement[];

                // @ts-ignore
                const initDeclaration: ArrowFunctionExpression = {
                    type: 'ArrowFunctionExpression',
                    params: [...currFunction.parameters.map((param: Parameter) => genIdentifier(param.text))],
                    body: genBlockStatement(statements)
                }
                letDeclaration.declarations[0].init = initDeclaration;
            } else {
                const expression = genExpression(curr.value);
                if (this.isValidExpression(expression)) {
                    letDeclaration.declarations[0].init = expression;
                }
                // Done?
            }
            return [letDeclaration, ...this.nextTerm(curr.next)];
        }

        const expression = genExpression(term);
        if (this.isValidExpression(expression)) {
            return [{
                type: "ExpressionStatement",
                expression
            }] as Statement[];
        }

        return [];
    }

    isValidExpression(expression: Expression) {
        return Object.keys(expression).length > 0
    }
}