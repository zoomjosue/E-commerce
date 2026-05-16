const VentaDAO = require('../daos/VentaDAO');
const ApiError = require('../utils/ApiError');
const { requireFields, assertNonNegativeInteger } = require('../utils/validators');

async function getAll(filters) {
  return VentaDAO.findAll(filters);
}

async function getById(id) {
  const venta = await VentaDAO.findById(id);
  if (!venta) throw new ApiError('Venta no encontrada', 404);
  return venta;
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError('id_cliente, id_empleado e items son requeridos', 400);
  }

  for (const item of items) {
    requireFields(item, ['id_producto', 'cantidad'], 'Cada item debe incluir id_producto y cantidad');
    assertNonNegativeInteger(item.cantidad, 'cantidad');
    if (Number(item.cantidad) === 0) throw new ApiError('cantidad debe ser mayor a 0', 400);
  }
}

async function create(data) {
  requireFields(data, ['id_cliente', 'id_empleado'], 'id_cliente, id_empleado e items son requeridos');
  validateItems(data.items);

  try {
    const result = await VentaDAO.createSale(data);
    return { ...result, message: 'Venta registrada correctamente' };
  } catch (error) {
    throw new ApiError(error.message || 'Error al procesar la venta', 400);
  }
}

async function anular(id) {
  try {
    await VentaDAO.cancelSale(id);
    return { message: 'Venta anulada y stock restaurado' };
  } catch (error) {
    throw new ApiError(error.message, error.message === 'Venta no encontrada' ? 404 : 400);
  }
}

async function getReporte(filters) {
  const desde = filters.fecha_desde || '2000-01-01';
  const hasta = filters.fecha_hasta || '2099-12-31';
  return VentaDAO.getReport({ desde, hasta });
}

module.exports = {
  getAll,
  getById,
  create,
  anular,
  getReporte,
  validateItems,
};
