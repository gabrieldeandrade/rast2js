import {
    ArrowFunctionExpression,
    BinaryOperator,
    BlockStatement,
    CallExpression,
    Expression, ExpressionStatement,
    Identifier, IfStatement,
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
import {If} from "../models/If";
import {Let} from "../models/Let";
import {Function} from "../models/Function";
import {Parameter} from "../models/Parameter";

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

export function nextTerm(term: Term): Statement[] {
    if (term.kind == 'If') {
        const curr: If = term as If;
        const ifStatement: IfStatement = {
            type: 'IfStatement',
            test: genExpression(curr.condition as Binary),
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

        const expression = genExpression(curr.value);
        if (isValidExpression(expression)) {
            letDeclaration.declarations[0].init = expression;
        }
        return [letDeclaration, ...nextTerm(curr.next)];
    }

    const expression = genExpression(term);
    if (isValidExpression(expression)) {
        return [{
            type: 'ExpressionStatement',
            expression
        }] as Statement[];
    }

    return [];
}

export function genProgram(): Program {
    return {
        type: 'Program',
        body: [],
        sourceType: 'script'
    }
}

export function shadowzator(statements: Statement[]) {
    const declared: string[] = [];
    for (let i = 0; i < statements.length; i++) {
        if (statements[i].type == 'VariableDeclaration' ) {
            let stm = statements[i] as VariableDeclaration;
            let id = stm.declarations[0].id as Identifier;
            if (!declared.includes(id.name)) {
                declared.push(id.name);
                continue;
            }
            //already exists!!!!
            statements[i] = {
                type: "ExpressionStatement",
                expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: id,
                    right: stm.declarations[0].init
                }
            } as ExpressionStatement;
        }
    }
    return statements;
}

function genBlockStatement(statements?: Statement[]): BlockStatement {
    return {
        type: 'BlockStatement',
        body: statements != null ? shadowzator(statements) : [],
    } as BlockStatement;
}

function genBinaryExpression(rinhaExpression: Binary): Expression {
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

function genExpression(term: Term): Expression {
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
        case 'Function':
            return genArrowFunctionExpression(term as Function);
        // terms below are replaced with api.js calls
        case 'Print':
            const print = term as Print;
            let value = print.value;
            if (value.kind === 'Function') {
                value = {kind: 'Str', value: '<#closure>'} as Str;
            }
            return genAPICallExpression('rast2js_print', [value]);
        case 'Tuple':
            const tuple = term as Tuple;
            return genAPICallExpression('rast2js_newTuple', [tuple.first, tuple.second]);
        case 'First':
            const first = term as First;
            return genAPICallExpression('rast2js_getFirst', [first.value]);
        case 'Second':
            const second = term as Second;
            return genAPICallExpression('rast2js_getSecond', [second.value]);
    }
    return exp;
}

function genAPICallExpression(apiCallee: string, args: Term[]): CallExpression {
   return genCallExpression(genRastCallTerm(apiCallee, args))
}

function genArrowFunctionExpression(fun: Function): ArrowFunctionExpression {
    const statements: Statement[] = nextTerm(fun.value) as Statement[];

    const funbody = genBlockStatement(statements);
    // autoreturn! bcz everybody on discord is doing so
    if (funbody.body.length > 0) {
        const lastIdx = funbody.body.length - 1;
        const val = funbody.body[lastIdx];
        if (val.type == 'ExpressionStatement') {
            funbody.body[lastIdx] = genReturnStatement(val.expression);
        }
    }

    return {
        type: 'ArrowFunctionExpression',
        params: [...fun.parameters.map((param: Parameter) => genIdentifier(param.text))],
        body: funbody
    } as ArrowFunctionExpression;
}

function genCallExpression(call: Call): CallExpression {
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

function genVariableDeclaration(name: string): VariableDeclaration {
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

function genReturnStatement(expression: Expression): ReturnStatement {
    return {
        type: "ReturnStatement",
        argument: expression
    }
}

function genIdentifier(name: string): Identifier {
    return {
        type: 'Identifier',
        name
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

function isValidExpression(expression: Expression) {
    return Object.keys(expression).length > 0
}

