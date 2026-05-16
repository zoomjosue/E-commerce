const ClienteService = require('../services/ClienteService');
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
  return run(res, () => ClienteService.getAll(req.query));
}

function getConHistorial(req, res) {
  return run(res, () => ClienteService.getConHistorial());
}

function getPorDeporte(req, res) {
  return run(res, () => ClienteService.getPorDeporte(req.params.id_deporte));
}

function getById(req, res) {
  return run(res, () => ClienteService.getById(req.params.id));
}

function create(req, res) {
  return run(res, () => ClienteService.create(req.body), 201);
}

function update(req, res) {
  return run(res, () => ClienteService.update(req.params.id, req.body));
}

function remove(req, res) {
  return run(res, () => ClienteService.remove(req.params.id));
}

module.exports = {
  getAll,
  getById,
  getConHistorial,
  getPorDeporte,
  create,
  update,
  remove,
};
