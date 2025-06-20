const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

// KPIs principales
router.get('/creditos-proceso', dashboardController.getCreditosProcesos);
router.get('/monto-solicitudes', dashboardController.getMontoSolicitudes);
router.get('/tasa-aprobacion', dashboardController.getTasaAprobacion);
router.get('/tiempo-promedio', dashboardController.getTiempoPromedio);

module.exports = router;