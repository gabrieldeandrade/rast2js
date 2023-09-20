import {
    BinaryOperator,
    BlockStatement, CallExpression,
    Expression,
    Identifier,
    LogicalOperator, Program, ReturnStatement,
    Statement,
    VariableDeclaration
} from 'estree';
import {Binary} from '../models/Binary';
import {Term} from '../models/Term';
import {Int} from '../models/Int';
import {Str} from '../models/Str';
import {Var} from '../models/Var';
import {Call} from "../models/Call";

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

export function genBlockStatement(statements?: Statement[]): BlockStatement {
    return {
        type: 'BlockStatement',
        body: statements != null ? statements : [],
    } as BlockStatement;
}

export function genBinaryExpression(rinhaExpression: Binary): Expression {
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
        left: genExpression(rinhaExpression.lhs),
        right: genExpression(rinhaExpression.rhs),
    }

    return expression as Expression;
}

export function genExpression(term: Term): Expression {
    let exp = {} as Expression;
    switch (term.kind) {
        // TODO downgrade api call terms to plain function calls
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
        case 'Binary':
            const binary = term as Binary;
            return genBinaryExpression(binary);
        case 'Call':
            const call = term as Call;
            return genCallExpression(call);
    }
    return exp;
}

export function genCallExpression(call: Call) {
    const callee = call.callee as Var; // TODO MAYBE OTHER KINDS ARE POSSIBLE!
    return {
        type: "CallExpression",
        callee: {
            type: "Identifier",
            name: callee.text
        },
        optional: false,
        arguments: call.arguments.map(term => genExpression(term))
    } as CallExpression;
}

export function genVariableDeclaration(name: string): VariableDeclaration {
    return {
        kind: 'let',
        type: 'VariableDeclaration',
        declarations: [
            {
                type: 'VariableDeclarator',
                id: genIdentifier(name),
                init: null
            }
        ]
    }
}

export function genReturnStatement(expression: Expression): ReturnStatement {
    return {
        type: "ReturnStatement",
        argument: expression
    }
}

export function genIdentifier(name: string): Identifier {
    return {
        type: 'Identifier',
        name
    }
}

export function genProgram(): Program {
    return {
        type: 'Program',
        body: [],
        sourceType: 'script'
    }
}