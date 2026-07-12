const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Rutas públicas
router.post('/', pedidoController.create);

// Rutas protegidas (admin) - por ahora sin autenticación
router.get('/', pedidoController.getAll);
router.get('/:id', pedidoController.getById);
router.put('/:id/estado', pedidoController.updateEstado);

module.exports = router;