# ════════════════════════════════════════════════════════════════════════════
# AZURE DEPLOYMENT - GUÍA DE CONFIGURACIÓN
# ════════════════════════════════════════════════════════════════════════════

## 1. PREPARACIÓN PREVIA

### 1.1 Crear Azure Container Registry (ACR)
```bash
az group create --name rg-seminco --location eastus
az acr create --resource-group rg-seminco --name semincoacr --sku Standard
```

### 1.2 Build y Push de la imagen Docker
```bash
# Login en ACR
az acr login --name semincoacr

# Build
docker build -t semincoacr.azurecr.io/backend:latest .

# Push
docker push semincoacr.azurecr.io/backend:latest
```

---

## 2. CREAR AZURE APP SERVICE

```bash
# Crear App Service Plan
az appservice plan create \
  --name seminco-plan \
  --resource-group rg-seminco \
  --sku P1V2 \
  --is-linux

# Crear Web App para contenedor
az webapp create \
  --resource-group rg-seminco \
  --plan seminco-plan \
  --name seminco-api \
  --deployment-container-image-name-user semincoacr.azurecr.io/backend:latest
```

---

## 3. CREAR AZURE DATABASE FOR MYSQL

```bash
# Crear servidor MySQL
az mysql flexible-server create \
  --resource-group rg-seminco \
  --name seminco-mysql \
  --location eastus \
  --admin-user adminuser \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B2s \
  --tier Burstable

# Crear base de datos
az mysql flexible-server db create \
  --resource-group rg-seminco \
  --server-name seminco-mysql \
  --database-name seminco_production
```

---

## 4. CREAR AZURE KEY VAULT

```bash
# Crear Key Vault
az keyvault create \
  --resource-group rg-seminco \
  --name seminco-kv \
  --location eastus

# Agregar secretos
az keyvault secret set --vault-name seminco-kv \
  --name DB-PASSWORD \
  --value 'YourSecurePassword123!'

az keyvault secret set --vault-name seminco-kv \
  --name JWT-SECRET \
  --value "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

az keyvault secret set --vault-name seminco-kv \
  --name ENTRA-CLIENT-SECRET \
  --value 'your-entra-client-secret'
```

---

## 5. CONFIGURAR VARIABLES DE ENTORNO EN APP SERVICE

### Via Azure Portal:
1. Ir a App Service → Configuration → Application Settings
2. Agregar todas las variables del `.env.example`

### Via CLI:
```bash
az webapp config appsettings set \
  --resource-group rg-seminco \
  --name seminco-api \
  --settings \
  NODE_ENV=production \
  PORT=80 \
  DB_HOST=seminco-mysql.mysql.database.azure.com \
  DB_PORT=3306 \
  DB_NAME=seminco_production \
  DB_USER=adminuser@seminco-mysql \
  DB_PASSWORD='YourSecurePassword123!' \
  JWT_SECRET='generated-secret-key' \
  ENTRA_TENANT_ID='your-tenant-id' \
  ENTRA_CLIENT_ID='your-client-id' \
  ENTRA_CLIENT_SECRET='your-client-secret' \
  ENTRA_REDIRECT_URI='https://seminco-api.azurewebsites.net/auth/oidc/callback' \
  SAML_CALLBACK_URL='https://seminco-api.azurewebsites.net/auth/saml/callback' \
  SMTP_HOST='smtp.gmail.com' \
  SMTP_PORT=587 \
  SMTP_USER='your-email@gmail.com' \
  SMTP_PASS='your-app-password' \
  SMTP_SECURE=false \
  SMTP_FROM='noreply@yourcompany.com' \
  CLOUDINARY_CLOUD_NAME='your-cloud-name' \
  CLOUDINARY_API_KEY='your-api-key' \
  CLOUDINARY_API_SECRET='your-api-secret' \
  FRONTEND_URL='https://your-frontend.azurewebsites.net' \
  ENABLE_SCHEDULER=false \
  ALLOWED_ORIGINS='https://seminco-api.azurewebsites.net,https://your-frontend.azurewebsites.net'
```

---

## 6. CONFIGURAR AUTENTICACIÓN CON ACR

```bash
# Obtener credenciales de ACR
az acr credential show --name semincoacr

# Configurar App Service para usar ACR
az webapp config container set \
  --name seminco-api \
  --resource-group rg-seminco \
  --docker-custom-image-name semincoacr.azurecr.io/backend:latest \
  --docker-registry-server-url https://semincoacr.azurecr.io \
  --docker-registry-server-user <USERNAME> \
  --docker-registry-server-password <PASSWORD>
```

---

## 7. EJECUTAR MIGRACIONES DE BASE DE DATOS

### Opción A: Ejecutar en el Dockerfile (recomendado)
Descomentar en `Dockerfile`:
```dockerfile
RUN npm run migrate:prod
```

### Opción B: Ejecutar manual post-deployment
```bash
az webapp ssh --resource-group rg-seminco --name seminco-api
# Dentro del contenedor:
cd /app
npm run migrate
```

---

## 8. CONFIGURAR AZURE ENTRA ID (SSO)

### 8.1 Registrar aplicación
1. Azure Portal → Azure Entra ID → App registrations → New registration
2. Name: `Seminco API Backend`
3. Supported account types: `Accounts in this organizational directory only`
4. Redirect URI: `https://seminco-api.azurewebsites.net/auth/oidc/callback`

### 8.2 Configurar SAML (opcional)
1. Single sign-on → SAML
2. Basic SAML Configuration:
   - Entity ID: `https://seminco-api.azurewebsites.net`
   - Reply URL: `https://seminco-api.azurewebsites.net/auth/saml/callback`

### 8.3 Obtener credenciales
- Tenant ID: Directory (tenant) ID
- Client ID: Application (client) ID
- Client Secret: Create > Client Secret (copiar valor)

### 8.4 Configurar SCIM (provisioning automático)
1. Enterprise Apps → Your App → Provisioning
2. Set Provisioning Status to `On`
3. Tenant URL: `https://seminco-api.azurewebsites.net/scim/v2`
4. Secret Token: Usar valor de `SCIM_BEARER_TOKEN`

---

## 9. APLICAR POLÍTICAS DE SEGURIDAD

```bash
# Habilitar HTTPS only
az webapp update \
  --name seminco-api \
  --resource-group rg-seminco \
  --https-only true

# Configurar TLS 1.2 mínimo
az webapp config set \
  --name seminco-api \
  --resource-group rg-seminco \
  --min-tls-version 1.2
```

---

## 10. MONITOREO Y LOGS

### Via Application Insights
```bash
# Crear Application Insights
az monitor app-insights component create \
  --app seminco-insights \
  --location eastus \
  --resource-group rg-seminco

# Conectar a App Service
az webapp config appsettings set \
  --resource-group rg-seminco \
  --name seminco-api \
  --settings \
  APPINSIGHTS_INSTRUMENTATION_KEY='your-ikey'
```

### Ver logs
```bash
az webapp log tail --name seminco-api --resource-group rg-seminco
```

---

## 11. VERIFICAR DEPLOYMENT

```bash
# Health check
curl https://seminco-api.azurewebsites.net/health

# Ver documentación API
https://seminco-api.azurewebsites.net/docs
```

---

## 12. TROUBLESHOOTING

### Si la app no inicia
```bash
# Ver logs en tiempo real
az webapp log tail --name seminco-api --resource-group rg-seminco

# Verificar variables de entorno
az webapp config appsettings list --name seminco-api --resource-group rg-seminco
```

### Si falla la conexión a BD
- Verificar firewall de MySQL: `az mysql flexible-server firewall-rule list ...`
- Agregar IP de App Service: `az mysql flexible-server firewall-rule create ...`

### Si falla OIDC/SAML
- Verificar URLs en Azure Entra ID coinciden con `ENTRA_REDIRECT_URI` y `SAML_CALLBACK_URL`
- Descargar certificado SAML nuevo de Enterprise Apps

---

## 13. COMANDOS ÚTILES

```bash
# Reiniciar app
az webapp restart --name seminco-api --resource-group rg-seminco

# Actualizar imagen Docker
docker push semincoacr.azurecr.io/backend:latest
az webapp deployment container config --name seminco-api --resource-group rg-seminco --enable-cd

# Ver estado de la app
az webapp show --name seminco-api --resource-group rg-seminco

# Eliminar recursos
az group delete --name rg-seminco --yes --no-wait
```

---

## 14. COSTOS ESTIMADOS (USD/mes)

- App Service Plan (P1V2): ~$245
- Database for MySQL (Standard_B2s): ~$115
- Container Registry (Standard): ~$5
- Application Insights: ~$2.99 (primeros 5GB)
- **Total**: ~$370/mes

**Ahorro**: Usar Dev/Test para development (50% descuento)

---

## ¡LISTO PARA PRODUCCIÓN! ✅

Tu API está ahora completamente configurada para Azure con:
✓ Containerización con Docker
✓ Base de datos segura en Azure
✓ SSO/OIDC/SAML con Azure Entra ID
✓ SCIM provisioning automático
✓ Health checks para monitoreo
✓ Secretos en Key Vault
✓ Logs en Application Insights
