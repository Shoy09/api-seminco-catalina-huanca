'use strict';
const express = require('express');
const verificarToken = require('../../middleware/auth');
const { validateImage, readTalLargoPhoto } = require('../../services/talLargoPhoto');

function createTalLargoPhotoRouter({
  auth = verificarToken,
  findUser = id => require('../../models/Usuario').findByPk(id, {
    attributes: ['id', 'rol', 'activo'],
  }),
  readPhoto = readTalLargoPhoto,
  dailyLimit = Number(process.env.PHOTO_IMPORT_DAILY_LIMIT ?? 50),
  now = Date.now,
} = {}) {
  const router = express.Router();
  const users = new Map();

  const requireMaster = async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.user?.id == null) return res.status(401).json({ error: 'Sesión inválida.' });
    try {
      const user = await findUser(req.user.id);
      if (!user || String(user.rol ?? '').trim().toLowerCase() !== 'master' ||
          ![true, 1, '1'].includes(user.activo)) {
        return res.status(403).json({ error: 'Solo un usuario master activo puede leer reportes por foto.' });
      }
      next();
    } catch (_) {
      res.status(503).json({ error: 'No se pudo comprobar el permiso del usuario.' });
    }
  };

  // Montar antes del parser general: 8 MB binarios ocupan ~10.7 MB en base64.
  router.post('/preview', auth, requireMaster,
    express.json({ limit: '12mb', strict: true }), async (req, res) => {
      let quota;
      let acquired = false;
      const controller = new AbortController();
      const disconnected = () => { if (!res.writableEnded) controller.abort(); };
      res.on('close', disconnected);
      try {
        validateImage(req.body);
        if (!Number.isInteger(dailyLimit) || dailyLimit < 1) {
          return res.status(503).json({ error: 'El límite de lecturas no está configurado correctamente.' });
        }
        const key = String(req.user.id);
        const day = new Date(now()).toISOString().slice(0, 10);
        for (const [k, value] of users) {
          if (value.day !== day && !value.busy) users.delete(k);
        }
        quota = users.get(key) ?? { day, count: 0, busy: false, last: null };
        if (quota.busy || (quota.day === day && quota.count >= dailyLimit) ||
            (quota.last !== null && now() - quota.last < 10000)) {
          res.set('Retry-After', '10');
          return res.status(429).json({ error: 'Límite de lecturas alcanzado. Intenta más tarde.' });
        }
        if (quota.day !== day) { quota.day = day; quota.count = 0; }
        quota.busy = true;
        acquired = true;
        quota.count++;
        quota.last = now();
        users.set(key, quota);
        const draft = await readPhoto(req.body, { signal: controller.signal });
        if (!res.destroyed) res.json(draft);
      } catch (e) {
        if (!res.destroyed) {
          res.status(e.status ?? 502).json({
            error: e.status ? e.message : 'No se pudo leer la foto. Intenta nuevamente.',
          });
        }
      } finally {
        if (acquired) quota.busy = false;
        res.off('close', disconnected);
      }
    });

  router.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'La foto es demasiado grande.' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'El cuerpo JSON no es válido.' });
    }
    next(err);
  });
  return router;
}

module.exports = { createTalLargoPhotoRouter };
