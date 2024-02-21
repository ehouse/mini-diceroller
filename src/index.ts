import { evaluate } from "./parser";

export function parse(expression: string) {
    return evaluate(expression)
}