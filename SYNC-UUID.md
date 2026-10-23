# Sincronización de operaciones con UUID

## Despliegue

1. Respaldar la base y revisar el entorno/conexión usado por sequelize-cli.
2. Ejecutar `npm run migrate` en Backend. La migración nueva es
   `20261023120000-add-sync-uuid-to-operaciones.js`; el comando también ejecuta
   cualquier migración anterior pendiente, por lo que debe revisarse el estado
   con `npx sequelize-cli db:migrate:status` antes de ejecutarlo.
3. Desplegar/reiniciar la API con los modelos y el controlador nuevos.
4. Probar contra una base de pruebas dos POST idénticos, solicitudes simultáneas
   y un PUT posterior: debe existir una sola fila y mantenerse el mismo ID.
5. Distribuir Flutter y habilitar la recuperación de pendientes únicamente
   cuando se haya confirmado que el servidor persiste y reconoce `sync_uuid`.

La migración no se ejecuta al iniciar la API. Agrega VARCHAR(36) nullable e índice
UNIQUE en las diez tablas, con sus nombres exactos (incluido Operacion_Volquetes).
MySQL permite múltiples NULL: no se inventan claves para registros históricos.
El DDL confirma implícitamente; el script permite reanudar una ejecución parcial.
La reversión elimina la columna y sus identidades: no usarla mientras haya
clientes que dependan de los reintentos por UUID.

## Contrato

POST /operaciones/crear mantiene el cuerpo `{tipo, data}`; data puede ser objeto
o lista. Cada operación nueva envía su UUID v4 permanente en `sync_uuid`.
`findOrCreate` y la restricción UNIQUE resuelven creaciones repetidas sin
sobrescribir datos. Se ignoran id, idNube y local_id como columnas persistentes.
La respuesta por registro contiene local_id, server_id, sync_uuid, creado y
reutilizado. `creado: true` significa confirmación para Flutter, tanto en una
creación nueva como cuando ya existía. `reutilizado` distingue esos casos.
Los errores por fila incluyen `creado: false`, server_id null y error.

Los clientes antiguos que no envíen UUID pueden seguir creando, pero esos
envíos NO son idempotentes. Una clave inválida se rechaza, no se ignora.
PUT sigue buscando por idNube (o el ID de ruta en actualización individual).
Ignora sync_uuid para conservar la identidad original y no asociar registros
históricos a una clave incorrecta durante la transición.

## Pendientes históricos

Los registros Flutter con envio=2/3 anteriores al despliegue deben conciliarse
antes de reintentar: el servidor pudo guardar la operación sin conocer la clave
que la migración local asignó después. No resetear masivamente envio a cero.
La fase Flutter actual conserva esos bloqueos hasta completar la recuperación.

## Validación local

`node --test test/*.test.js`

Las pruebas aíslan persistencia y controladores, sin cargar .env ni conectarse
a la nube. No sustituyen la prueba de concurrencia contra MySQL real.

## Comprobación automática de compatibilidad

GET /operaciones/sync-capabilities devuelve ok=true y sync_uuid_version=1 solo
si los diez índices únicos existen en la BD de la API en ejecución. Flutter
consulta este endpoint antes de habilitar reintentos. También se debe desplegar
esta ruta nueva; no requiere otra migración en MySQL.
