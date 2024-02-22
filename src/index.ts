import { evaluate } from "./evaluator"
import { parse } from "./parser"
import type { EvalExpression, Expression } from "./types"

/**
 * Takes an input string and returns an Evaluated Expression to be displayed
 * 
 * @param input input string to be parsed
 * @returns 
 */
function exec(input: string): EvalExpression {
    return evaluate(parse(input))
}

export * from './types'

module.exports = { parse, evaluate, exec }