# Confirmación de operaciones cerradas transferidas

Endpoint nuevo: POST /api/operaciones/confirm-closed-transfer.
Cuerpo: { tipo, payload, hash }. payload conserva sync_uuid e idNube conocido.
La huella SHA-256 usa la proyección de contenido definida en closedTransfer.js,
no IDs, envio, Hora_envio ni campos administrativos. Telemando está excluido.

Respuesta confirmada:
{ ok: true, data: { sync_uuid, hash, status: 'confirmed', server_id } }

Si existe contenido distinto o estado activo, devuelve status='conflict' sin
modificar la fila. El cliente debe conservar sus copias y detener los PUT
habituales para esa operación. Un error/404 nunca equivale a confirmación.

La creación usa findOrCreate e índice UNIQUE existente dentro de transacción.
El registro se vuelve a leer con bloqueo para comparar el contenido vigente.
Cuando llega idNube conocido, se valida que corresponda a ese UUID, o a una fila
histórica sin UUID cuyo contenido cerrado coincida. No se asigna una identidad
nueva a una fila histórica ni se sobrescribe contenido por este endpoint.

Se debe desplegar la API actualizada antes de distribuir esta función Flutter.
No requiere una migración MySQL adicional; utiliza los índices sync_uuid previos.
GET /api/operaciones/sync-capabilities anuncia closed_transfer_version=1.
La migración de telemando preparada inicialmente fue retirada sin ejecutarse.

Pruebas: node --test test/closedTransfer.test.js test/operationSyncIdentity.test.js
Estas pruebas usan modelos aislados y validan también los campos de los diez
modelos reales sin conectar a la base. Falta validar el despliegue real y probar
la red/punto de acceso con las tablets físicas.