// ============================================
// ARCHIVO: backend/src/middleware/auth.js
// ============================================
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Token no proporcionado.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado.'
        });
    }
};

module.exports = authMiddleware;