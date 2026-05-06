const express = require("express");
const router = express.Router();
const planProduccionController = require("../../controllers/planProduccionController");

// Definir las rutas
router.get("/", planProduccionController.getAll);
router.get("/:id", planProduccionController.getById);
router.post("/", planProduccionController.create);
router.put("/:id", planProduccionController.update);
router.delete("/:id", planProduccionController.delete);
router.get('/anio/:anio/mes/:mes', planProduccionController.getPlanProduccionByYearAndMonth);


module.exports = router;
