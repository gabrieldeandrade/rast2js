import {Term} from "../models/Term";
import {File} from "../models/File";
import {
    ArrowFunctionExpression, BaseExpression, BinaryExpression, BinaryOperator,
    BlockStatement, CallExpression,
    Expression, ExpressionStatement,
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
import {Var} from "../models/Var";
import {Str} from "../models/Str";
import {Int} from "../models/Int";

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
    }

    convert(): Program {
        let rootTerm = this.processTerm(this.rootTerm.expression, null);
        // @ts-ignore
        this.program.body = [...rootTerm]
        return this.program;
    }

    private processTerm(term: Term, obj: any): any[] {
        console.log('Processing term: ');
        console.log(term);

        if (term.kind == 'If') {
            const curr: If = term as If;
            const ifStatement: IfStatement = {
                type: 'IfStatement',
                test: this.genBinaryExpression(curr.condition as Binary),
                consequent: this.genBlockStatement(),  // TODO gen body
            }
            return [ifStatement];

        } else if (term.kind == 'Let') {
            const curr: Let = term as Let;
            const letDeclaration = this.genVariableDeclaration(curr.name.text)

            if (curr.value.kind == 'Function') {
                const currFunction: Function = curr.value as Function;
                const statements: Statement[] = this.processTerm(currFunction.value, null) as Statement[];

                // @ts-ignore
                const initDeclaration : ArrowFunctionExpression  = {
                    type: 'ArrowFunctionExpression',
                    params: [...currFunction.parameters.map((param: Parameter) => this.genIdentifier(param.text))],
                    body: this.genBlockStatement(statements)
                }
                letDeclaration.declarations[0].init = initDeclaration;
            } else {
                // TODO implement regular variable attribution
            }

            return [letDeclaration, ...this.processTerm(curr.next, null)];

        } else if (term.kind == 'Print') {
            return [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: "print"
                    },
                    optional: false,
                    arguments: []
                } as CallExpression,
            }] as Statement[];
        }
        return [];
    }

    private genBlockStatement(statements?: Statement[]): BlockStatement {
        return {
            type: 'BlockStatement',
            body: statements != null ? statements : [],
        } as BlockStatement;
    }

    private genBinaryExpression(rinhaExpression: Binary): Expression {
        const rOperator = rinhaExpression.op;
        let binary = true;

        let operator: BinaryOperator | LogicalOperator = binaryOpDict[rinhaExpression.op] as BinaryOperator;
        if (rOperator === 'And' || rOperator === 'Or') {
            binary = false;
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
        let exp = {} as Expression;
        switch (term.kind) {
            case 'Int':
                return {type: 'Literal',
                        raw: (term as Int).value.toString(),
                        value: (term as Int).value as number };
            case 'Str':
                return {type: 'Literal',
                        raw: (term as Str).value,
                        value: (term as Str).value }
            case 'Var':
                return {type: 'Identifier',
                        name: (term as Var).text }
            // TODO implement and restrict other kinds as required, call recursively if it is an expression
        }
        return exp;
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