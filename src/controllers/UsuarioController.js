const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const verificarToken = require('../middleware/auth');
const upload = require('../config/upload');
const Usuario = require("../models/Usuario");
const { Op } = require('sequelize');

exports.obtenerUsuarios = [verificarToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuarios');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error.message);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
}];

exports.obtenerOperadores = [
  verificarToken,
  async (req, res) => {
    try {
      const cargos = [
        'Op. Robot',
        'Op. Bolter',
        'Op. Mixer',
        'Ayudante'
      ];

      const usuarios = await Usuario.findAll({
        attributes: ['apellidos', 'nombres', 'cargo'], // ✅ AGREGADO cargo
        where: {
          cargo: {
            [Op.in]: cargos
          }
        },
        order: [['apellidos', 'ASC']]
      });

      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al obtener operadores:', error);
      res.status(500).json({ error: 'Error al obtener operadores' });
    }
  }
];



exports.obtenerUsuarioPorId = [verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener los datos:', error.message);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
}];

exports.crearUsuario = [
    verificarToken,
    upload.single('firma'),
    async (req, res) => {
        try {
            const {
                codigo_dni, apellidos, nombres, cargo = null, rol = null, area = null,
                clasificacion = null, empresa = null, guardia = null,
                autorizado_equipo = null, correo = null, password,
                operaciones_autorizadas = "{}"
            } = req.body;

            console.log('🧾 operaciones_autorizadas:', operaciones_autorizadas);
            console.log('📂 Tipo de operaciones_autorizadas:', typeof operaciones_autorizadas);

            const firma = req.file ? req.file.path : null;

            const [existingUser] = await db.query('SELECT * FROM usuarios WHERE codigo_dni = ?', [codigo_dni]);
            if (existingUser.length > 0) return res.status(400).json({ error: 'El usuario ya existe con este DNI' });

            if (correo) {
                const [existingEmail] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
                if (existingEmail.length > 0) return res.status(400).json({ error: 'El correo ya está en uso' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Aseguramos que se convierte en string solo si no lo es ya
            let operacionesStr;
            if (typeof operaciones_autorizadas === 'string') {
                operacionesStr = JSON.stringify(JSON.parse(operaciones_autorizadas));
            } else if (typeof operaciones_autorizadas === 'object') {
                operacionesStr = JSON.stringify(operaciones_autorizadas);
            } else {
                operacionesStr = '{}';
            }

            await db.query(
                `INSERT INTO usuarios 
                (codigo_dni, apellidos, nombres, cargo, rol, area, clasificacion, empresa, guardia, autorizado_equipo, correo, password, firma, operaciones_autorizadas, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    codigo_dni, apellidos, nombres, cargo, rol, area, clasificacion,
                    empresa, guardia, autorizado_equipo, correo, hashedPassword, firma,
                    operacionesStr
                ]
            );

            res.status(201).json({ message: 'Usuario creado exitosamente', firma });
        } catch (error) {
            console.error('❌ Error al crear el usuario:', error);
            res.status(500).json({ error: 'Error al crear el usuario', details: error.message });
        }
    }
];

exports.crearUsuariosBulk = [
  verificarToken,
  async (req, res) => {
    try {
      const usuarios = req.body.usuarios;

      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        return res.status(400).json({ error: 'No hay usuarios para procesar' });
      }

      const valores = [];
      const errores = [];
      const dnisProcesados = new Set();

      for (const [index, u] of usuarios.entries()) {
        try {
          let {
            codigo_dni, apellidos, nombres, cargo = null, rol = 'Trabajador',
            area = null, clasificacion = null, empresa = null,
            guardia = null, autorizado_equipo = null,
            correo = null, password, operaciones_autorizadas = {}
          } = u;

          // 🔧 NORMALIZAR DATOS
          codigo_dni = String(codigo_dni || '').trim();
          apellidos = apellidos?.trim();
          nombres = nombres?.trim();
          cargo = cargo?.trim() || null;
          rol = rol?.trim() || 'Trabajador';
          area = area?.trim() || null;
          clasificacion = clasificacion?.trim() || null;
          correo = correo?.trim() || null;

          // 🔒 PASSWORD seguro
          const passwordStr = String(password || '').trim();

          // ❌ VALIDACIONES
          if (!codigo_dni || !apellidos || !nombres || !cargo || !area || !passwordStr) {
            errores.push({
              fila: index + 1,
              dni: codigo_dni || 'Sin DNI',
              motivo: 'Campos obligatorios incompletos'
            });
            continue;
          }

          // ❌ DNI duplicado en el mismo archivo
          if (dnisProcesados.has(codigo_dni)) {
            errores.push({
              fila: index + 1,
              dni: codigo_dni,
              motivo: 'DNI duplicado en el archivo'
            });
            continue;
          }

          dnisProcesados.add(codigo_dni);

          // 🔐 HASH PASSWORD
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(passwordStr, salt);

          // 🔄 OPERACIONES
          const operacionesStr = JSON.stringify(operaciones_autorizadas || {});

          valores.push([
            codigo_dni,
            apellidos,
            nombres,
            cargo,
            rol,
            area,
            clasificacion,
            empresa,
            guardia,
            autorizado_equipo,
            correo,
            hashedPassword,
            null, // firma
            operacionesStr,
            new Date(),
            new Date()
          ]);

        } catch (err) {
          errores.push({
            fila: index + 1,
            dni: u.codigo_dni || 'Sin DNI',
            motivo: err.message || 'Error procesando usuario'
          });
        }
      }

      // ❌ Si no hay válidos
      if (valores.length === 0) {
        return res.status(400).json({
          error: 'No hay usuarios válidos',
          errores
        });
      }

      // 🚀 INSERT MASIVO
      await db.query(
        `INSERT INTO usuarios 
        (codigo_dni, apellidos, nombres, cargo, rol, area, clasificacion, empresa, guardia, autorizado_equipo, correo, password, firma, operaciones_autorizadas, createdAt, updatedAt) 
        VALUES ?`,
        [valores]
      );

      // ✅ RESPUESTA DETALLADA
      res.status(201).json({
        message: 'Carga masiva completada',
        totalRecibidos: usuarios.length,
        insertados: valores.length,
        errores
      });

    } catch (error) {
      console.error('❌ Error bulk:', error);
      res.status(500).json({
        error: 'Error en carga masiva',
        details: error.message
      });
    }
  }
];


exports.actualizarUsuario = [
    verificarToken,
    upload.single('firma'),
    async (req, res) => {
        const { id } = req.params;
        const {
            codigo_dni, apellidos, nombres, cargo, empresa, rol,
            guardia, autorizado_equipo, correo, password, operaciones_autorizadas
        } = req.body;

        const firma = req.file ? req.file.path : null;

        try {
            const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

            if (rol && !['admin', 'user', 'supervisor'].includes(rol)) {
                return res.status(400).json({ error: 'Rol no válido. Los valores permitidos son: admin, user, supervisor' });
            }

            let query = `UPDATE usuarios SET codigo_dni = ?, apellidos = ?, nombres = ?, cargo = ?, rol = ?, empresa = ?, guardia = ?, autorizado_equipo = ?, correo = ?, updatedAt = NOW()`;
            const queryParams = [codigo_dni, apellidos, nombres, cargo, rol, empresa, guardia, autorizado_equipo, correo];

            if (firma) {
                if (rows[0].firma) {
                    const firmaUrl = rows[0].firma;
                    const publicId = firmaUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`firmas/${publicId}`);
                }

                query += `, firma = ?`;
                queryParams.push(firma);
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                query += `, password = ?`;
                queryParams.push(hashedPassword);
            }

            if (operaciones_autorizadas) {
                query += `, operaciones_autorizadas = ?`;
                queryParams.push(JSON.stringify(JSON.parse(operaciones_autorizadas)));
            }

            query += ` WHERE id = ?`;
            queryParams.push(id);

            await db.query(query, queryParams);

            res.status(200).json({ message: 'Usuario actualizado exitosamente', firma });
        } catch (error) {
            console.error('Error al actualizar el usuario:', error.message);
            res.status(500).json({ error: 'Error al actualizar el usuario' });
        }
    }
];


exports.eliminarUsuario = [verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        // **Eliminar firma en Cloudinary**
        if (rows[0].firma) {
            const firmaUrl = rows[0].firma;
            const publicId = firmaUrl.split('/').pop().split('.')[0]; // Obtener el public_id de Cloudinary
            await cloudinary.uploader.destroy(`firmas/${publicId}`);
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error.message);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
}];


exports.obtenerPerfil = [
    verificarToken,
    async (req, res) => {
        try {
            const { id } = req.user;

            const [rows] = await db.query(
                `SELECT id, codigo_dni, apellidos, nombres, cargo, empresa, guardia,
                autorizado_equipo, correo, firma, rol, operaciones_autorizadas
                FROM usuarios WHERE id = ?`,
                [id]
            );

            if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error al obtener perfil del usuario:', error.message);
            res.status(500).json({ error: 'Error al obtener perfil del usuario' });
        }
    }
];

exports.obtenerUsuarioPorId = [
    verificarToken,
    async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.query(
                `SELECT * FROM usuarios WHERE id = ?`,
                [id]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error al obtener los datos:', error.message);
            res.status(500).json({ error: 'Error al obtener los datos' });
        }
    }
];

exports.obtenerJefesGuardia = [
    verificarToken,
    async (req, res) => {
        try {
            // Buscamos usuarios con cargo "JEFE GUARDIA" y solo traemos nombres y apellidos
            const jefesGuardia = await Usuario.findAll({
                attributes: ['nombres', 'apellidos'],
                where: {
                    cargo: 'JEFE GUARDIA'
                }
            });

            if (jefesGuardia.length === 0) {
                return res.status(404).json({ error: 'No se encontraron jefes de guardia' });
            }

            res.status(200).json(jefesGuardia);
        } catch (error) {
            console.error('Error al obtener los datos:', error.message);
            res.status(500).json({ error: 'Error al obtener los datos' });
        }
    }
];

exports.actualizarFirma = [
    verificarToken,
    upload.single('firma'),
    async (req, res) => {
        const { id } = req.params;

        try {
            console.log(`Iniciando actualización de firma para el usuario con ID: ${id}`);

            // Verificar si el usuario existe
            const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (rows.length === 0) {
                console.warn(`Usuario con ID ${id} no encontrado.`);
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar si se subió un archivo
            if (!req.file) {
                console.warn('No se subió ninguna firma.');
                return res.status(400).json({ error: 'Debe subir una firma' });
            }

            console.log('Archivo subido:', req.file);

            const firmaUrl = req.file.path; // URL de Cloudinary
            console.log(`Nueva firma subida: ${firmaUrl}`);

            // **Eliminar la firma anterior en Cloudinary**
            if (rows[0].firma) {
                try {
                    const urlPartes = rows[0].firma.split('/');
                    const publicIdConExt = urlPartes.pop(); // Última parte de la URL (puede incluir extensión)
                    const publicId = publicIdConExt.split('.')[0]; // Eliminar la extensión
                    
                    console.log(`Eliminando firma anterior con public_id: firmas/${publicId}`);
                    await cloudinary.uploader.destroy(`firmas/${publicId}`);
                    console.log('Firma anterior eliminada correctamente.');
                } catch (err) {
                    console.error('Error al eliminar la firma anterior:', err.message);
                }
            }

            // **Actualizar la firma en la base de datos**
            await db.query(
                'UPDATE usuarios SET firma = ?, updatedAt = NOW() WHERE id = ?',
                [firmaUrl, id]
            );

            console.log('Firma actualizada correctamente en la base de datos.');

            res.status(200).json({ message: 'Firma actualizada exitosamente', firma: firmaUrl });
        } catch (error) {
            console.error('Error al actualizar la firma:', error);
            res.status(500).json({ error: 'Error al actualizar la firma' });
        }
    }
];

exports.actualizarOperacionesAutorizadas = [
    verificarToken,
    async (req, res) => {
        const { id } = req.params;
        const { operaciones_autorizadas } = req.body;

        if (!operaciones_autorizadas || typeof operaciones_autorizadas !== 'object') {
            return res.status(400).json({ error: 'Se requiere un objeto JSON válido para operaciones_autorizadas' });
        }

        try {
            const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await db.query(
                'UPDATE usuarios SET operaciones_autorizadas = ?, updatedAt = NOW() WHERE id = ?',
                [JSON.stringify(operaciones_autorizadas), id]
            );

            res.status(200).json({ message: 'Operaciones autorizadas actualizadas exitosamente' });
        } catch (error) {
            console.error('Error al actualizar operaciones autorizadas:', error.message);
            res.status(500).json({ error: 'Error al actualizar operaciones autorizadas' });
        }
    }
];
