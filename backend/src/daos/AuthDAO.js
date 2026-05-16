const pool = require('../db/pool');

async function countUsers() {
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM USUARIO');
  return rows[0].cnt;
}

async function createUser([nombre, email, passwordHash, rol]) {
  await pool.query(
    'INSERT INTO USUARIO (nombre, email, password_hash, rol) VALUES (?,?,?,?)',
    [nombre, email, passwordHash, rol]
  );
  const [[{ id }]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
  return id;
}

async function createEmployee([idUsuario, telefono, direccion, fechaContrato]) {
  await pool.query(
    'INSERT INTO EMPLEADO (id_usuario, telefono, direccion, fecha_contrato) VALUES (?,?,?,?)',
    [idUsuario, telefono, direccion, fechaContrato]
  );
  const [[{ id }]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
  return id;
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM USUARIO WHERE email = ?', [email]);
  return rows[0] || null;
}

async function insertSeedSale(venta) {
  await pool.query('INSERT INTO VENTA (id_cliente, id_empleado, fecha_venta, total, estado) VALUES (?,?,?,?,?)', venta);
  const [[{ id }]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
  return id;
}

async function insertSeedSaleDetail(idVenta, detail) {
  await pool.query(
    'INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
    [idVenta, detail[0], detail[1], detail[2], detail[3]]
  );
}

module.exports = {
  countUsers,
  createUser,
  createEmployee,
  findUserByEmail,
  insertSeedSale,
  insertSeedSaleDetail,
};
