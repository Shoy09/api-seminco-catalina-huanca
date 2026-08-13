// controllers/authController.js
// SSO con Microsoft EntraID — OIDC y SAML
// Usa el modelo Sequelize Usuario (tu tabla real)

require('dotenv').config();
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');        // ← tu modelo Sequelize
const config  = require('../config/Enter_ID/entraId');
const bcrypt = require('bcryptjs'); 
const db = require('../config/db');

// ════════════════════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ════════════════════════════════════════════════════════════════════════════

async function buscarOCrearUsuario(perfilEntra) {
  const { oid, email, nombres, apellidos } = perfilEntra;

  // Buscar por OID de EntraID (identificador inmutable)
  const usuario = await Usuario.findOne({ where: { entra_oid: oid } });

  // Si no existe, SCIM debió haberlo creado antes del primer login
  if (!usuario) {
    throw new Error('USUARIO_NO_APROVISIONADO');
  }

  // Verificar que no esté desactivado por SCIM
  if (!usuario.activo) {
    throw new Error('USUARIO_INACTIVO');
  }

  // Actualizar solo los campos que vienen de EntraID
  // NO tocamos: cargo, rol, area, firma, codigo_dni, operaciones_autorizadas
  await usuario.update({
    nombres,
    apellidos,
    correo: email,
  });

  return usuario;
}

function generarToken(usuario) {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  // Incluimos los campos que tu frontend y middleware ya usan
  const payload = {
    id:                      usuario.id,
    entra_oid:               usuario.entra_oid,
    codigo_dni:              usuario.codigo_dni,   // puede ser null hasta que admin lo complete
    apellidos:               usuario.apellidos,
    nombres:                 usuario.nombres,
    correo:                  usuario.correo,        // tu columna es 'correo'
    rol:                     usuario.rol,           // importante para permisos en el frontend
    cargo:                   usuario.cargo,
    area:                    usuario.area,
    empresa:                 usuario.empresa,
    guardia:                 usuario.guardia,
    operaciones_autorizadas: usuario.operaciones_autorizadas,
  };

  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// ════════════════════════════════════════════════════════════════════════════
// FLUJO OIDC (OpenID Connect) — RECOMENDADO
// ════════════════════════════════════════════════════════════════════════════

// GET /auth/oidc/login
// passport.authenticate('oidc') en la ruta hace la redirección a Microsoft
exports.iniciarLoginOIDC = (req, res, next) => next();

// GET /auth/oidc/callback
// EntraID vuelve aquí — passport ya validó el token
// controllers/authController.js — solo este método cambia
exports.callbackOIDC = async (req, res) => {
  console.log('>>>> Entró a callbackOIDC <<<<');
  console.log(req.user);
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    const perfilEntra = {
      oid:       req.user.oid,
      email:     req.user._json?.email     || req.user.upn || '',
      nombres:   req.user.name?.givenName  || req.user._json?.given_name  || '',
      apellidos: req.user.name?.familyName || req.user._json?.family_name || '',
    };

    const usuario = await buscarOCrearUsuario(perfilEntra);
const token   = generarToken(usuario);

console.log('====================================');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const destino = `${process.env.FRONTEND_URL}/login?token=${token}`;

console.log('Destino:', destino);
console.log('====================================');

return res.redirect(destino);

  } catch (error) {
    if (error.message === 'USUARIO_INACTIVO') {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=usuario_inactivo`);
    }
    if (error.message === 'USUARIO_NO_APROVISIONADO') {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=usuario_no_aprovisionado`);
    }
    console.error('Error en callback OIDC:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// FLUJO SAML 2.0 — ALTERNATIVO
// ════════════════════════════════════════════════════════════════════════════

// GET /auth/saml/login
exports.iniciarLoginSAML = (req, res, next) => next();

// POST /auth/saml/callback
// EntraID envía la aserción SAML aquí (HTTP POST binding)
exports.callbackSAML = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación SAML fallida' });
    }

    const attrMap = config.saml.attributeMapping;
    const attrs   = req.user;  // passport-saml pone los atributos aquí

    const perfilEntra = {
      oid:       attrs[attrMap.id],
      email:     attrs[attrMap.email]    || '',
      nombres:   attrs[attrMap.nombres]  || '',
      apellidos: attrs[attrMap.apellidos]|| '',
    };

    if (!perfilEntra.oid) {
      throw new Error('La aserción SAML no contiene el atributo OID requerido');
    }

    const usuario = await buscarOCrearUsuario(perfilEntra);
    const token   = generarToken(usuario);

    res.status(200).json({ token });

  } catch (error) {
    if (error.message === 'USUARIO_INACTIVO') {
      return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador de TI.' });
    }
    if (error.message === 'USUARIO_NO_APROVISIONADO') {
      return res.status(403).json({ error: 'Usuario no aprovisionado. Contacte al administrador de TI.' });
    }
    console.error('Error en callback SAML:', error.message);
    res.status(500).json({ error: 'Error procesando autenticación SAML' });
  }
};

// GET /auth/saml/metadata
// XML que Trafigura IT necesita para registrar tu app como Service Provider en Azure
exports.metadataSAML = (req, res) => {
  const samlStrategy = req.app.get('samlStrategy');
  if (!samlStrategy) {
    return res.status(500).json({ error: 'Estrategia SAML no configurada en app.set()' });
  }
  res.type('application/xml');
  res.send(samlStrategy.generateServiceProviderMetadata(null, null));
};

// ════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════════════════

// POST /auth/logout
exports.logout = (req, res) => {
  req.logout?.(() => {});
  req.session?.destroy?.();

  const postLogoutRedirectUri = encodeURIComponent(
    process.env.POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000'
  );

  // Redirigir a Microsoft para cerrar la sesión corporativa también
  const entraLogoutUrl =
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/logout` +
    `?post_logout_redirect_uri=${postLogoutRedirectUri}`;

  res.status(200).json({ logoutUrl: entraLogoutUrl });
};

exports.autenticarUsuario = async (req, res) => {
    const { codigo_dni, password } = req.body;

    try {
        
        const [rows] = await db.query('SELECT * FROM usuarios WHERE codigo_dni = ?', [codigo_dni]);
        
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = rows[0];

        // Verificar que el usuario no esté desactivado por SCIM
        if (usuario.activo === 0) {
            return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
        }

        
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        
        const payload = {
            id: usuario.id,
            codigo_dni: usuario.codigo_dni,
            apellidos: usuario.apellidos,
            nombres: usuario.nombres
        };

        
        if (!process.env.JWT_SECRET) {
            throw new Error('La clave secreta (JWT_SECRET) no está configurada');
        }

        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al autenticar al usuario:', error.message);
        res.status(500).json({ error: 'Error al autenticar al usuario' });
    }
};
