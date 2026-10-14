# Checklist por equipos

Cada ítem conserva su ID y sus campos `proceso`, `categoria` y `nombre`. Las asignaciones usan el ID de `equipos`; los nombres no se usan como claves y pueden repetirse.

## Alcance

- `aplica_todos_equipos: true`: aplica a todo el proceso, incluidos equipos creados posteriormente. `equipo_ids` y `equipos` se devuelven vacíos porque no hay asignaciones individuales.
- `aplica_todos_equipos: false`: aplica únicamente a los IDs asignados en `equipo_ids`.
- En POST, enviar `equipo_ids` sin el indicador selecciona automáticamente el alcance específico. Se exige al menos un equipo existente del mismo proceso.
- En POST, omitir ambos campos conserva el comportamiento anterior: todo el proceso. Esto mantiene compatibles el formulario e importador actuales.
- En PUT, omitir ambos campos conserva el alcance y las asignaciones. Al cambiar el proceso, se vuelven a validar los equipos.
- Para pasar de todo el proceso a equipos concretos, enviar `equipo_ids: [12, 18]`. Para volver a todo el proceso, enviar `aplica_todos_equipos: true` y omitir los IDs o enviar `[]`.
- No se fusionan ítems existentes por nombre ni se impone unicidad a los nombres. La clave compuesta de la tabla intermedia impide asignar dos veces el mismo ítem al mismo equipo.
- Las escrituras del ítem y sus asignaciones usan una sola transacción.

## Rutas

Se mantiene el montaje actual `/check-list` y su CRUD:

- `GET /check-list`: listado, ahora también con `aplica_todos_equipos`, `equipo_ids` y `equipos` (id, nombre, codigo, proceso).
- `GET /check-list?proceso=...&categoria=...`: filtros opcionales.
- `GET /check-list?equipo_id=12` o `GET /check-list/equipo/12`: ítems aplicables al equipo, tanto generales de su proceso como asignados específicamente. Puede combinarse con filtros de proceso y categoría. Devuelve 404 si no existe el equipo.
- `GET /check-list/:id`: detalle con asignaciones.
- `POST /check-list`: crear.
- `PUT /check-list/:id`: actualizar los campos y, opcionalmente, el alcance.
- `DELETE /check-list/:id`: elimina el ítem y sus asignaciones por FK en cascada.

Ejemplo de POST o PUT (usar IDs existentes de equipos del mismo proceso):

```json
{
  "proceso": "PERFORACIÓN HORIZONTAL",
  "categoria": "ANTES",
  "nombre": "Verificar nivel de aceite",
  "equipo_ids": [12, 18]
}
```

## Migración

`migrations/20261014160000-add-checklist-equipo-assignments.js` agrega `aplica_todos_equipos` con valor inicial verdadero y crea `checklist_item_equipos` con claves foráneas. Conserva los ítems, sus IDs y su aplicación al proceso. No elimina ni agrupa registros históricos.

Ejecutar desde Backend después de confirmar la base destino y revisar las migraciones pendientes:

```powershell
npx sequelize-cli db:migrate:status --env development
npx sequelize-cli db:migrate --to 20261014160000-add-checklist-equipo-assignments.js --env development
```

`--to` también ejecuta migraciones anteriores pendientes. Usar el entorno que corresponda realmente a la base elegida; no asumir que `development` apunta a una base local.

Aplicar la migración antes de iniciar la API actualizada. El rollback elimina las restricciones por equipo, por lo que los ítems volverán a funcionar por proceso.

## Frontend

El frontend anterior seguirá funcionando por proceso. Para elegir equipos necesita enviar los nuevos IDs y mostrar el alcance. El cliente que llena el checklist debe consultar por `equipo_id`, en lugar de filtrar solamente por proceso. Esta actualización de API no modifica todavía esos formularios ni los clientes móviles.

## Pruebas

```powershell
node --test test/checklistItemController.test.js
```

Pruebas aisladas con conexión simulada: validación, asignaciones, filtros, compatibilidad y rollback. No conectan a una base de datos.
