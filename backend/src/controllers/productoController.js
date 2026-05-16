const ProductoService = require('../services/ProductoService');
const { sendError } = require('../utils/respond');

async function run(res, action, status = 200) {
  try {
    const data = await action();
    return res.status(status).json(data);
  } catch (error) {
    return sendError(res, error);
  }
}

function getAll(req, res) {
  return run(res, () => ProductoService.getAll(req.query));
}

function getStockBajo(req, res) {
  return run(res, () => ProductoService.getStockBajo());
}

function getMasVendidos(req, res) {
  return run(res, () => ProductoService.getMasVendidos());
}

function getSinVentas(req, res) {
  return run(res, () => ProductoService.getSinVentas());
}

function getById(req, res) {
  return run(res, () => ProductoService.getById(req.params.id));
}

function create(req, res) {
  return run(res, () => ProductoService.create(req.body), 201);
}

function update(req, res) {
  return run(res, () => ProductoService.update(req.params.id, req.body));
}

function remove(req, res) {
  return run(res, () => ProductoService.remove(req.params.id));
}

module.exports = {
  getAll,
  getById,
  getStockBajo,
  getMasVendidos,
  getSinVentas,
  create,
  update,
  remove,
};
