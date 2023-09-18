import {Term} from "../models/Term";
import {File} from "../models/File";
import {
    ArrowFunctionExpression, BaseExpression, BinaryExpression, BinaryOperator,
    BlockStatement,
    Expression,
    Identifier, IfStatement, LogicalExpression, LogicalOperator,
    Program,
    Statement,
    VariableDeclaration
} from "estree";
import {Function} from "../models/Function";
import {Let} from "../models/Let";
import { Parameter } from "../models/Parameter";
import {If} from "../models/If";
import {Binary} from "../models/Binary";

const binaryOpDict = {
    Add: '+',
    Sub: '-',
    Mul: '*',
    Div: '/',
    Rem: '%',
    Eq: '===',
    Neq: '!==',
    Lt: '<',
    Gt: '>',
    Lte: '<=',
    Gte: '>=',
    And: '||',
    Or : '&&'
}

export class ESTreeConverter {
    private termConverters:  Map<String, Function> = new Map<String, Function>();
    private rootTerm: File;
    private program: Program = this.genProgram();
    private rootVal = null;

    constructor(rootTerm: File) {
        this.rootTerm = rootTerm;
        this.rootVal = this.processTerm(rootTerm.expression, null);
    }

    convert(): Program {
        // @ts-ignore
        this.program.body = [this.rootVal] // TODO change processTerm to return an array of statements;
        return this.program;
    }

    private processTerm(term: Term, obj: any): any {
        console.log("Processing term: ");
        console.log(term);

        if (term.kind === 'If') {
            const curr: If = term as If;
            //
            // const ifStatement: IfStatement = {
            //     type: "IfStatement",
            //     test
            // }

        } else if (term.kind === 'Let') {
            const curr: Let = term as Let;
            const letDeclaration = this.genVariableDeclaration(curr.name.text)

            if (curr.value.kind === 'Function') {
                const currFunction: Function = curr.value as Function;
                const body: Statement = this.processTerm(currFunction.value, null) as Statement;

                // @ts-ignore
                const initDeclaration : ArrowFunctionExpression  = {
                    type: "ArrowFunctionExpression",
                    params: [...currFunction.parameters.map((param: Parameter) => this.genIdentifier(param.text))],
                    body: {
                        type: "BlockStatement",
                        body: []
                    }
                }
                letDeclaration.declarations[0].init = initDeclaration;

                if (body != null) {
                    const blockStatement = initDeclaration.body as BlockStatement;
                    blockStatement.body = [body];
                }
                // TODO implement Let.next
            } else {
                // TODO implement regular variable attribution
            }

            return letDeclaration;
        }

        return null;
    }

    private genBinaryExpression(rinhaExpression: Binary): Expression {
        const rOperator = rinhaExpression.op;

        let binary = false;

        let operator: BinaryOperator | LogicalOperator = binaryOpDict[rinhaExpression.op] as BinaryOperator;
        if (rOperator === 'And' || rOperator === 'Or') {
            binary = true;
            operator = operator as LogicalOperator;
        }

        const expression = {
            type: binary ? 'BinaryExpression' : 'LogicalExpression',
            operator,
            left: this.genBinaryExpressionExpression(rinhaExpression.lhs),
            right:  this.genBinaryExpressionExpression(rinhaExpression.rhs),
        }

        return expression as Expression;
    }

    private genBinaryExpressionExpression(term: Term): Expression {


        return null;
    }

    private genVariableDeclaration(name: string): VariableDeclaration {
        return {
            kind: 'let',
            type: "VariableDeclaration",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: this.genIdentifier(name),
                    init: null
                }
            ]
        }
    }

    private genIdentifier(name: string): Identifier {
        return {
            type: "Identifier",
            name
        }
    }

    private genProgram(): Program {
        return {
            type: 'Program',
            body: [],
            sourceType: 'script'
        }
    }

}