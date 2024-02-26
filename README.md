# Mini Diceroller

[NPM Registry](https://www.npmjs.com/package/mini-diceroller)

A mini language written using ts-parsec to evaluate a string of rolled dice with arthritic expressions 

## Supported Tokens
 - Parenthesis - `(1d20 + 2) * 2`
 - Addition/Subtraction - `1d20 + 17 - 8`
 - Multiplication/Division - `1d20 / 2`

## npm Commands
 - `npm run test` - Runs test suit
 - `npm run build` - Runs and outputs compiled typescript

## Local REPL
```
[mini-diceroller]$ node 
> const cmd = await import("./dist/index.js")
> cmd.cmdEvaluate("1d20 + 2")
'[13] + 2 > 15'
```