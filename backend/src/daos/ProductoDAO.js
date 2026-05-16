const pool = require('../db/pool');

async function findAll({ search, categoria, deporte } = {}) {
  let sql = `
    SELECT p.id_producto, p.nombre, p.descripcion, p.talla, p.color,
           p.precio, p.stock, p.stock_minimo,
           c.nombre  AS categoria,
           m.nombre  AS marca,
           d.nombre  AS deporte,
           pr.nombre AS proveedor,
           p.id_categoria, p.id_marca, p.id_deporte, p.id_proveedor
    FROM PRODUCTO p
    JOIN CATEGORIA c  ON p.id_categoria = c.id_categoria
    JOIN MARCA     m  ON p.id_marca     = m.id_marca
    JOIN DEPORTE   d  ON p.id_deporte   = d.id_deporte
    JOIN PROVEEDOR pr ON p.id_proveedor = pr.id_proveedor
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ' AND p.nombre LIKE ?';
    params.push(`%${search}%`);
  }
  if (categoria) {
    sql += ' AND p.id_categoria = ?';
    params.push(categoria);
  }
  if (deporte) {
    sql += ' AND p.id_deporte = ?';
    params.push(deporte);
  }

  sql += ' ORDER BY p.nombre';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre AS categoria, m.nombre AS marca,
            d.nombre AS deporte, pr.nombre AS proveedor
     FROM PRODUCTO p
     JOIN CATEGORIA c  ON p.id_categoria = c.id_categoria
     JOIN MARCA     m  ON p.id_marca     = m.id_marca
     JOIN DEPORTE   d  ON p.id_deporte   = d.id_deporte
     JOIN PROVEEDOR pr ON p.id_proveedor = pr.id_proveedor
     WHERE p.id_producto = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(producto) {
  const [result] = await pool.query(
    `INSERT INTO PRODUCTO
       (id_categoria, id_proveedor, id_marca, id_deporte, nombre, descripcion, talla, color, precio, stock, stock_minimo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      producto.id_categoria,
      producto.id_proveedor,
      producto.id_marca,
      producto.id_deporte,
      producto.nombre,
      producto.descripcion,
      producto.talla,
      producto.color,
      producto.precio,
      producto.stock,
      producto.stock_minimo,
    ]
  );
  return result.insertId;
}

async function update(id, producto) {
  const [result] = await pool.query(
    `UPDATE PRODUCTO SET id_categoria=?, id_proveedor=?, id_marca=?, id_deporte=?,
       nombre=?, descripcion=?, talla=?, color=?, precio=?, stock=?, stock_minimo=?
     WHERE id_producto=?`,
    [
      producto.id_categoria,
      producto.id_proveedor,
      producto.id_marca,
      producto.id_deporte,
      producto.nombre,
      producto.descripcion,
      producto.talla,
      producto.color,
      producto.precio,
      producto.stock,
      producto.stock_minimo,
      id,
    ]
  );
  return result.affectedRows;
}

async function hasSales(id) {
  const [rows] = await pool.query(
    'SELECT EXISTS(SELECT 1 FROM DETALLE_VENTA WHERE id_producto = ?) AS tiene_ventas',
    [id]
  );
  return Boolean(rows[0].tiene_ventas);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM PRODUCTO WHERE id_producto = ?', [id]);
  return result.affectedRows;
}

async function findLowStock() {
  const [rows] = await pool.query('SELECT * FROM vista_stock_bajo ORDER BY nombre');
  return rows;
}

async function findTopSellers() {
  const [rows] = await pool.query(`
    WITH ventas_por_producto AS (
      SELECT dv.id_producto,
             SUM(dv.cantidad) AS total_vendido,
             SUM(dv.subtotal) AS ingresos_totales,
             COUNT(DISTINCT dv.id_venta) AS num_ventas
      FROM DETALLE_VENTA dv
      JOIN VENTA v ON dv.id_venta = v.id_venta
      WHERE v.estado = 'completada'
      GROUP BY dv.id_producto
      HAVING SUM(dv.cantidad) > 0
    )
    SELECT p.id_producto, p.nombre, p.precio,
           m.nombre AS marca,
           d.nombre AS deporte,
           vpp.total_vendido,
           vpp.ingresos_totales,
           vpp.num_ventas
    FROM ventas_por_producto vpp
    JOIN PRODUCTO p ON vpp.id_producto = p.id_producto
    JOIN MARCA    m ON p.id_marca      = m.id_marca
    JOIN DEPORTE  d ON p.id_deporte    = d.id_deporte
    ORDER BY vpp.total_vendido DESC
    LIMIT 10
  `);
  return rows;
}

async function findWithoutSales() {
  const [rows] = await pool.query(`
    SELECT p.id_producto, p.nombre, p.precio, p.stock,
           m.nombre AS marca, c.nombre AS categoria
    FROM PRODUCTO p
    JOIN MARCA     m ON p.id_marca     = m.id_marca
    JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
    WHERE p.id_producto NOT IN (
      SELECT DISTINCT id_producto FROM DETALLE_VENTA
    )
    ORDER BY p.nombre
  `);
  return rows;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  hasSales,
  remove,
  findLowStock,
  findTopSellers,
  findWithoutSales,
};
