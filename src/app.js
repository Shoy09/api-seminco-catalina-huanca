const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const routes     = require('./routes');
const basicAuth  = require('express-basic-auth');
const swaggerUI  = require('swagger-ui-express');
const swaggerDoc = require('../swagger.json');

// ── SSO: importar passport configurado ───────────────────────────────────────
const { passport, samlStrategy } = require('./config/passport');

// Servicios
const { iniciarProgramacion } = require('./services/scheduler');
const { verificarSMTP }       = require('./services/mailer');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors());

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true })); // ← necesario para SAML callback

// ── Passport (sin express-session — usamos cookies para OIDC en Vercel) ───────
app.use(passport.initialize());

// Exponer samlStrategy para el endpoint /auth/saml/metadata
app.set('samlStrategy', samlStrategy);

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Swagger ───────────────────────────────────────────────────────────────────
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// ── Inicio ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await verificarSMTP();

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