const CatalogoService = require('../services/CatalogoService');
const { sendError } = require('../utils/respond');

async function run(res, action, status = 200) {
  try {
    const data = await action();
    return res.status(status).json(data);
  } catch (error) {
    return sendError(res, error);
  }
}

function makeCatalogController(service) {
  return {
    getAll(req, res) {
      return run(res, () => service.getAll());
    },
    getById(req, res) {
      return run(res, () => service.getById(req.params.id));
    },
    create(req, res) {
      return run(res, () => service.create(req.body), 201);
    },
    update(req, res) {
      return run(res, () => service.update(req.params.id, req.body));
    },
    remove(req, res) {
      return run(res, () => service.remove(req.params.id));
    },
  };
}

function getEmpleados(req, res) {
  return run(res, () => CatalogoService.getEmpleados());
}

module.exports = {
  categoriaCtrl: makeCatalogController(CatalogoService.makeCatalogService('CATEGORIA', 'id_categoria')),
  marcaCtrl: makeCatalogController(CatalogoService.makeCatalogService('MARCA', 'id_marca')),
  deporteCtrl: makeCatalogController(CatalogoService.makeCatalogService('DEPORTE', 'id_deporte')),
  proveedorCtrl: makeCatalogController(CatalogoService.makeCatalogService('PROVEEDOR', 'id_proveedor')),
  getEmpleados,
};
