const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/imagenController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

// Rutas protegidas (admin)
router.post('/upload', authMiddleware, upload.single('imagen'), imagenController.uploadProductImage);
router.post('/upload-temp', authMiddleware, upload.single('imagen'), imagenController.uploadTempImage);
router.delete('/:id', authMiddleware, imagenController.deleteImage);
router.put('/:id/principal', authMiddleware, imagenController.setPrincipal);

// Ruta pública
router.get('/producto/:producto_id', imagenController.getProductImages);

module.exports = router;