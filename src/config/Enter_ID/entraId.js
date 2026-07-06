// Configuración central para Microsoft EntraID (Azure AD)
// Soporta tanto OIDC como SAML según el protocolo configurado
 
module.exports = {
  // ── CONFIGURACIÓN COMÚN ──────────────────────────────────────────────────
  tenantId: process.env.ENTRA_TENANT_ID,          // ID del tenant de la empresa
  clientId: process.env.ENTRA_CLIENT_ID,          // App registration client ID
 
  // ── OIDC (OpenID Connect) ────────────────────────────────────────────────
  oidc: {
    clientSecret:  process.env.ENTRA_CLIENT_SECRET,
    redirectUri:   process.env.ENTRA_REDIRECT_URI || 'http://localhost:3000/auth/oidc/callback',
    scope:         ['openid', 'profile', 'email', 'offline_access'],
    // URL del discovery document de Azure AD
    issuerUrl: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`,
  },
 
  // ── SAML 2.0 ────────────────────────────────────────────────────────────
  saml: {
    // URL de tu app que recibe la aserción SAML (POST binding)
    callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3000/auth/saml/callback',
    // URL del Identity Provider (EntraID)
    entryPoint: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/saml2`,
    // Identificador de tu aplicación registrada en EntraID
    issuer: process.env.SAML_ISSUER || process.env.ENTRA_CLIENT_ID,
    // Certificado público del IdP (descargar de EntraID > Enterprise Apps > SAML > Certificate)
    cert: process.env.SAML_IDP_CERT,
    // Forzar autenticación aunque haya sesión activa en EntraID
    forceAuthn: false,
    // Atributos que EntraID envía en la aserción
    attributeMapping: {
      id:       'http://schemas.microsoft.com/identity/claims/objectidentifier',
      email:    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      nombres:  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      apellidos:'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      upn:      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
    },
  },
 
  // ── SCIM 2.0 ─────────────────────────────────────────────────────────────
  scim: {
    // Token que EntraID usará para autenticar sus llamadas SCIM a tu app
    // Generar con: require('crypto').randomBytes(32).toString('hex')
    bearerToken: process.env.SCIM_BEARER_TOKEN,
    // Ruta base del endpoint SCIM
    basePath: '/scim/v2',
  },
 
  // ── JWT INTERNO (para sesiones post-SSO) ─────────────────────────────────
  jwt: {
    secret:    process.env.JWT_SECRET,
    expiresIn: '3h',
  },
};