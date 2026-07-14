
// Rutas de autenticación SSO (OIDC + SAML) — reemplaza el /login anterior
 
const express  = require('express');
const router   = express.Router();
const { passport } = require('../../config/Enter_ID/passport');
const authCtrl     = require('../../controllers/authController');

//Login - inicial app
router.post('/login', authCtrl.autenticarUsuario);
 
// ── OIDC (OpenID Connect con EntraID) ────────────────────────────────────
 
// 1. Iniciar login: redirige al Microsoft login
router.get('/oidc/login',
  passport.authenticate('oidc', { session: false })
);
 
// 2. Callback: EntraID redirige aquí con el código de autorización
router.get('/oidc/callback',
  passport.authenticate('oidc', { session: false, failureRedirect: '/api/auth/error' }),
  authCtrl.callbackOIDC
);
 
// ── SAML 2.0 ─────────────────────────────────────────────────────────────
 
// 1. Iniciar login: genera y envía el AuthnRequest a EntraID
router.get('/saml/login',
  passport.authenticate('saml', { session: false })
);
 
// 2. Callback: EntraID envía la aserción SAML aquí (POST binding)
router.post('/saml/callback',
  passport.authenticate('saml', { session: false, failureRedirect: '/auth/error' }),
  authCtrl.callbackSAML
);
 
// 3. Metadata SP: para registrar tu app en EntraID como Service Provider
router.get('/saml/metadata', authCtrl.metadataSAML);
 
// ── Logout ────────────────────────────────────────────────────────────────
router.post('/logout', authCtrl.logout);
 
// ── Error de autenticación ────────────────────────────────────────────────
router.get('/error', (req, res) => {
  res.status(401).json({ error: 'Error de autenticación SSO. Verifique sus credenciales.' });
});
 
module.exports = router;