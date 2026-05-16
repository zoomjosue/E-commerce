const pool = require('../db/pool');

async function findAll(table, orderBy) {
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY ${orderBy}`);
  return rows;
}

async function findById(table, idField, id) {
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE ${idField} = ?`, [id]);
  return rows[0] || null;
}

async function create(table, idField, data) {
  const fields = Object.keys(data).filter((key) => key !== idField);
  const values = fields.map((field) => data[field]);
  const sql = `INSERT INTO \`${table}\` (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`;
  const [result] = await pool.query(sql, values);
  return result.insertId;
}

async function update(table, idField, id, data) {
  const fields = Object.keys(data).filter((key) => key !== idField);
  const values = fields.map((field) => data[field]);
  const sql = `UPDATE \`${table}\` SET ${fields.map((field) => `${field}=?`).join(',')} WHERE ${idField}=?`;
  const [result] = await pool.query(sql, [...values, id]);
  return result.affectedRows;
}

async function remove(table, idField, id) {
  const [result] = await pool.query(`DELETE FROM \`${table}\` WHERE ${idField}=?`, [id]);
  return result.affectedRows;
}

async function findEmployees() {
  const [rows] = await pool.query(`
    SELECT e.id_empleado, u.nombre, u.email, u.rol,
           e.telefono, e.direccion, e.fecha_contrato
    FROM EMPLEADO e
    JOIN USUARIO u ON e.id_usuario = u.id_usuario
    ORDER BY u.nombre
  `);
  return rows;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findEmployees,
};
