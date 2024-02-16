import { parse } from '../index';

describe('Test basic parser functionality', () => {
    it('Input/Output', () => {
        expect(parse('Hello World!')).toEqual('Hello World!');
    })
})