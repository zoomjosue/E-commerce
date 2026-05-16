const CatalogoDAO = require('../daos/CatalogoDAO');
const ApiError = require('../utils/ApiError');

function makeCatalogService(table, idField, orderBy = 'nombre') {
  return {
    getAll() {
      return CatalogoDAO.findAll(table, orderBy);
    },
    async getById(id) {
      const item = await CatalogoDAO.findById(table, idField, id);
      if (!item) throw new ApiError('No encontrado', 404);
      return item;
    },
    async create(data) {
      const id = await CatalogoDAO.create(table, idField, data);
      return { [idField]: id };
    },
    async update(id, data) {
      const affectedRows = await CatalogoDAO.update(table, idField, id, data);
      if (!affectedRows) throw new ApiError('No encontrado', 404);
      return { message: 'Actualizado' };
    },
    async remove(id) {
      try {
        const affectedRows = await CatalogoDAO.remove(table, idField, id);
        if (!affectedRows) throw new ApiError('No encontrado', 404);
        return { message: 'Eliminado' };
      } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new ApiError('No se puede eliminar: tiene registros relacionados', 409);
        }
        throw error;
      }
    },
  };
}

module.exports = {
  makeCatalogService,
  getEmpleados: CatalogoDAO.findEmployees,
};
