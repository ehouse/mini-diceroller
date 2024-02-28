import { parse } from "./parser";
import type { EvalExpression, Expression, MathExpression } from "./types";

/**
 * Evaluate expression tree for rolled dice and total value
 * 
 * Converts expressions with tag.roll -> tag.rollValue
 * 
 * @param exp expression to be evaluated
 * @returns Evaluate tuple
 */
export function evaluate(exp: Expression): EvalExpression {
    switch (exp?.tag) {
        case 'number': { return [exp, exp.n] }
        case 'math': {
            const leftExpression = evaluate(exp.left)
            const rightExpression = evaluate(exp.right)
            const mathExpression: MathExpression = {
                tag: exp.tag,
                op: exp.op,
                left: leftExpression[0],
                right: rightExpression[0]
            }
            switch (exp.op) {
                case '+':
                    return [mathExpression, leftExpression[1] + rightExpression[1]]
                case '-':
                    return [mathExpression, leftExpression[1] - rightExpression[1]]
                case '/':
                    return [mathExpression, leftExpression[1] / rightExpression[1]]
                case '*':
                    return [mathExpression, leftExpression[1] * rightExpression[1]]
                default:
                    throw new Error('Unhandled Operation')
            }
        }
        case 'roll': {
            const rolls: number[] = []
            // Limit roll size to prevent node/js crash 
            if (exp.n > Math.pow(2, 16)) {
                throw new Error(`roll max value: ${Math.pow(2, 16)}`)
            }
            for (let index = 0; index < exp.n; index++) {
                rolls.push(Math.floor(Math.random() * exp.sides) + 1)
            }
            return [{
                tag: "rollValue",
                n: exp.n,
                sides: exp.sides,
                results: rolls
            }, rolls.reduce((acc, v) => acc + v, 0)]
        }
        case 'rollAdvantage': {
            const rolls: number[] = []
            for (let index = 0; index < 2; index++) {
                rolls.push(Math.floor(Math.random() * exp.sides) + 1)
            }
            return [{
                tag: "rollValue",
                n: 2,
                sides: exp.sides,
                results: rolls
            }, Math.max(...rolls)]
        }
        case 'rollDisadvantage': {
            const rolls: number[] = []
            for (let index = 0; index < 2; index++) {
                rolls.push(Math.floor(Math.random() * exp.sides) + 1)
            }
            return [{
                tag: "rollValue",
                n: 2,
                sides: exp.sides,
                results: rolls
            }, Math.min(...rolls)]
        }
        case 'rollValue': { return [exp, exp.results.reduce((acc, v) => acc + v, 0)] }
    }
}

/**
 * Pretty print results of evaluate()
 * 
 * @param ev evaluate tuple
 * @returns Pretty string to display
 */
export function evaluateToString(ev: EvalExpression): string {
    const expRecurse = (exp: Expression): string => {
        switch (exp.tag) {
            case 'number': return `${exp.n}`
            case 'rollValue': return `${JSON.stringify(exp.results)}`
            case 'math': return `${expRecurse(exp.left)} ${exp.op} ${expRecurse(exp.right)}`
            default: throw new Error(`Unhandled expression:  ${JSON.stringify(exp)}`)
        }
    }

    return `${expRecurse(ev[0])} > ${ev[1]}`
}

/**
 * Safely parses string to be printed to the command line
 * 
 * @param str string to be evaluated
 */
export function cmdEvaluate(str: string) {
    try {
        const exp = parse(str)
        return evaluateToString(evaluate(exp))
    } catch (e) {
        if (e instanceof Error) {
            console.log(e.message)
        } else {
            console.log('Unknown Error')
        }
    }
}

/**
 * Takes an input string and returns an Evaluated Expression to be displayed
 * 
 * @param input input string to be parsed
 * @returns 
 */
export function exec(input: string): EvalExpression {
    return evaluate(parse(input))
}