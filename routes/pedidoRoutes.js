const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/', pedidoController.create);

// Rutas protegidas (admin)
router.get('/', authMiddleware, pedidoController.getAll);
router.get('/:id', authMiddleware, pedidoController.getById);
router.put('/:id/estado', authMiddleware, pedidoController.updateEstado);
router.delete('/:id', authMiddleware, pedidoController.delete); // ← AGREGAR ESTA

module.exports = router;