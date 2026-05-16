const pool = require('../db/pool');

async function findAll({ search } = {}) {
  let sql = 'SELECT * FROM CLIENTE WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (nombre LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY nombre';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findHistory() {
  const [rows] = await pool.query(`
    SELECT c.id_cliente, c.nombre, c.email, c.telefono,
           COUNT(v.id_venta) AS total_ventas,
           COALESCE(SUM(v.total), 0) AS monto_total,
           MAX(v.fecha_venta) AS ultima_compra
    FROM CLIENTE c
    LEFT JOIN VENTA v ON c.id_cliente = v.id_cliente AND v.estado = 'completada'
    GROUP BY c.id_cliente, c.nombre, c.email, c.telefono
    HAVING total_ventas >= 0
    ORDER BY monto_total DESC
  `);
  return rows;
}

async function findBySport(idDeporte) {
  const [rows] = await pool.query(
    `SELECT DISTINCT c.id_cliente, c.nombre, c.email, c.telefono
     FROM CLIENTE c
     WHERE c.id_cliente IN (
       SELECT v.id_cliente
       FROM VENTA v
       JOIN DETALLE_VENTA dv ON v.id_venta = dv.id_venta
       JOIN PRODUCTO      p  ON dv.id_producto = p.id_producto
       WHERE p.id_deporte = ? AND v.estado = 'completada'
     )
     ORDER BY c.nombre`,
    [idDeporte]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM CLIENTE WHERE id_cliente = ?', [id]);
  return rows[0] || null;
}

async function create(cliente) {
  const [result] = await pool.query(
    'INSERT INTO CLIENTE (nombre, email, telefono, direccion) VALUES (?,?,?,?)',
    [cliente.nombre, cliente.email, cliente.telefono, cliente.direccion]
  );
  return result.insertId;
}

async function update(id, cliente) {
  const [result] = await pool.query(
    'UPDATE CLIENTE SET nombre=?, email=?, telefono=?, direccion=? WHERE id_cliente=?',
    [cliente.nombre, cliente.email, cliente.telefono, cliente.direccion, id]
  );
  return result.affectedRows;
}

async function hasSales(id) {
  const [rows] = await pool.query(
    'SELECT EXISTS(SELECT 1 FROM VENTA WHERE id_cliente = ?) AS tiene_ventas',
    [id]
  );
  return Boolean(rows[0].tiene_ventas);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM CLIENTE WHERE id_cliente = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findHistory,
  findBySport,
  findById,
  create,
  update,
  hasSales,
  remove,
};
