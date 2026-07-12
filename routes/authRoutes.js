// ============================================
// ARCHIVO: backend/src/routes/authRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');  // ← CAMBIADO

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const result = await pool.query(
            'SELECT id, email, password, nombre, rol FROM usuarios_admin WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = result.rows[0];
        const passwordValida = usuario.password === password || 
                              await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                nombre: usuario.nombre,
                rol: usuario.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

module.exports = router;