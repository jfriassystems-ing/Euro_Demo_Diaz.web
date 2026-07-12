const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pool = require('./src/config/database');

dotenv.config();

const requiredEnv = ['DB_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`❌ Variables de entorno faltantes: ${missingEnv.join(', ')}`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('combined'));

const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Demasiadas peticiones, intenta de nuevo en 15 minutos' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== SERVIR ARCHIVOS ESTÁTICOS DESDE LA RAÍZ =====
app.use(express.static(path.join(__dirname)));

// ===== RUTAS (CORREGIDAS) =====
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const imagenRoutes = require('./routes/imagenRoutes');

console.log('📦 Cargando rutas...');

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/imagenes', imagenRoutes);

// ===== FRONTEND =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API EUROMODADIAZ',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, message: '✅ Conexión a BD exitosa', time: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ success: false, message: '❌ Error conectando a BD', error: error.message });
    }
});

app.get('/api/auth/test', (req, res) => {
    res.json({ success: true, message: '✅ Ruta de autenticación funcionando' });
});

// ===== MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log('═'.repeat(50));
    console.log('🚀 EUROMODADIAZ BACKEND');
    console.log('═'.repeat(50));
    console.log(`✅ Servidor: http://localhost:${PORT}`);
    console.log(`🛍️  Tienda: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🛒 Checkout: http://localhost:${PORT}/checkout`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log('═'.repeat(50));
});