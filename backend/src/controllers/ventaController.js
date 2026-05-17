const VentaService = require('../services/VentaService');
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
  return run(res, () => VentaService.getAll(req.query));
}

function getById(req, res) {
  return run(res, () => VentaService.getById(req.params.id));
}

function create(req, res) { 
  return run(res, () => VentaService.create(req.body), 201);
}

function anular(req, res) {
  return run(res, () => VentaService.anular(req.params.id));
}

function getReporte(req, res) {
  return run(res, () => VentaService.getReporte(req.query));
}

module.exports = {
  getAll,
  getById,
  create,
  anular,
  getReporte,
};
