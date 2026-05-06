const express = require("express");
const router = express.Router();
const tipoPerforacionController = require("../../controllers/tipoPerforacionController");
const verificarToken = require('../../middleware/auth');

router.get("/", verificarToken, tipoPerforacionController.getAllTipoPerforacion);
router.get("/:id", verificarToken, tipoPerforacionController.getTipoPerforacionById);
router.post("/", verificarToken, tipoPerforacionController.createTipoPerforacion);
router.put("/:id", verificarToken, tipoPerforacionController.updateTipoPerforacion);
router.delete("/:id", verificarToken, tipoPerforacionController.deleteTipoPerforacion);

module.exports = router;
