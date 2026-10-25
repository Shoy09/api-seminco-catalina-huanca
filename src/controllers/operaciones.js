const { confirmClosedTransfer, lookupSync } = require('../services/closedTransfer');
const { createOperation, updateValues, updateOperation } = require('../services/operationSyncIdentity');
const modelos = require('../models/indexOperaciones');
const { Op } = require('sequelize');

function obtenerModelo(tipo) {
  const modelo = modelos[tipo];
  if (!modelo) throw new Error('Tipo de operación inválido');
  return modelo;
}

module.exports = {
  async lookupSync(req, res) {
    try {
      const { tipo, payload, hash } = req.body;
      const result = await lookupSync(obtenerModelo(tipo), tipo, payload, hash);
      return res.json({ ok: true, data: result });
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }
  },
  async confirmClosedTransfer(req, res) {
    try {
      const { tipo, payload, hash } = req.body;
      const Model = obtenerModelo(tipo);
      const result = await confirmClosedTransfer(Model, tipo, payload, hash);
      return res.json({ ok: true, data: result });
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }
  },
  // Flutter verifica la API desplegada y los índices en su BD real.
  async syncCapabilities(req, res) {
    res.set('Cache-Control', 'no-store');
    try {
      for (const Model of Object.values(modelos)) {
        const indexes = await Model.sequelize.getQueryInterface().showIndex(Model.getTableName());
        const safe = indexes.some(index => index.unique && index.fields.length === 1 &&
          index.fields[0].attribute === 'sync_uuid');
        if (!safe) return res.status(503).json({ ok: false, sync_uuid_version: 0 });
      }
      return res.json({ ok: true, sync_uuid_version: 1, closed_transfer_version: 1, active_close_transfer_version: 1, lookup_sync_version: 1 });
    } catch (_) {
      return res.status(503).json({ ok: false, sync_uuid_version: 0 });
    }
  },

  // ✅ CREAR (uno o varios)
  async crear(req, res) {
    try {
      const { tipo, data } = req.body;
      const Modelo = obtenerModelo(tipo);
      if (!data || typeof data !== 'object' ||
          (Array.isArray(data) && data.length === 0)) {
        return res.status(400).json({ ok: false, error: 'Data debe contener operaciones' });
      }
      if (!Array.isArray(data)) {
        const result = await createOperation(Modelo, data, tipo);
        return res.json({ ok: true, data: result });
      }
      const resultados = [];
      for (const item of data) {
        try {
          resultados.push(await createOperation(Modelo, item, tipo));
        } catch (error) {
          resultados.push({
            local_id: item?.local_id ?? null, server_id: null,
            creado: false, error: error.message,
          });
        }
      }
      return res.json({ ok: true, data: resultados });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  },

async obtener(req, res) {
  try {
    const { tipo } = req.params;
    const { estado, envio } = req.query;

    const Modelo = obtenerModelo(tipo);

    let where = {};
    if (estado) where.estado = estado;
    if (envio) where.envio = envio;

    const data = await Modelo.findAll({
      where,
      order: [['id', 'DESC']]
    });

    const camposModelo = Object.keys(Modelo.rawAttributes);

    const dataFormateada = data.map(item => {
      const obj = item.toJSON();
      const resultado = {};

      camposModelo.forEach(campo => {
        let valor = obj[campo];

        if (typeof valor === 'string') {
          try {
            const parsed = JSON.parse(valor);
            if (typeof parsed === 'object') {
              valor = parsed;
            }
          } catch (_) {}
        }

        resultado[campo] = valor;
      });

      return resultado;
    });

    res.json({ ok: true, data: dataFormateada });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
},

async obtenerPorAprobacion(req, res) {
  try {
    const { tipo } = req.params;
    const { estado, envio } = req.query;

    const Modelo = obtenerModelo(tipo);

    let where = {};

    if (estado) where.estado = estado;
    if (envio) where.envio = envio;

    /// 🔥 FILTRO DE APROBACIÓN
    where.aprobacion = {
      [Op.in]: [0, 1]
    };

    const data = await Modelo.findAll({
      where,
      order: [['id', 'DESC']]
    });

    const camposModelo = Object.keys(Modelo.rawAttributes);

    const dataFormateada = data.map(item => {
      const obj = item.toJSON();
      const resultado = {};

      camposModelo.forEach(campo => {
        let valor = obj[campo];

        if (typeof valor === 'string') {
          try {
            const parsed = JSON.parse(valor);
            if (typeof parsed === 'object') {
              valor = parsed;
            }
          } catch (_) {}
        }

        resultado[campo] = valor;
      });

      return resultado;
    });

    res.json({ ok: true, data: dataFormateada });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
},

// ✅ GET HORÓMETROS (último por cada operación - SECUENCIAL)
async obtenerUltimosHorometros(req, res) {
  try {

    const resultado = {};

    for (const [tipo, Modelo] of Object.entries(modelos)) {

      // 🔥 traer SOLO el campo necesario (más ligero)
      const ultimo = await Modelo.findOne({
        attributes: ['horometros'],
        order: [['id', 'DESC']]
      });

      if (!ultimo) {
        resultado[tipo] = null;
        continue;
      }

      let horometros = ultimo.get('horometros');

      // 🔥 parse seguro
      if (typeof horometros === 'string') {
        try {
          const parsed = JSON.parse(horometros);
          if (parsed && typeof parsed === 'object') {
            horometros = parsed;
          }
        } catch (_) {
          // si falla, se queda como string
        }
      }

      resultado[tipo] = horometros;
    }

    res.json({
      ok: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en obtenerUltimosHorometros:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
},
// ✅ GET por jefe_guardia
async obtenerPorJefe(req, res) {
  try {
    const { tipo } = req.params;
    const { jefe_guardia, limit = 50, offset = 0 } = req.query;

    if (!jefe_guardia) {
      return res.status(400).json({
        ok: false,
        error: 'Debe enviar el jefe_guardia'
      });
    }

    const Modelo = obtenerModelo(tipo);

    const data = await Modelo.findAll({
      where: { jefe_guardia },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    // 🔥 reutilizamos tu lógica de parseo
    const camposModelo = Object.keys(Modelo.rawAttributes);

    const dataFormateada = data.map(item => {
      const obj = item.toJSON();
      const resultado = {};

      camposModelo.forEach(campo => {
        let valor = obj[campo];

        if (typeof valor === 'string') {
          try {
            const parsed = JSON.parse(valor);
            if (typeof parsed === 'object') {
              valor = parsed;
            }
          } catch (_) {}
        }

        resultado[campo] = valor;
      });

      return resultado;
    });

    res.json({ ok: true, data: dataFormateada });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
},

// ✅ GET por ID (detalle)
async obtenerPorId(req, res) {
  try {
    const { tipo, id } = req.params;

    const Modelo = obtenerModelo(tipo);

    const item = await Modelo.findByPk(id);

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: 'Registro no encontrado'
      });
    }

    const obj = item.toJSON();

    // 🔥 parse igual que en los otros métodos
    const resultado = {};
    const camposModelo = Object.keys(Modelo.rawAttributes);

    camposModelo.forEach(campo => {
      let valor = obj[campo];

      if (typeof valor === 'string') {
        try {
          const parsed = JSON.parse(valor);
          if (typeof parsed === 'object') {
            valor = parsed;
          }
        } catch (_) {}
      }

      resultado[campo] = valor;
    });

    res.json({
      ok: true,
      data: resultado
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
},

  // ✅ UPDATE (uno o varios)
 async actualizar(req, res) {
  try {
    const { tipo, id } = req.params;
    const Modelo = obtenerModelo(tipo);
    const result = await updateOperation(Modelo, tipo, id, req.body);
    const registroActualizado = result.record;
    res.json({
      ok: true,
      data: registroActualizado, cloud_hash: result.cloud_hash
    });

  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message
    });
  }
},

  // =========================================
  // ACTUALIZAR MASIVO
  // =========================================
async actualizarMasivo(req, res) {

  try {

    const { tipo, data } = req.body;

    const Modelo = obtenerModelo(tipo);

    if (!Array.isArray(data)) {

      return res.status(400).json({
        ok: false,
        error: 'Data debe ser un array'
      });

    }

    const resultados = [];

    for (const item of data) {

      try {

        const id = item.idNube;

        if (!id) {

          resultados.push({
            idNube: null,
            actualizado: false,
            error: 'idNube requerido'
          });

          continue;
        }

        // 🔥 quitar idNube antes de actualizar
        const result = await updateOperation(Modelo, tipo, id, item);

        resultados.push({
          idNube: id,
          actualizado: true, cloud_hash: result.cloud_hash
        });

      } catch (errorItem) {

        resultados.push({
          idNube: item.idNube ?? null,
          actualizado: false,
          error: errorItem.message
        });

      }

    }

    res.json({
      ok: true,
      data: resultados
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}

};
