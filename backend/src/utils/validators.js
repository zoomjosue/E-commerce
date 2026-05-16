const ApiError = require('./ApiError');

function requireFields(data, fields, message) {
  const missing = fields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');
  if (missing.length) {
    throw new ApiError(message || `Campos obligatorios: ${missing.join(', ')}`, 400);
  }
}

function assertPositiveNumber(value, field) {
  if (Number(value) <= 0 || Number.isNaN(Number(value))) {
    throw new ApiError(`${field} debe ser mayor a 0`, 400);
  }
}

function assertNonNegativeInteger(value, field) {
  if (!Number.isInteger(Number(value)) || Number(value) < 0) {
    throw new ApiError(`${field} debe ser un entero mayor o igual a 0`, 400);
  }
}

function assertEmail(value, field = 'email') {
  if (!value) return;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) {
    throw new ApiError(`${field} no tiene un formato valido`, 400);
  }
}

function toNull(value) {
  return value === undefined || value === '' ? null : value;
}

module.exports = {
  requireFields,
  assertPositiveNumber,
  assertNonNegativeInteger,
  assertEmail,
  toNull,
};
