const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const cookieParser = require('cookie-parser');
const routes       = require('./routes');
const basicAuth    = require('express-basic-auth');
const swaggerUI    = require('swagger-ui-express');
const swaggerDoc   = require('../swagger.json');

// ── SSO: importar passport configurado ───────────────────────────────────────
const { passport, samlStrategy } = require('./config/Enter_ID/passport');

// Servicios
const { iniciarProgramacion } = require('./services/scheduler');
const { verifyConnection } = require('./services/mailer');

const app = express();

// ── Producción (Vercel / Proxy) ───────────────────────────────────────────────
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
// Azure Entra ID envía Content-Type: application/scim+json
// express.json() por defecto solo acepta application/json → body queda vacío
app.use(express.json({
  limit: '10mb',
  type: ['application/json', 'application/scim+json'],
}));
app.use(express.urlencoded({ extended: true }));

// ── Cookie Parser (OBLIGATORIO para OIDC con useCookieInsteadOfSession) ───────
app.use(cookieParser());

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// Exponer samlStrategy para el endpoint /auth/saml/metadata
app.set('samlStrategy', samlStrategy);

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Swagger ───────────────────────────────────────────────────────────────────
app.use(
  '/docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc)
);

// ── Health Check (CRÍTICO para Azure App Service) ───────────────────────────
// Azure usa este endpoint para verificar si la app está healthy
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── Inicio ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await verifyConnection();

    if (process.env.ENABLE_SCHEDULER === 'true') {
      iniciarProgramacion();
    } else {
      console.log('[scheduler] Scheduler deshabilitado.');
    }

    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
    });

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

iniciarServidor();

module.exports = app; 