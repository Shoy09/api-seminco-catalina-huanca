# ════════════════════════════════════════════════════════════════════════════
# Dockerfile para Azure Container Registry
# Build: docker build -t your-registry.azurecr.io/backend:latest .
# Push:  docker push your-registry.azurecr.io/backend:latest
# ════════════════════════════════════════════════════════════════════════════

# ── STAGE 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (production + dev para building)
RUN npm ci

# Copiar código fuente
COPY . .

# (Opcional) Ejecutar migraciones de BD con Sequelize
# RUN npm run migrate:prod


# ── STAGE 2: Runtime ─────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar node_modules y código desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check para Azure
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Exponer puerto (puede ser sobrescrito con PORT env var)
EXPOSE 3000

# Usar dumb-init para pasar señales correctamente
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Comando de inicio
CMD ["node", "src/app.js"]
