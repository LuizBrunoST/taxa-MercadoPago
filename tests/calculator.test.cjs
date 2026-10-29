const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const core = source.slice(source.indexOf('function parseNumber'), source.indexOf('let mode ='));
const context = vm.createContext({});
vm.runInContext(core, context);
const { parseNumber, simulate } = context;
for (const [raw, expected] of [['150,00', 150], ['1.234,56', 1234.56], ['4.99', 4.99], ['0', 0]]) assert.equal(parseNumber(raw), expected);
for (const raw of ['abc', ' ', '-10', '1,2,3', '1.234,567', 'Infinity']) assert.ok(Number.isNaN(parseNumber(raw)));
assert.equal(simulate(100, 4.99, 0, 'sale').net, 95.01);
assert.equal(simulate(100, 4.99, 0, 'net').gross, 105.25);
assert.equal(simulate(100, 4.99, 3.49, 'sale').net, 91.52);
let cases = 0;
for (const amount of [.01, 1, 100, 1234.56, 1e9]) {
  for (const rate of [0, .99, 4.99, 50, 99.99]) {
    for (const fixed of [0, 3.49]) {
      const result = simulate(amount, rate, fixed, 'net');
      assert.ok(result.net >= amount, 'A cobrança deve cobrir o líquido solicitado.');
      const previous = simulate(Math.round((result.gross - .01) * 100) / 100, rate, fixed, 'sale');
      assert.ok(previous.net < amount, 'Um centavo a menos deve ficar abaixo do líquido solicitado.');
      cases++;
    }
  }
}
console.log(`OK: parsing, entradas inválidas, taxas e ${cases} cenários de cobrança mínima.`);
