// Configura las estrategias de Passport para OIDC y SAML con EntraID

const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const SamlStrategy = require('passport-saml').Strategy;
const config = require('./entraId');

// ───────────────────────────────────────────────────────────────
// OIDC Strategy (Siempre disponible)
// ───────────────────────────────────────────────────────────────

const oidcStrategy = new OIDCStrategy(
  {
    identityMetadata: `${config.oidc.issuerUrl}/.well-known/openid-configuration`,
    clientID: config.clientId,
    clientSecret: config.oidc.clientSecret,
    responseType: 'code',
    responseMode: 'query',
    redirectUrl: config.oidc.redirectUri,
    allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
    scope: config.oidc.scope,
    passReqToCallback: false,
    loggingLevel: process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  (iss, sub, profile, accessToken, refreshToken, done) => {

    if (!profile.oid) {
      return done(new Error('OID no encontrado en el perfil OIDC'), null);
    }

    return done(null, profile);
  }
);

passport.use('oidc', oidcStrategy);

// ───────────────────────────────────────────────────────────────
// SAML Strategy (Solo si está configurado)
// ───────────────────────────────────────────────────────────────

let samlStrategy = null;

if (config.saml.cert) {

  samlStrategy = new SamlStrategy(
    {
      callbackUrl: config.saml.callbackUrl,
      entryPoint: config.saml.entryPoint,
      issuer: config.saml.issuer,
      cert: config.saml.cert,
      forceAuthn: config.saml.forceAuthn,
      signatureAlgorithm: 'sha256',
      identifierFormat:
        'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      passReqToCallback: false,
    },
    (profile, done) => {

      if (!profile) {
        return done(new Error('Perfil SAML vacío'), null);
      }

      return done(null, profile);
    }
  );

  passport.use('saml', samlStrategy);

  console.log('✅ Estrategia SAML habilitada.');

} else {

  console.log('ℹ️ SAML no configurado. Solo OIDC estará disponible.');

}

// ───────────────────────────────────────────────────────────────
// Serialización
// ───────────────────────────────────────────────────────────────

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

module.exports = {
  passport,
  samlStrategy
};