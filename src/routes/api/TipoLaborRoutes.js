const express = require("express");
const router = express.Router();
const tipoLaborController = require("../api/tipoEquipoRoutes");
const verificarToken = require('../../middleware/auth');

router.get("/", verificarToken, tipoLaborController.getAllTipoLabor);
router.get("/:id", verificarToken, tipoLaborController.getTipoLaborById);
router.post("/", verificarToken, tipoLaborController.createTipoLabor);
router.put("/:id", verificarToken, tipoLaborController.updateTipoLabor);
router.delete("/:id", verificarToken, tipoLaborController.deleteTipoLabor);

module.exports = router;