// middleware/scimLogger.js
// Intercepta todas las peticiones SCIM y guarda request + response en scim_logs.
// Se monta ANTES de los handlers en scimRoutes.js.

const ScimLog = require('../models/ScimLog');

module.exports = function scimLogger(req, res, next) {
  const originalJson = res.json.bind(res);
  let capturedBody   = null;
  let capturedStatus = null;

  // Interceptar res.json para capturar la respuesta antes de enviarla
  res.json = function (body) {
    capturedBody   = body;
    capturedStatus = res.statusCode;
    return originalJson(body);
  };

  // Interceptar res.status para capturar el código cuando se usa res.status(204).send()
  const originalSend = res.send.bind(res);
  res.send = function (body) {
    if (capturedStatus === null) capturedStatus = res.statusCode;
    return originalSend(body);
  };

  // Guardar el log una vez que la respuesta terminó de enviarse
  res.on('finish', () => {
    const statusCode = capturedStatus || res.statusCode;

    ScimLog.create({
      method:        req.method,
      endpoint:      req.originalUrl,
      status_code:   statusCode,
      request_body:  req.body && Object.keys(req.body).length
                       ? JSON.stringify(req.body)
                       : null,
      response_body: capturedBody
                       ? JSON.stringify(capturedBody)
                       : null,
      ip:            req.ip || req.headers['x-forwarded-for'] || null,
      error:         statusCode >= 400 && capturedBody?.detail
                       ? capturedBody.detail
                       : null,
    }).catch(err => {
      // Nunca fallar silenciosamente pero tampoco romper la respuesta
      console.error('scimLogger: no se pudo guardar log:', err.message);
    });
  });

  next();
};
