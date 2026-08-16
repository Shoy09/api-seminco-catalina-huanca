// controllers/scimController.js
require('dotenv').config();
const Usuario  = require('../models/Usuario');
const ScimLog  = require('../models/ScimLog');
const { Op }   = require('sequelize');
const config   = require('../config/Enter_ID/entraId'); // ← mismo path que authController

// ── Auth middleware ───────────────────────────────────────────────────────────
exports.verificarScimToken = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!config.scim.bearerToken || token !== config.scim.bearerToken) {
    return res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '401',
      detail:  'Token de autorización SCIM inválido',
    });
  }
  next();
};

// ── Helper: fila BD → recurso SCIM ───────────────────────────────────────────
function toScim(u, baseUrl) {
  return {
    schemas:    ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id:         String(u.id),
    externalId: u.entra_oid,
    userName:   u.correo,
    name: {
      givenName:  u.nombres  || '',
      familyName: u.apellidos || '',
      formatted:  `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
    },
    emails:  [{ value: u.correo, primary: true, type: 'work' }],
    active:  u.activo === 1,
    meta: {
      resourceType: 'User',
      created:      u.createdAt,
      lastModified: u.updatedAt,
      location:     `${baseUrl}/api/scim/v2/Users/${u.id}`,
    },
  };
}

// ── Helper: SCIM body → campos de tu tabla ─────────────────────────────────
// NUNCA toca: cargo, rol, area, firma, codigo_dni, operaciones_autorizadas
function fromScim(body) {
  return {
    entra_oid: body.externalId                    || null,
    correo:    body.userName || body.emails?.[0]?.value || null,
    // Fallback a 'Sin nombre' para respetar allowNull:false del modelo
    nombres:   body.name?.givenName  || 'Sin nombre',
    apellidos: body.name?.familyName || 'Sin apellido',
    activo:    body.active !== false ? 1 : 0,
  };
}

// ── GET /scim/v2/ServiceProviderConfig ────────────────────────────────────────
// EntraID llama esto primero en el Test Connection
exports.serviceProviderConfig = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    schemas:        ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
    patch:          { supported: true },
    bulk:           { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter:         { supported: true, maxResults: 200 },
    changePassword: { supported: false },
    sort:           { supported: false },
    etag:           { supported: false },
    authenticationSchemes: [{
      type:        'oauthbearertoken',
      name:        'OAuth Bearer Token',
      description: 'Bearer token requerido para todas las operaciones SCIM',
      primary:     true,
    }],
    // Tipos de recursos soportados — Entra ID usa esto para saber qué sincronizar
    resourceTypes: [
      {
        schemas:   ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id:        'User',
        name:      'User',
        endpoint:  '/Users',
        schema:    'urn:ietf:params:scim:schemas:core:2.0:User',
        meta: { resourceType: 'ResourceType', location: `${baseUrl}/api/scim/v2/ResourceTypes/User` },
      },
      {
        schemas:   ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id:        'Group',
        name:      'Group',
        endpoint:  '/Groups',
        schema:    'urn:ietf:params:scim:schemas:core:2.0:Group',
        meta: { resourceType: 'ResourceType', location: `${baseUrl}/api/scim/v2/ResourceTypes/Group` },
      },
    ],
    meta: {
      resourceType: 'ServiceProviderConfig',
      location:     `${baseUrl}/api/scim/v2/ServiceProviderConfig`,
    },
  });
};

// ── GET /scim/v2/Users ────────────────────────────────────────────────────────
// EntraID filtra por userName o externalId antes de crear para evitar duplicados
exports.listarUsuarios = async (req, res) => {
  try {
    const baseUrl    = `${req.protocol}://${req.get('host')}`;
    const startIndex = parseInt(req.query.startIndex, 10) || 1;
    const count      = Math.min(parseInt(req.query.count, 10) || 100, 200);
    const filter     = req.query.filter || '';

    let where = {};
    const matchUser     = filter.match(/userName eq "([^"]+)"/i);
    const matchExternal = filter.match(/externalId eq "([^"]+)"/i);
    const matchActive   = filter.match(/active eq (true|false)/i);
    if (matchUser)     where.correo    = matchUser[1];
    if (matchExternal) where.entra_oid = matchExternal[1];
    if (matchActive)   where.activo    = matchActive[1].toLowerCase() === 'true' ? 1 : 0;

    const { count: total, rows } = await Usuario.findAndCountAll({
      where,
      offset: startIndex - 1,
      limit:  count,
      order:  [['id', 'ASC']],
    });

    res.status(200).json({
      schemas:      ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: total,
      startIndex,
      itemsPerPage: count,
      Resources:    rows.map(u => toScim(u, baseUrl)),
    });
  } catch (err) {
    console.error('SCIM listarUsuarios:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── GET /scim/v2/Users/:id ────────────────────────────────────────────────────
exports.obtenerUsuario = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Usuario no encontrado',
    });

    res.status(200).json(toScim(usuario, baseUrl));
  } catch (err) {
    console.error('SCIM obtenerUsuario:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── POST /scim/v2/Users ───────────────────────────────────────────────────────
// EntraID llama esto cuando asigna un usuario a la Enterprise App
exports.crearUsuario = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const datos   = fromScim(req.body);

    if (!datos.correo) return res.status(400).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '400',
      detail:  'userName (correo) es requerido',
    });

    // ── Idempotencia correcta para EntraID ───────────────────────────────
    // Si ya existe, devolver el recurso existente con 200 (no 409)
    // EntraID hace GET primero, pero por seguridad lo manejamos aquí también
    const condiciones = [{ correo: datos.correo }];
    if (datos.entra_oid) condiciones.push({ entra_oid: datos.entra_oid });

    const existente = await Usuario.findOne({ where: { [Op.or]: condiciones } });

    if (existente) {
      // Actualizar entra_oid si llegó sin él antes
      if (datos.entra_oid && !existente.entra_oid) {
        await existente.update({ entra_oid: datos.entra_oid, activo: datos.activo });
      }
      return res.status(200).json(toScim(existente, baseUrl));
    }

    // ── Crear usuario nuevo ───────────────────────────────────────────────
    // Solo campos que SCIM conoce — campos de negocio quedan null
    // Un admin los completará luego en SEMINCO
    const nuevo = await Usuario.create({
      entra_oid:              datos.entra_oid,
      correo:                 datos.correo,
      nombres:                datos.nombres,
      apellidos:              datos.apellidos,
      activo:                 datos.activo,
      password:               null,
      codigo_dni:             null,
      cargo:                  null,
      rol:                    null,
      area:                   null,
      clasificacion:          null,
      empresa:                null,
      guardia:                null,
      autorizado_equipo:      null,
      firma:                  null,
      operaciones_autorizadas: {},
    });

    res.status(201).json(toScim(nuevo, baseUrl));
  } catch (err) {
    console.error('SCIM crearUsuario:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── PUT /scim/v2/Users/:id ────────────────────────────────────────────────────
// Reemplazo completo — EntraID lo usa ocasionalmente
exports.reemplazarUsuario = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Usuario no encontrado',
    });

    const datos = fromScim(req.body);

    // Solo actualizar campos SCIM — NUNCA tocar campos de negocio
    await usuario.update({
      entra_oid: datos.entra_oid || usuario.entra_oid,
      correo:    datos.correo    || usuario.correo,
      nombres:   datos.nombres,
      apellidos: datos.apellidos,
      activo:    datos.activo,
    });

    res.status(200).json(toScim(usuario, baseUrl));
  } catch (err) {
    console.error('SCIM reemplazarUsuario:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── PATCH /scim/v2/Users/:id ──────────────────────────────────────────────────
// El más frecuente: EntraID desactiva usuarios con { op: replace, path: active, value: false }
exports.actualizarUsuario = async (req, res) => {
  try {
    const baseUrl    = `${req.protocol}://${req.get('host')}`;
    const usuario    = await Usuario.findByPk(req.params.id);

    if (!usuario) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Usuario no encontrado',
    });

    const operations = req.body.Operations || [];
    const cambios    = {};

    for (const op of operations) {
      const tipo  = (op.op || '').toLowerCase();
      const path  = op.path;
      const value = op.value;

      if (tipo === 'replace') {
        // Caso más común: desactivar usuario
        if (path === 'active') {
          cambios.activo = value ? 1 : 0;
        }
        // Actualización de campos básicos — path como string directo
        if (path === 'userName')                     cambios.correo    = value;
        if (path === 'name.givenName')               cambios.nombres   = value || 'Sin nombre';
        if (path === 'name.familyName')              cambios.apellidos = value || 'Sin apellido';
        if (path === 'emails[type eq "work"].value') cambios.correo    = value;

        // PATCH con path: "name" y value como objeto { givenName, familyName }
        // EntraID usa este formato según la versión del conector
        if (path === 'name' && typeof value === 'object' && value !== null) {
          if (value.givenName  !== undefined) cambios.nombres   = value.givenName  || 'Sin nombre';
          if (value.familyName !== undefined) cambios.apellidos = value.familyName || 'Sin apellido';
          if (value.formatted  !== undefined && !value.givenName && !value.familyName) {
            // formatted solo si no vinieron los campos individuales
            cambios.nombres = value.formatted || 'Sin nombre';
          }
        }

        // PATCH sin path: objeto completo (EntraID lo hace a veces)
        if (!path && typeof value === 'object') {
          const d = fromScim(value);
          // Solo mergear campos SCIM, nunca campos de negocio
          if (d.correo)    cambios.correo    = d.correo;
          if (d.nombres)   cambios.nombres   = d.nombres;
          if (d.apellidos) cambios.apellidos = d.apellidos;
          if (d.entra_oid) cambios.entra_oid = d.entra_oid;
          cambios.activo = d.activo;
        }
      }

      // EntraID también puede usar 'add' para activar usuarios
      if (tipo === 'add' && path === 'active') {
        cambios.activo = value ? 1 : 0;
      }

      // Operación remove — limpiar campos SCIM (nunca campos de negocio)
      if (tipo === 'remove') {
        if (path === 'active')                               cambios.activo    = 0;
        if (path === 'userName')                             cambios.correo    = null;
        if (path === 'name.givenName')                       cambios.nombres   = 'Sin nombre';
        if (path === 'name.familyName')                      cambios.apellidos = 'Sin apellido';
        if (path === 'emails' || path === 'emails[type eq "work"].value') cambios.correo = null;
        if (path === 'externalId')                           cambios.entra_oid = null;
      }
    }

    if (Object.keys(cambios).length > 0) {
      await usuario.update(cambios);
    }

    // Recargar desde BD para devolver datos frescos
    await usuario.reload();
    res.status(200).json(toScim(usuario, baseUrl));
  } catch (err) {
    console.error('SCIM actualizarUsuario:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── DELETE /scim/v2/Users/:id ─────────────────────────────────────────────────
// Soft delete: desactivar en lugar de borrar para preservar historial
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '404',
      detail:  'Usuario no encontrado',
    });

    await usuario.update({ activo: 0 });
    res.status(204).send();
  } catch (err) {
    console.error('SCIM eliminarUsuario:', err.message);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status:  '500',
      detail:  err.message,
    });
  }
};

// ── GET /scim/logs ────────────────────────────────────────────────────────────
// Panel de consulta de logs — protegido con el mismo Bearer token SCIM
exports.consultarLogs = async (req, res) => {
  try {
    const limit      = Math.min(parseInt(req.query.limit,  10) || 50, 200);
    const offset     = parseInt(req.query.offset, 10) || 0;
    const soloErrores = req.query.errors === 'true';

    const where = soloErrores ? { status_code: { [Op.gte]: 400 } } : {};

    const { count, rows } = await ScimLog.findAndCountAll({
      where,
      order:  [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      total:  count,
      limit,
      offset,
      logs:   rows.map(l => ({
        id:           l.id,
        fecha:        l.createdAt,
        method:       l.method,
        endpoint:     l.endpoint,
        status:       l.status_code,
        ip:           l.ip,
        error:        l.error || null,
        request_body: l.request_body  ? JSON.parse(l.request_body)  : null,
        response:     l.response_body ? JSON.parse(l.response_body) : null,
      })),
    });
  } catch (err) {
    console.error('SCIM consultarLogs:', err.message);
    res.status(500).json({ error: err.message });
  }
};