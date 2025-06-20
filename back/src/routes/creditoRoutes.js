const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/creditoController');
const { protect } = require('../middleware/auth');

router.use(protect); 

router.get('/', creditoController.getCreditos);
router.get('/:id', creditoController.getCreditoById);
router.get('/cliente/:clienteId', creditoController.getCreditosByCliente);
router.get('/asesor/:asesorId', creditoController.getCreditosByAsesor);
router.post('/', creditoController.createCredito);
router.put('/:id', creditoController.updateCredito);
router.delete('/:id', creditoController.deleteCredito);

module.exports = router;