import { alt, apply, buildLexer, expectEOF, expectSingleResult, str, tok, Token, rule, lrec_sc, seq, kmid } from 'typescript-parsec';
import type { NumberExpression, RollExpression, Expression, RollAdvantageExpression } from './types';

export class EmptyExpressionError extends Error { constructor() { super(); this.message = 'Cannot parse an empty expression' } }

enum TokenKind {
    Number,
    Comma,
    Space,
    Die,
    Add,
    Sub,
    Mul,
    Div,
    LParen,
    RParen
}

const lexer = buildLexer([
    [true, /^\d+(\.\d+)?/g, TokenKind.Number],
    [true, /^(\d+|v|\^)?d\d+/g, TokenKind.Die],
    [true, /^\+/g, TokenKind.Add],
    [true, /^-/g, TokenKind.Sub],
    [true, /^\*/g, TokenKind.Mul],
    [true, /^\//g, TokenKind.Div],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [false, /^\s+/g, TokenKind.Space]
]);

const TERM = rule<TokenKind, Expression>();
const FACTOR = rule<TokenKind, Expression>();
const EXP = rule<TokenKind, Expression>();

function applyNumber(value: Token<TokenKind>): NumberExpression {
    return { tag: 'number', n: +value.text }
}

function applyDie(value: Token<TokenKind>): RollExpression | RollAdvantageExpression {
    const splitToken = value.text.split('d')

    if (splitToken[0] === 'v') {
        return {
            tag: 'rollDisadvantage',
            sides: Number(splitToken[1])
        }
    } else if (splitToken[0] === '^') {
        return {
            tag: 'rollAdvantage',
            sides: Number(splitToken[1])
        }
    } else if (Number.isInteger(Number.parseInt(splitToken[0]))) {
        return {
            tag: 'roll',
            n: Number(splitToken[0]),
            sides: Number(splitToken[1])
        }
    } else {
        return {
            tag: 'roll',
            n: 1,
            sides: Number(splitToken[1])
        }
    }
}

function applyBinary(first: Expression, second: [Token<TokenKind>, Expression]): Expression {
    switch (second[0].text) {
        case '+':
            return { tag: 'math', op: '+', left: first, right: second[1] }
        case '-':
            return { tag: 'math', op: '-', left: first, right: second[1] }
        case '*':
            return { tag: 'math', op: '*', left: first, right: second[1] }
        case '/':
            return { tag: 'math', op: '/', left: first, right: second[1] }
        default: throw new Error(`Unknown binary operator: ${second[0].text}`);
    }
}

TERM.setPattern(
    alt(
        apply(tok(TokenKind.Number), applyNumber),
        apply(tok(TokenKind.Die), applyDie),
        kmid(str('('), EXP, str(')'))
    )
);

FACTOR.setPattern(
    lrec_sc(TERM, seq(alt(str('*'), str('/')), TERM), applyBinary)
);

EXP.setPattern(
    lrec_sc(FACTOR, seq(alt(str('+'), str('-')), FACTOR), applyBinary)
);

export function parse(expr: string): Expression {
    if (expr.length === 0) {
        throw new EmptyExpressionError()
    }
    return expectSingleResult(expectEOF(EXP.parse(lexer.parse(expr))));
}