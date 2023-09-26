import {
    BinaryOperator,
    BlockStatement,
    CallExpression,
    Expression,
    Identifier,
    Literal,
    LogicalOperator,
    Program,
    ReturnStatement,
    Statement,
    VariableDeclaration
} from 'estree';
import {Binary} from '../models/Binary';
import {Term} from '../models/Term';
import {Int} from '../models/Int';
import {Str} from '../models/Str';
import {Var} from '../models/Var';
import {Call} from "../models/Call";
import {Print} from "../models/Print";
import {Tuple} from "../models/Tuple";
import {First} from "../models/First";
import {Second} from "../models/Second";
import {Bool} from "../models/Bool";

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
    And: '&&',
    Or : '||'
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
        case 'Int':
            return {type: 'Literal',
                    raw: (term as Int).value.toString(),
                    value: Number((term as Int).value)} as Literal;
        case 'Str':
            return {type: 'Literal',
                    raw: (term as Str).value,
                    value: (term as Str).value.toString()} as Literal;
        case 'Bool':
            return {type: 'Literal',
                    raw: (term as Bool).value,
                    value: (term as Bool).value === 'true'} as Literal;    // TODO TEST IT!!!!
        case 'Var':
            return {type: 'Identifier',
                name: (term as Var).text } as Identifier;
        case 'Binary':
            return genBinaryExpression(term as Binary);
        case 'Call':
            return genCallExpression(term as Call);
        // terms below are replaced with api.js calls
        case 'Print':
            const print = term as Print;
            let value = print.value;
            if (value.kind === 'Function') {
                value = {kind: 'Str', value: '<#closure>'} as Str;
            }
            return genAPICallExpression('print', [value]);
        case 'Tuple':
            const tuple = term as Tuple;
            return genAPICallExpression('newTuple', [tuple.first, tuple.second]);
        case 'First':
            const first = term as First;
            return genAPICallExpression('getFirst', [first.value]);
        case 'Second':
            const second = term as Second;
            return genAPICallExpression('getSecond', [second.value]);
    }
    return exp;
}

export function genAPICallExpression(apiCallee: string, args: Term[]): CallExpression {
   return genCallExpression(genRastCallTerm(apiCallee, args))
}

export function genCallExpression(call: Call): CallExpression {
    const callee = call.callee as Var; // TODO
    return {
        type: 'CallExpression',
        callee: {
            type: 'Identifier',
            name: callee.text
        },
        optional: false,
        arguments: call.arguments.map(term => genExpression(term))
    }
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

function genRastCallTerm(callee: string, args: Term[]): Call {
    return {
        callee: {
            kind: 'Var',
            text: callee
        } as Term,
        arguments: args
    } as Call;
}