const express = require('express');
const { getFechas, createFecha, getUltimaFecha } = require("../../controllers/fechasPlanMensualcontroller");

const router = express.Router();

router.get("/", getFechas);
router.post("/", createFecha);
router.get("/ultima", getUltimaFecha);

module.exports = router;
 
