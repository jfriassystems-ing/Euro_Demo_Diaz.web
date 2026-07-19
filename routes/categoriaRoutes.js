const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/', categoriaController.getAll);

// Rutas protegidas (admin)
router.post('/', authMiddleware, categoriaController.create);
router.put('/:id', authMiddleware, categoriaController.update);
router.delete('/:id', authMiddleware, categoriaController.delete);

module.exports = router;