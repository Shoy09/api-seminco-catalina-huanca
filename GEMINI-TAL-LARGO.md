# Lectura de fotos de Taladro largo con Gemini

Se añadió `POST /api/tal-largo/preview` a esta API. No se necesita otro servidor.
La ruta recibe la foto y devuelve exclusivamente una vista previa: no crea
operaciones en MySQL ni guarda imágenes. La tablet guarda el registro local solo
después de la revisión y confirmación del master.

## Activación

1. Crear una clave de Gemini en Google AI Studio.
2. En las variables del servidor/Azure (o `.env` para desarrollo) configurar:

```dotenv
GEMINI_API_KEY=clave_secreta_del_servidor
GEMINI_MODEL=identificador_del_modelo_elegido_en_ai_studio
PHOTO_IMPORT_DAILY_LIMIT=50
```

Elegir un modelo con entrada de imágenes y salida JSON estructurada y comprobar
su disponibilidad/cuota gratuita en ese proyecto. No se cambia automáticamente
a un modelo de pago. No poner la clave en la app, Git o archivos públicos.

3. Publicar esta versión del backend y reiniciar el servicio. No hay migraciones
de base de datos ni dependencias npm adicionales. Requiere Node 18+ con `fetch`
(el mismo requisito de este backend); Node 22+ es aconsejable para mantenimiento.
4. Si hay un proxy delante, debe permitir 12 MB de JSON y al menos 100 segundos
para esta ruta. Los parsers de las demás rutas siguen con el límite anterior.
5. Instalar la APK actualizada. La app usa por defecto la misma `ApiConfig.baseUrl`
y añade `/tal-largo/preview`. `PHOTO_IMPORT_URL` queda como override opcional.

Sin clave/modelo, la API sigue iniciando normalmente y solo esta ruta devuelve
503. Publicar el código no configura automáticamente las variables de Azure.
El código local no activa despliegues ni cambia secretos.

## Contrato y permisos

Se usa el `Authorization: Bearer <token>` del inicio de sesión existente.
Primero verifica el JWT con el middleware actual, después consulta `Usuario` por
el `id` autenticado y exige `rol=master` y `activo=1`. No confía en roles del
cuerpo de la petición ni en un rol antiguo dentro del token.

Cuerpo JSON:

```json
{
  "mimeType": "image/jpeg",
  "image": "BASE64_DE_LA_FOTO",
  "catalogo": [{"codigo":"101","estado":"OPERATIVO","nombre":"Perforación"}]
}
```

Acepta JPG/PNG, máximo 8 MB binarios (aproximadamente 10.7 MB base64). El parser
de esta ruta se monta antes del parser global de 10 MB. Autentica antes de
interpretar el cuerpo grande. La respuesta conserva el esquema de la app:
`cabecera`, `actividades` con sus `barras`, `horometros` y `advertencias`.

Gemini recibe instrucciones para agrupar los taladros dentro de cada actividad,
conservar la secuencia al cruzar medianoche y leer los horómetros de la franja
inferior: H. motor → diésel, percusión → percusión y eléctrico → eléctrico,
con inicio/final y todos los decimales. Un dato ambiguo debe quedar null y generar
una advertencia para revisión. La exactitud se debe probar con fotos reales.

Errores: 400 formato inválido; 401 token inválido/expirado; 403 sin token (por
compatibilidad con el middleware existente) o usuario no master/inactivo;
413 foto grande; 429 límite de lecturas; 502 respuesta inválida/error Gemini;
503 configuración o permisos no disponibles; 504 tiempo agotado.

No imprime fotos, tokens, claves ni respuestas de Gemini. Aplica `Cache-Control:
no-store`. Límites por usuario: una lectura concurrente, 10 segundos entre
intentos y 50 intentos diarios UTC por defecto. Contador en memoria por instancia:
se reinicia con el proceso; para límites persistentes/múltiples réplicas usar
un contador compartido. Las cuotas propias de Gemini se aplican igualmente.

La capa gratuita tiene límites y condiciones de tratamiento de datos; el costo
del hosting/API existente es independiente. Revisar antes de usar fotos internas:
https://ai.google.dev/gemini-api/docs/pricing

## Verificación

```powershell
node --test test/talLargoPhoto.test.js
```

Pruebas con JWT real y Gemini/consulta de usuario simulados: no se conectan a
MySQL ni envían fotos externas. Cubren permisos actuales, usuarios inactivos,
límites de tamaño, concurrencia, cuotas, horómetros, JSON y timeout.
