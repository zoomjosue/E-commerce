const test = require('node:test');
const assert = require('node:assert/strict');

const {
  requireFields,
  assertPositiveNumber,
  assertEmail,
  toNull,
} = require('../src/utils/validators');

test('requireFields throws 400 when a required field is missing', () => {
  assert.throws(
    () => requireFields({ nombre: '' }, ['nombre']),
    (error) => error.status === 400 && error.message.includes('nombre')
  );
});

test('assertPositiveNumber rejects zero and negative values', () => {
  assert.throws(() => assertPositiveNumber(0, 'precio'), /precio debe ser mayor a 0/);
  assert.throws(() => assertPositiveNumber(-4, 'precio'), /precio debe ser mayor a 0/);
});

test('assertEmail accepts empty optional emails and rejects malformed ones', () => {
  assert.doesNotThrow(() => assertEmail(''));
  assert.doesNotThrow(() => assertEmail('cliente@tienda.com'));
  assert.throws(() => assertEmail('cliente-tienda'), /email no tiene un formato valido/);
});

test('toNull normalizes empty optional values', () => {
  assert.equal(toNull(''), null);
  assert.equal(toNull(undefined), null);
  assert.equal(toNull('dato'), 'dato');
});
