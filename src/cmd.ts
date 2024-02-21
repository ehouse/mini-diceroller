import { program } from 'commander'
import { cmdEvaluate } from './evaluator'

program
    .name('prophecy-cmd')
    .argument('<string>', 'String to parse (ex: 1d20 + 1d6 + 4)')
    .action((str) => {
        console.log(cmdEvaluate(str))
    })

program.parse()