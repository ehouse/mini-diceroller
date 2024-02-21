export type Operation = "+" | "-" | "*" | "/";

export type MathExpression = {
    tag: "math";
    op: Operation;
    left: Expression;
    right: Expression;
};

export type RollExpression = {
    tag: "roll";
    n: number;
    sides: number;
};

export type RollValueExpression = {
    tag: "rollValue";
    n: number;
    sides: number;
    results: number[]
};

export type NumberExpression = {
    tag: "number";
    n: number;
};

export type Expression = MathExpression | RollExpression | RollValueExpression | NumberExpression;