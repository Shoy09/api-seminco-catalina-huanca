# Backend API - Seminco Mining

API Node.js para gestión de operaciones mineras con autenticación SSO (Azure Entra ID), SCIM provisioning y múltiples módulos de negocio.

## 🚀 Quick Start

### Requisitos Previos
- Node.js >= 18.0.0
- MySQL/MariaDB
- npm o yarn

### Instalación Local

1. **Clonar repositorio**
```bash
git clone <your-repo-url>
cd Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales locales
```

4. **Ejecutar migraciones**
```bash
npm run migrate
```

5. **Iniciar servidor**
```bash
npm run dev   # Desarrollo con nodemon
npm start     # Producción
```

Servidor disponible en: `http://localhost:3000`
Documentación API (Swagger): `http://localhost:3000/docs`
Health check: `http://localhost:3000/health`

---

## ☁️ Deployment en Azure

Ver [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) para guía completa.

---

## 📋 Variables de Entorno

Ver archivo `.env.example` para lista completa.

---

## 🐳 Docker

```bash
docker build -t seminco-api:latest .
docker run -p 3000:3000 --env-file .env seminco-api:latest
```

---

## 📁 Estructura

- `config/` - Configuraciones (BD, Mail, Azure Entra ID)
- `migrations/` - Migraciones Sequelize (40+)
- `models/` - Modelos de BD
- `src/` - Código principal
  - `app.js` - Express principal
  - `routes/` - Endpoints API
  - `controllers/` - Lógica de negocio
  - `services/` - Servicios (scheduler, mailer)

---

## 🔗 Endpoints Principales

- `GET /health` - Health check (Azure)
- `GET /docs` - Swagger documentation
- `POST /api/auth/oidc` - OpenID Connect SSO
- `POST /api/auth/saml` - SAML 2.0 SSO
- `GET /scim/v2/Users` - SCIM provisioning

Ver `/docs` para lista completa de endpoints.

---

## 📧 Configuración

- **BD**: MySQL (Sequelize ORM)
- **Auth**: JWT + Azure Entra ID (OIDC/SAML)
- **Provisioning**: SCIM 2.0
- **Upload**: Cloudinary
- **Email**: Nodemailer

---

## 🔐 Seguridad

Antes de producción:
- Generar nuevo `JWT_SECRET`
- Configurar `DB_PASSWORD` segura
- Habilitar HTTPS only
- Usar Azure Key Vault para secretos
- Configurar CORS específico

---

## 🛠️ Development

```bash
npm run dev              # Desarrollo
npm run migrate          # Migraciones
npm run migrate:undo     # Revertir
```

---

## 📝 Licencia

ISC 
