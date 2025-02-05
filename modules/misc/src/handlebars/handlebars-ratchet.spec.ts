import handlebars from 'handlebars';
import { HandlebarsRatchet } from './handlebars-ratchet.js';
import { describe, expect, test } from 'vitest';

describe('#handlebarsService', () => {
  test('should test equal', async () => {
    handlebars.registerHelper('eq', HandlebarsRatchet.equal);
    const out1: string = handlebars.compile('{{eq 1 2}}')({});
    expect(out1).toEqual('false');
    const out2: string = handlebars.compile('{{eq 1 1}}')({});
    expect(out2).toEqual('true');
    const out3: string = handlebars.compile('{{eq 1 a}}')({ a: 1 });
    expect(out3).toEqual('true');
  });

  test('should test notequal', async () => {
    handlebars.registerHelper('ne', HandlebarsRatchet.notEqual);
    const out1: string = handlebars.compile('{{ne 1 2}}')({});
    expect(out1).toEqual('true');
    const out2: string = handlebars.compile('{{ne 1 1}}')({});
    expect(out2).toEqual('false');
    const out3: string = handlebars.compile('{{ne 1 a}}')({ a: 1 });
    expect(out3).toEqual('false');
  });

  test('should test less-than/less-than-equal', async () => {
    handlebars.registerHelper('lt', HandlebarsRatchet.lessThan);
    handlebars.registerHelper('lte', HandlebarsRatchet.lessThanEqual);
    const out1: string = handlebars.compile('{{lt 1 2}}')({});
    expect(out1).toEqual('true');
    const out2: string = handlebars.compile('{{lt 1 1}}')({});
    expect(out2).toEqual('false');
    const out3: string = handlebars.compile('{{lte 1 1}}')({});
    expect(out3).toEqual('true');
    const out4: string = handlebars.compile('{{lt 20 1}}')({});
    expect(out4).toEqual('false');
  });

  test('should test greater-than/greater-than-equal', async () => {
    handlebars.registerHelper('gt', HandlebarsRatchet.greaterThan);
    handlebars.registerHelper('gte', HandlebarsRatchet.greaterThanEqual);
    const out1: string = handlebars.compile('{{gt 2 1}}')({});
    expect(out1).toEqual('true');
    const out2: string = handlebars.compile('{{gt 1 1}}')({});
    expect(out2).toEqual('false');
    const out3: string = handlebars.compile('{{gte 1 1}}')({});
    expect(out3).toEqual('true');
    const out4: string = handlebars.compile('{{gt 1 20}}')({});
    expect(out4).toEqual('false');
  });

  test('should test and/or', async () => {
    handlebars.registerHelper('and', HandlebarsRatchet.and);
    handlebars.registerHelper('or', HandlebarsRatchet.or);
    const out1: string = handlebars.compile('{{and true true}}')({});
    expect(out1).toEqual('true');
    const out2: string = handlebars.compile('{{and true false}}')({});
    expect(out2).toEqual('false');
    const out3: string = handlebars.compile('{{and false false}}')({});
    expect(out3).toEqual('false');
    const out4: string = handlebars.compile('{{or true true}}')({});
    expect(out4).toEqual('true');
    const out5: string = handlebars.compile('{{or true false}}')({});
    expect(out5).toEqual('true');
    const out6: string = handlebars.compile('{{or false false}}')({});
    expect(out6).toEqual('false');

    const out7: string = handlebars.compile('{{and true true true true}}')({});
    expect(out7).toEqual('true');
    const out8: string = handlebars.compile('{{or true false true false}}')({});
    expect(out8).toEqual('true');
  });

  test('should test formatBytes', async () => {
    handlebars.registerHelper('formatBytes', HandlebarsRatchet.formatBytes);
    const out1: string = handlebars.compile('{{formatBytes 10}}')({});
    expect(out1).toEqual('10 Bytes');
    const out2: string = handlebars.compile('{{formatBytes 1040}}')({});
    expect(out2).toEqual('1.02 KB');
    const out3: string = handlebars.compile('{{formatBytes 2100000}}')({});
    expect(out3).toEqual('2 MB');
    const out4: string = handlebars.compile('{{formatBytes 3300000000}}')({});
    expect(out4).toEqual('3.07 GB');
  });

  test('should test mat', async () => {
    HandlebarsRatchet.registerAll(handlebars);
    const add: string = handlebars.compile('{{add 2 1}}')({});
    expect(add).toEqual('3');
    const sub1: string = handlebars.compile('{{sub 1 2}}')({});
    expect(sub1).toEqual('-1');
    const sub2: string = handlebars.compile('{{sub 2 1}}')({});
    expect(sub2).toEqual('1');
    const mul: string = handlebars.compile('{{mul 2 3}}')({});
    expect(mul).toEqual('6');
    const div1: string = handlebars.compile('{{div 2 1}}')({});
    expect(div1).toEqual('2');
    const div2: string = handlebars.compile('{{div 1 2}}')({});
    expect(div2).toEqual('0.5');
    const mod: string = handlebars.compile('{{mod 3 2}}')({});
    expect(mod).toEqual('1');
    const maxNum: string = handlebars.compile('{{maxNum 2 1 8 5 7}}')({});
    expect(maxNum).toEqual('8');
    const minNum: string = handlebars.compile('{{minNum 2 1 8 5 7}}')({});
    expect(minNum).toEqual('1');
  });

  test('should test rpn', async () => {
    handlebars.registerHelper('rpn', HandlebarsRatchet.reversePolishNotation);
    const out1: string = handlebars.compile('{{rpn 5 10 "maxNum" 10 "add" 3 "sub"}}')({});
    expect(out1).toEqual('17');
    const out2: string = handlebars.compile('{{rpn n1 n2 "div" n3 "mul" 6 "mod"}}')({ n1: 10, n2: 5, n3: '10' });
    expect(out2).toEqual('2');
    const out3: string = handlebars.compile('{{rpn 1 "div"}}')({});
    expect(out3).toEqual('Cannot execute operation div - not enough args');
  });
});
