const db = require('../config/db');

function invalid(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function idValido(value, nombre = 'id') {
  if (!['string', 'number'].includes(typeof value) || !/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) {
    throw invalid(`${nombre} debe ser un entero positivo`);
  }
  return Number(value);
}

function texto(value, campo) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 255) {
    throw invalid(`${campo} es obligatorio y admite hasta 255 caracteres`);
  }
  return value.trim();
}

function alcance(body, actual) {
  const tieneIds = Object.prototype.hasOwnProperty.call(body, 'equipo_ids');
  if (body.aplica_todos_equipos !== undefined && typeof body.aplica_todos_equipos !== 'boolean') {
    throw invalid('aplica_todos_equipos debe ser booleano');
  }
  let ids;
  if (tieneIds) {
    if (!Array.isArray(body.equipo_ids)) throw invalid('equipo_ids debe ser un arreglo de IDs');
    ids = [...new Set(body.equipo_ids.map(id => idValido(id, 'equipo_id')))];
  }
  const todos = body.aplica_todos_equipos ?? (tieneIds ? false : actual ? Boolean(actual.aplica_todos_equipos) : true);
  if (todos && ids?.length) throw invalid('No combines aplica_todos_equipos=true con equipo_ids');
  return { todos, ids };
}

async function validarEquipos(connection, ids, proceso) {
  if (!ids.length) throw invalid('Selecciona al menos un equipo o aplica el ítem a todo el proceso');
  const placeholders = ids.map(() => '?').join(',');
  const [equipos] = await connection.query(`SELECT id, proceso FROM equipos WHERE id IN (${placeholders}) FOR UPDATE`, ids);
  if (equipos.length !== ids.length) throw invalid('Uno o más equipos no existen');
  const normalizar = value => String(value).trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (equipos.some(equipo => normalizar(equipo.proceso) !== normalizar(proceso))) {
    throw invalid('Todos los equipos deben pertenecer al proceso del ítem');
  }
}

async function conEquipos(connection, items) {
  if (!items.length) return [];
  const ids = items.map(item => item.id);
  const placeholders = ids.map(() => '?').join(',');
  const [asignaciones] = await connection.query(
    `SELECT ce.checklist_item_id, e.id, e.nombre, e.codigo, e.proceso
     FROM checklist_item_equipos ce JOIN equipos e ON e.id = ce.equipo_id
     WHERE ce.checklist_item_id IN (${placeholders}) ORDER BY e.id`, ids,
  );
  const porItem = new Map();
  for (const { checklist_item_id, ...equipo } of asignaciones) {
    if (!porItem.has(checklist_item_id)) porItem.set(checklist_item_id, []);
    porItem.get(checklist_item_id).push(equipo);
  }
  return items.map(item => {
    const equipos = porItem.get(item.id) || [];
    return { ...item, aplica_todos_equipos: Boolean(item.aplica_todos_equipos), equipo_ids: equipos.map(e => e.id), equipos };
  });
}

function responderError(res, error) {
  if (!error.status) console.error('Error de checklist:', error);
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'No se pudo completar la operación de checklist' });
}

exports.getAllCheckListItems = async (req, res) => {
  try {
    const filtros = [], params = [];
    const equipoId = req.params.equipoId ?? req.query.equipo_id;
    if (equipoId !== undefined) {
      const id = idValido(equipoId, 'equipo_id');
      const [equipos] = await db.query('SELECT id, proceso FROM equipos WHERE id = ?', [id]);
      if (!equipos.length) throw invalid('Equipo no encontrado', 404);
      filtros.push('ci.proceso = ?');
      params.push(equipos[0].proceso);
      filtros.push('(ci.aplica_todos_equipos = 1 OR EXISTS (SELECT 1 FROM checklist_item_equipos ce WHERE ce.checklist_item_id = ci.id AND ce.equipo_id = ?))');
      params.push(id);
    }
    for (const campo of ['proceso', 'categoria']) {
      if (req.query[campo] !== undefined) {
        filtros.push(`ci.${campo} = ?`);
        params.push(texto(req.query[campo], campo));
      }
    }
    const [items] = await db.query(`SELECT ci.* FROM checklist_items ci${filtros.length ? ` WHERE ${filtros.join(' AND ')}` : ''} ORDER BY ci.proceso, ci.categoria, ci.nombre, ci.id`, params);
    res.json(await conEquipos(db, items));
  } catch (error) { responderError(res, error); }
};

exports.getCheckListItemById = async (req, res) => {
  try {
    const id = idValido(req.params.id);
    const [items] = await db.query('SELECT * FROM checklist_items WHERE id = ?', [id]);
    if (!items.length) throw invalid('Ítem no encontrado', 404);
    res.json((await conEquipos(db, items))[0]);
  } catch (error) { responderError(res, error); }
};

async function guardar(req, res, actualizar) {
  let connection;
  try {
    const body = req.body || {};
    const proceso = texto(body.proceso, 'proceso');
    const categoria = texto(body.categoria, 'categoria');
    const nombre = texto(body.nombre, 'nombre');
    let id = actualizar ? idValido(req.params.id) : null;
    connection = await db.getConnection();
    await connection.beginTransaction();
    let actual;
    if (actualizar) {
      const [items] = await connection.query('SELECT * FROM checklist_items WHERE id = ? FOR UPDATE', [id]);
      if (!items.length) throw invalid('Ítem no encontrado', 404);
      actual = items[0];
    }
    const scope = alcance(body, actual);
    if (!scope.todos && scope.ids === undefined) {
      const [asignaciones] = await connection.query('SELECT equipo_id FROM checklist_item_equipos WHERE checklist_item_id = ?', [id]);
      scope.ids = asignaciones.map(e => e.equipo_id);
    }
    if (!scope.todos) await validarEquipos(connection, scope.ids, proceso);
    if (actualizar) {
      await connection.query('UPDATE checklist_items SET proceso = ?, categoria = ?, nombre = ?, aplica_todos_equipos = ? WHERE id = ?', [proceso, categoria, nombre, scope.todos, id]);
    } else {
      const [result] = await connection.query('INSERT INTO checklist_items (proceso, categoria, nombre, aplica_todos_equipos) VALUES (?, ?, ?, ?)', [proceso, categoria, nombre, scope.todos]);
      id = result.insertId;
    }
    await connection.query('DELETE FROM checklist_item_equipos WHERE checklist_item_id = ?', [id]);
    if (!scope.todos) {
      for (const equipoId of scope.ids) {
        await connection.query('INSERT INTO checklist_item_equipos (checklist_item_id, equipo_id) VALUES (?, ?)', [id, equipoId]);
      }
    }
    const item = (await conEquipos(connection, [{ id, proceso, categoria, nombre, aplica_todos_equipos: scope.todos }]))[0];
    await connection.commit();
    res.status(actualizar ? 200 : 201).json(item);
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rollbackError) { console.error('No se pudo revertir la transacción de checklist:', rollbackError); }
    }
    responderError(res, error);
  } finally { if (connection) connection.release(); }
}

exports.createCheckListItem = (req, res) => guardar(req, res, false);
exports.updateCheckListItem = (req, res) => guardar(req, res, true);

exports.deleteCheckListItem = async (req, res) => {
  try {
    const id = idValido(req.params.id);
    const [result] = await db.query('DELETE FROM checklist_items WHERE id = ?', [id]);
    if (!result.affectedRows) throw invalid('Ítem no encontrado', 404);
    res.json({ message: 'Ítem eliminado correctamente' });
  } catch (error) { responderError(res, error); }
};
