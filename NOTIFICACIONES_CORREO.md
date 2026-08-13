# Sistema de Notificaciones por Correo — SEMINCO

## Contexto para el agente de frontend

Debes construir una pantalla en el frontend que permita enviar correos electrónicos.
El backend ya está desplegado y funcionando. No debes modificar el backend, solo consumirlo.

**Base URL producción:** `https://api-seminco-catalina-huanca.vercel.app`

---

## Autenticación requerida

Ambos endpoints requieren JWT. Enviar en el header de cada petición:
```
Authorization: Bearer <token>
```

| Status | Significado |
|---|---|
| 403 | No se proporcionó el token |
| 401 | El token ha expirado → redirigir a login |

---

## Endpoint 1 — Correo de texto simple

```
POST https://api-seminco-catalina-huanca.vercel.app/api/notificaciones/email
```

- **Auth:** SI (JWT)
- **Content-Type:** `application/json`

**Body:**
```json
{
  "to": "destinatario@empresa.com",
  "subject": "Asunto del correo",
  "message": "Cuerpo del mensaje"
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `to` | string (email válido) | SI |
| `subject` | string | SI |
| `message` | string | SI |

**Respuestas:**
```json
200: { "success": true, "messageId": "abc123" }
400: { "error": "to, subject y message son requeridos" }
400: { "error": "Email inválido" }
403: { "error": "No se proporcionó el token" }
401: { "error": "El token ha expirado" }
500: { "success": false, "error": "No se pudo enviar el correo" }
```

---

## Endpoint 2 — Correo con PDF adjunto

```
POST https://api-seminco-catalina-huanca.vercel.app/api/notificaciones/email-pdf
```

- **Auth:** SI (JWT)
- **Content-Type:** `multipart/form-data`
- **Tamaño máximo PDF:** 10 MB

| Campo | Tipo | Requerido |
|---|---|---|
| `to` | string (email válido) | SI |
| `subject` | string | SI |
| `message` | string | NO |
| `pdf` | archivo `.pdf` | SI |

**Respuestas:**
```json
200: { "success": true, "messageId": "abc123" }
400: { "error": "to y subject son requeridos" }
400: { "error": "Email inválido" }
400: { "error": "Se requiere un archivo PDF (campo 'pdf')" }
400: { "error": "Solo se permiten archivos PDF" }
403: { "error": "No se proporcionó el token" }
401: { "error": "El token ha expirado" }
500: { "success": false, "error": "No se pudo enviar el correo" }
```

---

## Remitente fijo

El remitente siempre es el configurado en el servidor, el frontend no lo controla:
```
De: CH-OperacionesMina@catalinahuancamine.com
```

---

## Diferencia entre los dos endpoints

| | `/email` | `/email-pdf` |
|---|---|---|
| Auth JWT | SI | SI |
| Adjunta PDF | NO | SI (obligatorio) |
| Content-Type | `application/json` | `multipart/form-data` |
| `message` | Obligatorio | Opcional |

---

## Flujo en el frontend

```
Usuario autenticado (tiene JWT)
        │
        ├── ¿Tiene PDF para adjuntar?
        │       │
        │      SI → FormData con (to, subject, message, pdf)
        │           POST /email-pdf
        │           Header: Authorization: Bearer <token>
        │       │
        │      NO → JSON con (to, subject, message)
        │           POST /email
        │           Header: Authorization: Bearer <token>
        │
        ▼
  200 → mostrar "Correo enviado exitosamente"
  400 → mostrar el mensaje de error al usuario
  401 → token expirado → redirigir a login
  500 → mostrar "Error al enviar, intente de nuevo"
```

---

## Ejemplo de implementación en el frontend

### Enviar correo de texto (fetch)
```javascript
const enviarCorreo = async (to, subject, message, token) => {
  const response = await fetch(
    'https://api-seminco-catalina-huanca.vercel.app/api/notificaciones/email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ to, subject, message }),
    }
  );
  return response.json();
};
```

### Enviar correo con PDF (fetch)
```javascript
const enviarCorreoPDF = async (to, subject, message, pdfFile, token) => {
  const formData = new FormData();
  formData.append('to', to);
  formData.append('subject', subject);
  if (message) formData.append('message', message);
  formData.append('pdf', pdfFile); // pdfFile es un objeto File del input

  const response = await fetch(
    'https://api-seminco-catalina-huanca.vercel.app/api/notificaciones/email-pdf',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO poner Content-Type aquí — el navegador lo setea automáticamente con el boundary
      },
      body: formData,
    }
  );
  return response.json();
};
```
