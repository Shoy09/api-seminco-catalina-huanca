const modelos = require('../models/indexOperaciones');
const { Op } = require('sequelize');

function obtenerModelo(tipo) {
  const modelo = modelos[tipo];
  if (!modelo) throw new Error('Tipo de operación inválido');
  return modelo;
}

module.exports = {

  // ✅ CREAR (uno o varios)
  async crear(req, res) {
    try {
      const { tipo, data } = req.body;
      const Modelo = obtenerModelo(tipo);

      let resultado;

      if (Array.isArray(data)) {
        // múltiples registros
        resultado = await Modelo.bulkCreate(data);
      } else {
        // un solo registro
        resultado = await Modelo.create(data);
      }

      res.json({ ok: true, data: resultado });

    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // ✅ GET (con filtros)
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
    const data = req.body;

    const Modelo = obtenerModelo(tipo);

    const [updated] = await Modelo.update(data, {
      where: { id }
    });

    if (updated === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Registro no encontrado'
      });
    }

    // 🔥 devolver el registro actualizado
    const registroActualizado = await Modelo.findByPk(id);

    res.json({
      ok: true,
      data: registroActualizado
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

};