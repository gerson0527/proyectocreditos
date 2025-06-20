const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', clienteController.getAllClientes);
router.get('/search', clienteController.searchCliente);  // Moved before :id route
router.get('/:id', clienteController.getClienteById);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;