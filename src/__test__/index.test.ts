import { cmdEvaluate } from "../evaluator";
import { parse } from "../parser"

describe('test single parser', () => {
    it('single number', () => {
        expect(parse('1')).toEqual({ "n": 1, "tag": "number" });
    })

    it('single die roll', () => {
        expect(parse('1d20')).toEqual({ "n": 1, "sides": 20, "tag": "roll", });
    })
})

describe('Test CMD', () => {
    it('evaluates complex athematic string', () => {
        expect(cmdEvaluate('(2 + 2) * 2')).toEqual('2 + 2 * 2 > 8')
    })
})