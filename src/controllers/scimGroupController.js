// controllers/scimGroupController.js
// Maneja los endpoints SCIM 2.0 /Groups — necesarios cuando Entra ID asigna
// usuarios a través de grupos AD en lugar de asignación individual.
require('dotenv').config();
const ScimGroup = require('../models/ScimGroup');
const Usuario   = require('../models/Usuario');
const { Op }    = require('sequelize');

// Inicializar asociaciones si aún no están configuradas
if (!ScimGroup.associations.members) {
  ScimGroup.associate({ Usuario });
}
if (!Usuario.associations.scimGroups) {
  Usuario.associate({ ScimGroup });
}

// ── Helper: fila BD → recurso SCIM Group ─────────────────────────────────────
function toScimGroup(grupo, members, baseUrl) {
  return {
    schemas:     ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    id:          String(grupo.id),
    externalId:  grupo.externalId || undefined,
    displayName: grupo.displayName,
    members:     (members || []).map(u => ({
      value:   String(u.id),
      display: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
      $ref:    `${baseUrl}/api/scim/v2/Users/${u.id}`,
    })),
    meta: {
      resourceType: 'Group',
      created:      grupo.createdAt,
      lastModified: grupo.updatedAt,
      location:     `${baseUrl}/api/scim/v2/Groups/${grupo.id}`,
    },
  };
}

// ── GET /scim/v2/Groups ───────────────────────────────────────────────────────
// Entra ID consulta esto para saber si el grupo ya existe antes de crearlo
exports.listarGrupos = async (req, res) => {
  try {
    const baseUrl    = `${req.protocol}://${req.get('host')}`;
    const startIndex = parseInt(req.query.startIndex, 10) || 1;
    const count      = Math.min(parseInt(req.query.count, 10) || 100, 200);
    const filter     = req.query.filter || '';

    let where = {};
    const matchDisplay  = filter.match(/displayName eq "([^"]+)"/i);
    const matchExternal = filter.match(/externalId eq "([^"]+)"/i);
    if (matchDisplay)  where.displayName = matchDisplay[1];
    if (matchExternal) where.externalId  = matchExternal[1];

    const { count: total, rows } = await ScimGroup.findAndCountAll({
      where,
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
      offset: startIndex - 1,
      limit:  count,
      order:  [['id', 'ASC']],
      distinct: true,
    });

    res.status(200).json({
      schemas:      ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: total,
      startIndex,
      itemsPerPage: count,
      Resources:    rows.map(g => toScimGroup(g, g.members, baseUrl)),
    });
  } catch (err) {
    console.error('SCIM listarGrupos:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── GET /scim/v2/Groups/:id ───────────────────────────────────────────────────
exports.obtenerGrupo = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const grupo   = await ScimGroup.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    if (!grupo) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Grupo no encontrado',
    });

    res.status(200).json(toScimGroup(grupo, grupo.members, baseUrl));
  } catch (err) {
    console.error('SCIM obtenerGrupo:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── POST /scim/v2/Groups ──────────────────────────────────────────────────────
// Entra ID crea el grupo primero, luego agrega miembros con PATCH
exports.crearGrupo = async (req, res) => {
  try {
    const baseUrl     = `${req.protocol}://${req.get('host')}`;
    const displayName = req.body.displayName;
    const externalId  = req.body.externalId || null;

    if (!displayName) return res.status(400).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '400',
      detail:  'displayName es requerido',
    });

    // Idempotencia: si ya existe devolver el existente con 200
    const condiciones = [{ displayName }];
    if (externalId) condiciones.push({ externalId });

    const existente = await ScimGroup.findOne({
      where: { [Op.or]: condiciones },
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    if (existente) {
      // Actualizar externalId si llegó sin él antes
      if (externalId && !existente.externalId) {
        await existente.update({ externalId });
      }
      return res.status(200).json(toScimGroup(existente, existente.members, baseUrl));
    }

    // Crear grupo nuevo
    const nuevoGrupo = await ScimGroup.create({ displayName, externalId });

    // Si el payload trae miembros iniciales, agregarlos
    const membersPayload = req.body.members || [];
    if (membersPayload.length > 0) {
      const userIds = membersPayload.map(m => parseInt(m.value, 10)).filter(Boolean);
      const usuarios = await Usuario.findAll({ where: { id: { [Op.in]: userIds } } });
      await nuevoGrupo.setMembers(usuarios);
    }

    // Recargar con miembros para la respuesta
    await nuevoGrupo.reload({
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    res.status(201).json(toScimGroup(nuevoGrupo, nuevoGrupo.members, baseUrl));
  } catch (err) {
    console.error('SCIM crearGrupo:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── PUT /scim/v2/Groups/:id ───────────────────────────────────────────────────
// Reemplazo completo del grupo y su lista de miembros
exports.reemplazarGrupo = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const grupo   = await ScimGroup.findByPk(req.params.id);

    if (!grupo) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Grupo no encontrado',
    });

    await grupo.update({
      displayName: req.body.displayName || grupo.displayName,
      externalId:  req.body.externalId  || grupo.externalId,
    });

    // Reemplazar miembros completos
    const membersPayload = req.body.members || [];
    const userIds = membersPayload.map(m => parseInt(m.value, 10)).filter(Boolean);
    const usuarios = userIds.length > 0
      ? await Usuario.findAll({ where: { id: { [Op.in]: userIds } } })
      : [];
    await grupo.setMembers(usuarios);

    await grupo.reload({
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    res.status(200).json(toScimGroup(grupo, grupo.members, baseUrl));
  } catch (err) {
    console.error('SCIM reemplazarGrupo:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── PATCH /scim/v2/Groups/:id ─────────────────────────────────────────────────
// El más usado: Entra ID agrega/quita miembros cuando se asignan/quitan usuarios del grupo
// Formatos que envía Entra ID:
//   add members:    { op: "add",    path: "members", value: [{ value: "42" }] }
//   remove member:  { op: "remove", path: "members[value eq \"42\"]" }
//   remove all:     { op: "remove", path: "members" }
//   rename group:   { op: "replace", path: "displayName", value: "Nuevo nombre" }
exports.actualizarGrupo = async (req, res) => {
  try {
    const baseUrl    = `${req.protocol}://${req.get('host')}`;
    const grupo      = await ScimGroup.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    if (!grupo) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Grupo no encontrado',
    });

    const operations = req.body.Operations || [];

    for (const op of operations) {
      const tipo  = (op.op || '').toLowerCase();
      const path  = op.path || '';
      const value = op.value;

      // ── Agregar miembros ───────────────────────────────────────────────
      if (tipo === 'add' && path === 'members') {
        const values = Array.isArray(value) ? value : [value];
        const userIds = values.map(m => parseInt(m.value, 10)).filter(Boolean);
        if (userIds.length > 0) {
          const usuarios = await Usuario.findAll({ where: { id: { [Op.in]: userIds } } });
          await grupo.addMembers(usuarios);
        }
      }

      // ── Quitar un miembro específico: path = "members[value eq \"42\"]" ──
      if (tipo === 'remove' && path.startsWith('members[')) {
        const matchId = path.match(/members\[value eq "(\d+)"\]/i);
        if (matchId) {
          const userId  = parseInt(matchId[1], 10);
          const usuario = await Usuario.findByPk(userId);
          if (usuario) await grupo.removeMembers([usuario]);
        }
      }

      // ── Quitar todos los miembros ─────────────────────────────────────
      if (tipo === 'remove' && path === 'members') {
        await grupo.setMembers([]);
      }

      // ── Renombrar grupo ───────────────────────────────────────────────
      if (tipo === 'replace' && path === 'displayName') {
        await grupo.update({ displayName: value });
      }

      // ── PATCH sin path: objeto completo ──────────────────────────────
      if (tipo === 'replace' && !path && typeof value === 'object') {
        if (value.displayName) await grupo.update({ displayName: value.displayName });
      }
    }

    await grupo.reload({
      include: [{ model: Usuario, as: 'members', attributes: ['id', 'nombres', 'apellidos'] }],
    });

    res.status(200).json(toScimGroup(grupo, grupo.members, baseUrl));
  } catch (err) {
    console.error('SCIM actualizarGrupo:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── DELETE /scim/v2/Groups/:id ────────────────────────────────────────────────
// Elimina el grupo y sus membresías (CASCADE). Los usuarios NO se eliminan.
exports.eliminarGrupo = async (req, res) => {
  try {
    const grupo = await ScimGroup.findByPk(req.params.id);

    if (!grupo) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Grupo no encontrado',
    });

    // setMembers([]) para limpiar la join table antes de destruir
    await grupo.setMembers([]);
    await grupo.destroy();

    res.status(204).send();
  } catch (err) {
    console.error('SCIM eliminarGrupo:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};
