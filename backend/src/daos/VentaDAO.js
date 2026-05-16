const pool = require('../db/pool');

async function findAll({ estado, fecha_desde, fecha_hasta } = {}) {
  let sql = `
    SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
           c.nombre AS nombre_cliente,
           u.nombre AS nombre_empleado
    FROM VENTA v
    JOIN CLIENTE  c ON v.id_cliente  = c.id_cliente
    JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
    JOIN USUARIO  u ON e.id_usuario  = u.id_usuario
    WHERE 1=1
  `;
  const params = [];

  if (estado) {
    sql += ' AND v.estado = ?';
    params.push(estado);
  }
  if (fecha_desde) {
    sql += ' AND DATE(v.fecha_venta) >= ?';
    params.push(fecha_desde);
  }
  if (fecha_hasta) {
    sql += ' AND DATE(v.fecha_venta) <= ?';
    params.push(fecha_hasta);
  }

  sql += ' ORDER BY v.fecha_venta DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [venta] = await pool.query(
    `SELECT v.*, c.nombre AS nombre_cliente, u.nombre AS nombre_empleado
     FROM VENTA v
     JOIN CLIENTE  c ON v.id_cliente  = c.id_cliente
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     JOIN USUARIO  u ON e.id_usuario  = u.id_usuario
     WHERE v.id_venta = ?`,
    [id]
  );

  if (!venta.length) return null;

  const [detalle] = await pool.query(
    `SELECT dv.*, p.nombre AS nombre_producto, p.talla, p.color,
            m.nombre AS marca
     FROM DETALLE_VENTA dv
     JOIN PRODUCTO p ON dv.id_producto = p.id_producto
     JOIN MARCA    m ON p.id_marca     = m.id_marca
     WHERE dv.id_venta = ?`,
    [id]
  );

  return { ...venta[0], detalle };
}

async function createSale({ id_cliente, id_empleado, items }) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT stock, nombre FROM PRODUCTO WHERE id_producto = ? FOR UPDATE',
        [item.id_producto]
      );
      if (!rows.length) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
      if (rows[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${rows[0].nombre}" (disponible: ${rows[0].stock})`);
      }
    }

    let total = 0;
    const detalles = [];
    for (const item of items) {
      const [rows] = await conn.query('SELECT precio FROM PRODUCTO WHERE id_producto = ?', [item.id_producto]);
      const precio = parseFloat(rows[0].precio);
      const subtotal = precio * item.cantidad;
      total += subtotal;
      detalles.push({ ...item, precio_unitario: precio, subtotal });
    }

    const [ventaResult] = await conn.query(
      "INSERT INTO VENTA (id_cliente, id_empleado, total, estado) VALUES (?,?,?,'pendiente')",
      [id_cliente, id_empleado, total.toFixed(2)]
    );
    const id_venta = ventaResult.insertId;

    for (const detalle of detalles) {
      await conn.query(
        `INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?,?,?,?,?)`,
        [id_venta, detalle.id_producto, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
      );
      await conn.query('UPDATE PRODUCTO SET stock = stock - ? WHERE id_producto = ?', [
        detalle.cantidad,
        detalle.id_producto,
      ]);
    }

    await conn.query("UPDATE VENTA SET estado = 'completada' WHERE id_venta = ?", [id_venta]);
    await conn.commit();

    return { id_venta, total: total.toFixed(2) };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function cancelSale(id) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [venta] = await conn.query('SELECT * FROM VENTA WHERE id_venta = ? FOR UPDATE', [id]);
    if (!venta.length) throw new Error('Venta no encontrada');
    if (venta[0].estado === 'anulada') throw new Error('La venta ya esta anulada');

    const [detalles] = await conn.query('SELECT id_producto, cantidad FROM DETALLE_VENTA WHERE id_venta = ?', [id]);
    for (const detalle of detalles) {
      await conn.query('UPDATE PRODUCTO SET stock = stock + ? WHERE id_producto = ?', [
        detalle.cantidad,
        detalle.id_producto,
      ]);
    }

    await conn.query("UPDATE VENTA SET estado = 'anulada' WHERE id_venta = ?", [id]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getReport({ desde, hasta }) {
  const [porEmpleado] = await pool.query(
    `SELECT u.nombre AS empleado,
            COUNT(v.id_venta) AS num_ventas,
            SUM(v.total) AS total_ventas,
            AVG(v.total) AS promedio_venta
     FROM VENTA v
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     JOIN USUARIO  u ON e.id_usuario  = u.id_usuario
     WHERE v.estado = 'completada'
       AND DATE(v.fecha_venta) BETWEEN ? AND ?
     GROUP BY u.nombre
     HAVING num_ventas > 0
     ORDER BY total_ventas DESC`,
    [desde, hasta]
  );

  const [porCategoria] = await pool.query(
    `SELECT c.nombre AS categoria,
            SUM(dv.cantidad) AS unidades_vendidas,
            SUM(dv.subtotal) AS ingresos
     FROM DETALLE_VENTA dv
     JOIN VENTA    v  ON dv.id_venta    = v.id_venta
     JOIN PRODUCTO p  ON dv.id_producto = p.id_producto
     JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
     WHERE v.estado = 'completada'
       AND DATE(v.fecha_venta) BETWEEN ? AND ?
     GROUP BY c.nombre
     ORDER BY ingresos DESC`,
    [desde, hasta]
  );

  const [ultimasVentas] = await pool.query(
    `SELECT * FROM vista_ventas_detalle
     WHERE DATE(fecha_venta) BETWEEN ? AND ?
     ORDER BY fecha_venta DESC
     LIMIT 20`,
    [desde, hasta]
  );

  return { porEmpleado, porCategoria, ultimasVentas };
}

module.exports = {
  findAll,
  findById,
  createSale,
  cancelSale,
  getReport,
};
