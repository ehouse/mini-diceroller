import { parse } from "./parser";
import type { EvaluatedExpression, Expression, MathExpression } from "./types";

/**
 * Evaluate expression tree for rolled dice and total value
 *
 * Converts expressions with tag.roll -> tag.rollValue
 *
 * @param ex expression to be evaluated
 * @returns Evaluate tuple
 */
export function evaluate(ex: Expression): EvaluatedExpression {
  switch (ex.tag) {
    case "number": {
      const v = ex.n;
      return { ex, v, stats: { min: v, max: v, avg: v } };
    }
    case "math": {
      const leftExpression = evaluate(ex.left);
      const rightExpression = evaluate(ex.right);

      const mathExpression: MathExpression = {
        tag: ex.tag,
        op: ex.op,
        left: leftExpression.ex,
        right: rightExpression.ex,
      };

      switch (ex.op) {
        case "+":
          return {
            ex: mathExpression,
            v: leftExpression.v + rightExpression.v,
            stats: {
              min: leftExpression.stats.min + rightExpression.stats.min,
              max: leftExpression.stats.max + rightExpression.stats.max,
              avg: leftExpression.stats.avg + rightExpression.stats.avg,
            },
          };
        case "-":
          return {
            ex: mathExpression,
            v: leftExpression.v - rightExpression.v,
            stats: {
              min: leftExpression.stats.min - rightExpression.stats.min,
              max: leftExpression.stats.max - rightExpression.stats.max,
              avg: leftExpression.stats.avg - rightExpression.stats.avg,
            },
          };
        case "/":
          return {
            ex: mathExpression,
            v: leftExpression.v / rightExpression.v,
            stats: {
              min: leftExpression.stats.min / rightExpression.stats.min,
              max: leftExpression.stats.max / rightExpression.stats.max,
              avg: leftExpression.stats.avg / rightExpression.stats.avg,
            },
          };
        case "*":
          return {
            ex: mathExpression,
            v: leftExpression.v * rightExpression.v,
            stats: {
              min: leftExpression.stats.min * rightExpression.stats.min,
              max: leftExpression.stats.max * rightExpression.stats.max,
              avg: leftExpression.stats.avg * rightExpression.stats.avg,
            },
          };
        default:
          throw new Error("Unhandled Operation");
      }
    }
    case "roll": {
      const rolls: number[] = [];
      // Limit roll size to prevent node/js crash
      if (Math.abs(ex.n) > Math.pow(2, 16)) {
        throw new Error(`roll max value: ${Math.pow(2, 16)}`);
      }

      for (let index = 0; index < Math.abs(ex.n); index++) {
        const roll = Math.floor(Math.random() * ex.sides) + 1;
        rolls.push(ex.n > 0 ? roll : -roll);
      }

      const avg = ex.n * ((1 + ex.sides) / 2);

      return {
        ex: { tag: "rollValue", n: ex.n, sides: ex.sides, results: rolls },
        v: rolls.reduce((acc, v) => acc + v, 0),
        stats: {
          min: ex.n,
          max: ex.n * ex.sides,
          avg: avg,
        },
      };
    }
    case "rollAdvantage": {
      const rolls: number[] = [];
      let sum = 0;

      for (let index = 0; index < 2; index++) {
        rolls.push(Math.floor(Math.random() * ex.sides) + 1);
      }

      // Iterate through and calculate probability using a Cumulative Distribution Function
      for (let k = 1; k <= ex.sides; k++) {
        const probability = (k / ex.sides) ** 2 - ((k - 1) / ex.sides) ** 2;
        sum += k * probability;
      }

      return {
        ex: { tag: "rollValue", n: 2, sides: ex.sides, results: rolls },
        v: Math.max(...rolls),
        stats: {
          min: 1,
          max: ex.sides,
          avg: sum,
        },
      };
    }
    case "rollDisadvantage": {
      const rolls: number[] = [];
      let sum = 0;

      for (let index = 0; index < 2; index++) {
        rolls.push(Math.floor(Math.random() * ex.sides) + 1);
      }

      // Iterate through and calculate probability using a Cumulative Distribution Function
      for (let k = 1; k <= ex.sides; k++) {
        const probability =
          ((ex.sides - (k - 1)) / ex.sides) ** 2 -
          ((ex.sides - k) / ex.sides) ** 2;
        sum += k * probability;
      }

      return {
        ex: { tag: "rollValue", n: 2, sides: ex.sides, results: rolls },
        v: Math.min(...rolls),
        stats: { min: 1, max: ex.sides, avg: sum },
      };
    }
    case "rollValue": {
      return {
        ex,
        v: ex.results.reduce((acc, v) => acc + v, 0),
        stats: {
          min: ex.n,
          max: ex.n * ex.sides,
          avg: ex.sides / ex.n,
        },
      };
    }
  }
}

/**
 * Pretty print results of evaluate()
 *
 * @param ev EvaluatedExpression
 * @returns Pretty string to display
 */
export function evaluateToString(ev: EvaluatedExpression): string {
  const expRecurse = (exp: Expression): string => {
    switch (exp.tag) {
      case "number":
        return `${exp.n}`;
      case "rollValue":
        return `${JSON.stringify(exp.results)}`;
      case "math":
        return `${expRecurse(exp.left)} ${exp.op} ${expRecurse(exp.right)}`;
      default:
        throw new Error(`Unhandled expression:  ${JSON.stringify(exp)}`);
    }
  };

  return `${expRecurse(ev.ex)} > ${ev.v} {min: ${ev.stats.min}, max: ${
    ev.stats.max
  }, avg: ${Math.round((ev.stats.avg + Number.EPSILON) * 100) / 100} }`;
}

/**
 * Safely parses string to be printed to the command line
 *
 * @param str string to be evaluated
 */
export function cmdEvaluate(str: string) {
  try {
    const exp = parse(str);
    return evaluateToString(evaluate(exp));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log("Unknown Error");
    }
  }
}

/**
 * Takes an input string and returns an Evaluated Expression to be displayed
 *
 * @param input input string to be parsed
 * @returns
 */
export function exec(input: string): EvaluatedExpression {
  return evaluate(parse(input));
}
