import {Term} from "../models/Term";
import {File} from "../models/File";
import {
    ArrowFunctionExpression, CallExpression, Expression, Identifier, IfStatement, Program, ReturnStatement, Statement,
} from "estree";
import {Function} from "../models/Function";
import {Let} from "../models/Let";
import { Parameter } from "../models/Parameter";
import {If} from "../models/If";
import {Binary} from "../models/Binary";
import {
    genBinaryExpression, genBlockStatement, genProgram, genVariableDeclaration, genIdentifier, genReturnStatement, genExpression
} from "./ESTreeNodeGenerators"
import {Print} from "../models/Print";

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
                    genReturnStatement(this.buildExpression(curr.then))
                ]),
                alternate: genBlockStatement([
                    genReturnStatement(this.buildExpression(curr.otherwise))
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
                const initDeclaration : ArrowFunctionExpression  = {
                    type: 'ArrowFunctionExpression',
                    params: [...currFunction.parameters.map((param: Parameter) => genIdentifier(param.text))],
                    body: genBlockStatement(statements)
                }
                letDeclaration.declarations[0].init = initDeclaration;
            } else {

                // TODO implement other kinds as needed (eg: combination)

            }
            return [letDeclaration, ...this.nextTerm(curr.next)];
        } else if (term.kind == 'Print') {
            const curr: Print = term as Print;
            // TODO substitute with dynamic expression
            return [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: "print"
                    },
                    optional: false,
                    arguments: [this.buildExpression(curr.value)] // TODO implement
                } as CallExpression,
            }] as Statement[];
        }
        return [];
    }

    buildExpression(term: Term): Expression {
        const exp = genExpression(term);
        if (Object.keys(exp).length > 0) {
            return exp;
        }

        return {} as Expression;
    }
}