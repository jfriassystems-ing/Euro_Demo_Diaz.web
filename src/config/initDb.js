const pool = require('./database');

const createTables = async () => {
    try {
        console.log('🔨 Creando tablas...');

        // 1. Usuarios Administradores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios_admin (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                rol VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla usuarios_admin creada');

        // 2. Clientes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                telefono VARCHAR(20) NOT NULL,
                direccion TEXT NOT NULL,
                referencia TEXT,
                ciudad VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla clientes creada');

        // 3. Categorías
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla categorias creada');

        // 4. Marcas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marcas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla marcas creada');

        // 5. Productos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10,2) NOT NULL,
                categoria_id INTEGER REFERENCES categorias(id),
                marca_id INTEGER REFERENCES marcas(id),
                sku VARCHAR(100) UNIQUE,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla productos creada');

        // 6. Producto Imágenes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS producto_imagenes (
                id SERIAL PRIMARY KEY,
                producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
                url TEXT NOT NULL,
                principal BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla producto_imagenes creada');

        // 7. Colores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS colores (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                codigo_hex VARCHAR(7)
            )
        `);
        console.log('✅ Tabla colores creada');

        // 8. Tallas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tallas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(20) NOT NULL,
                tipo VARCHAR(50) -- EJ: 'ropa', 'calzado'
            )
        `);
        console.log('✅ Tabla tallas creada');

        // 9. Materiales
        await pool.query(`
            CREATE TABLE IF NOT EXISTS materiales (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            )
        `);
        console.log('✅ Tabla materiales creada');

        // 10. Variantes Producto
        await pool.query(`
            CREATE TABLE IF NOT EXISTS variantes_producto (
                id SERIAL PRIMARY KEY,
                producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
                color_id INTEGER REFERENCES colores(id),
                talla_id INTEGER REFERENCES tallas(id),
                material_id INTEGER REFERENCES materiales(id),
                precio_extra DECIMAL(10,2) DEFAULT 0,
                stock INTEGER DEFAULT 0,
                sku_variante VARCHAR(100) UNIQUE
            )
        `);
        console.log('✅ Tabla variantes_producto creada');

        // 11. Inventario
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventario (
                id SERIAL PRIMARY KEY,
                variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE CASCADE,
                cantidad INTEGER DEFAULT 0,
                ubicacion VARCHAR(100),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla inventario creada');

        // 12. Pedidos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id),
                cliente_nombre VARCHAR(100) NOT NULL,
                cliente_telefono VARCHAR(20) NOT NULL,
                cliente_email VARCHAR(255),
                cliente_direccion TEXT NOT NULL,
                cliente_referencia TEXT,
                total DECIMAL(10,2) NOT NULL,
                estado VARCHAR(50) DEFAULT 'Pendiente',
                metodo_pago VARCHAR(50),
                fecha_confirmacion TIMESTAMP,
                fecha_preparacion TIMESTAMP,
                fecha_entrega TIMESTAMP,
                fecha_cancelacion TIMESTAMP,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla pedidos creada');

        // 13. Detalle Pedidos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS detalle_pedidos (
                id SERIAL PRIMARY KEY,
                pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
                producto_id INTEGER REFERENCES productos(id),
                producto_nombre VARCHAR(200) NOT NULL,
                variante_descripcion VARCHAR(255),
                cantidad INTEGER NOT NULL,
                precio_unitario DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL
            )
        `);
        console.log('✅ Tabla detalle_pedidos creada');

        // 14. Historial Pedido
        await pool.query(`
            CREATE TABLE IF NOT EXISTS historial_pedido (
                id SERIAL PRIMARY KEY,
                pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
                estado_anterior VARCHAR(50),
                estado_nuevo VARCHAR(50) NOT NULL,
                observacion TEXT,
                usuario_id INTEGER REFERENCES usuarios_admin(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla historial_pedido creada');

        console.log('🎉 Todas las tablas creadas exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando tablas:', error.message);
        process.exit(1);
    }
};

createTables();