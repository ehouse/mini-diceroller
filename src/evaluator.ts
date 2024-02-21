import { Expression, MathExpression, RollValueExpression } from "./types";

type Evaluate = [exp: Expression, value: number]

export function evaluate(exp: Expression): Evaluate {
    switch (exp?.tag) {
        case 'number': return [exp, exp.n]
        case 'math':
            const leftExpression = evaluate(exp.left)
            const rightExpression = evaluate(exp.right)
            const MathExpression: MathExpression = {
                tag: exp.tag,
                op: exp.op,
                left: leftExpression[0],
                right: rightExpression[0]
            }
            return [MathExpression, leftExpression[1] + rightExpression[1]]
        case 'roll':
            const rolls: number[] = []
            for (let index = 0; index < exp.n; index++) {
                rolls.push(Math.floor(Math.random() * exp.sides) + 1)
            }
            return [{
                tag: "rollValue",
                n: exp.n,
                sides: exp.sides,
                results: rolls
            }, rolls.reduce((acc, v) => acc + v, 0)]
        case 'rollValue': return [exp, exp.results.reduce((acc, v) => acc + v, 0)]
    }
}