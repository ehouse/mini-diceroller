import { alt, apply, buildLexer, expectEOF, expectSingleResult, str, tok, Token, rule, lrec_sc, seq, kmid } from 'typescript-parsec';
import type { NumberExpression, RollExpression, Expression } from './types';

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
    [true, /^(\d+)?d\d+/g, TokenKind.Die],
    [true, /^\+/g, TokenKind.Add],
    [true, /^\-/g, TokenKind.Sub],
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

function applyDie(value: Token<TokenKind>): RollExpression {
    const splitToken = value.text.split('d')

    return {
        tag: 'roll',
        n: Number(splitToken[0]),
        sides: Number(splitToken[1])
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
    return expectSingleResult(expectEOF(EXP.parse(lexer.parse(expr))));
}

console.log(JSON.stringify(parse('(1d20 + 2) * 3')))

// const parser = alt(
//     apply(tok(TokenKind.Number), applyNumber),
//     apply(tok(TokenKind.Die), applyDie)
// )

// const numberListParser = list_sc(parser, str(','));
// const parsedOutput = numberListParser.parse(tokenizer.parse('d10, d20, 2d6, 1d12, 123, 456.789, 0'))
// const numberArray = expectSingleResult(expectEOF(parsedOutput));