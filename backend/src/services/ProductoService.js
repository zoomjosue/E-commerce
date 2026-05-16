const ProductoDAO = require('../daos/ProductoDAO');
const ApiError = require('../utils/ApiError');
const {
  requireFields,
  assertPositiveNumber,
  assertNonNegativeInteger,
  toNull,
} = require('../utils/validators');

function normalizeProducto(data) {
  requireFields(
    data,
    ['nombre', 'precio', 'id_categoria', 'id_proveedor', 'id_marca', 'id_deporte'],
    'Campos obligatorios: nombre, precio, categoria, proveedor, marca, deporte'
  );

  assertPositiveNumber(data.precio, 'precio');
  assertNonNegativeInteger(data.stock ?? 0, 'stock');
  assertNonNegativeInteger(data.stock_minimo ?? 5, 'stock_minimo');

  return {
    id_categoria: data.id_categoria,
    id_proveedor: data.id_proveedor,
    id_marca: data.id_marca,
    id_deporte: data.id_deporte,
    nombre: data.nombre.trim(),
    descripcion: toNull(data.descripcion),
    talla: toNull(data.talla),
    color: toNull(data.color),
    precio: data.precio,
    stock: data.stock ?? 0,
    stock_minimo: data.stock_minimo ?? 5,
  };
}

async function getAll(filters) {
  return ProductoDAO.findAll(filters);
}

async function getById(id) {
  const producto = await ProductoDAO.findById(id);
  if (!producto) throw new ApiError('Producto no encontrado', 404);
  return producto;
}

async function create(data) {
  const producto = normalizeProducto(data);
  const id = await ProductoDAO.create(producto);
  return { id_producto: id, message: 'Producto creado' };
}

async function update(id, data) {
  const producto = normalizeProducto(data);
  const affectedRows = await ProductoDAO.update(id, producto);
  if (!affectedRows) throw new ApiError('Producto no encontrado', 404);
  return { message: 'Producto actualizado' };
}

async function remove(id) {
  if (await ProductoDAO.hasSales(id)) {
    throw new ApiError('No se puede eliminar: el producto tiene ventas registradas', 409);
  }

  const affectedRows = await ProductoDAO.remove(id);
  if (!affectedRows) throw new ApiError('Producto no encontrado', 404);
  return { message: 'Producto eliminado' };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStockBajo: ProductoDAO.findLowStock,
  getMasVendidos: ProductoDAO.findTopSellers,
  getSinVentas: ProductoDAO.findWithoutSales,
  normalizeProducto,
};
