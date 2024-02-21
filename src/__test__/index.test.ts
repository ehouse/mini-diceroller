import { parse } from '../index';

describe('Test basic parser functionality', () => {
    it('Input/Output', () => {
        expect(parse('1')).toEqual(1);
    })
})