const ClienteDAO = require('../daos/ClienteDAO');
const ApiError = require('../utils/ApiError');
const { requireFields, assertEmail, toNull } = require('../utils/validators');

function normalizeCliente(data) {
  requireFields(data, ['nombre'], 'El nombre es obligatorio');
  assertEmail(data.email);

  return {
    nombre: data.nombre.trim(),
    email: toNull(data.email),
    telefono: toNull(data.telefono),
    direccion: toNull(data.direccion),
  };
}

async function getAll(filters) {
  return ClienteDAO.findAll(filters);
}

async function getConHistorial() {
  return ClienteDAO.findHistory();
}

async function getPorDeporte(idDeporte) {
  return ClienteDAO.findBySport(idDeporte);
}

async function getById(id) {
  const cliente = await ClienteDAO.findById(id);
  if (!cliente) throw new ApiError('Cliente no encontrado', 404);
  return cliente;
}

async function create(data) {
  try {
    const id = await ClienteDAO.create(normalizeCliente(data));
    return { id_cliente: id, message: 'Cliente creado' };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError('Ya existe un cliente con ese email', 409);
    }
    throw error;
  }
}

async function update(id, data) {
  try {
    const affectedRows = await ClienteDAO.update(id, normalizeCliente(data));
    if (!affectedRows) throw new ApiError('Cliente no encontrado', 404);
    return { message: 'Cliente actualizado' };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError('Ya existe un cliente con ese email', 409);
    }
    throw error;
  }
}

async function remove(id) {
  if (await ClienteDAO.hasSales(id)) {
    throw new ApiError('No se puede eliminar: el cliente tiene ventas registradas', 409);
  }

  const affectedRows = await ClienteDAO.remove(id);
  if (!affectedRows) throw new ApiError('Cliente no encontrado', 404);
  return { message: 'Cliente eliminado' };
}

module.exports = {
  getAll,
  getConHistorial,
  getPorDeporte,
  getById,
  create,
  update,
  remove,
  normalizeCliente,
};
