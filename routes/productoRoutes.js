const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Rutas públicas
router.get('/', productoController.getAll);
router.get('/ofertas', productoController.getOfertas);  // ← NUEVA RUTA
router.get('/search', productoController.search);
router.get('/categoria/:categoriaId', productoController.getByCategoria);
router.get('/:id', productoController.getById);

// Rutas protegidas (admin) - por ahora sin autenticación
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.delete);

module.exports = router;