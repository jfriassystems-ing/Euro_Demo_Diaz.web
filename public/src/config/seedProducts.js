const pool = require('./database');

const seedProducts = async () => {
    try {
        console.log('🌱 Insertando productos de ejemplo...');

        // 1. Insertar categorías (solo si no existen)
        await pool.query(`
            INSERT INTO categorias (nombre, descripcion)
            SELECT * FROM (VALUES 
                ('Ropa', 'Prendas de vestir para hombre y mujer'),
                ('Calzado', 'Zapatos, tenis y sandalias'),
                ('Accesorios', 'Bolsos, cinturones y joyería'),
                ('Ofertas', 'Productos en promocion')
            ) AS v(nombre, descripcion)
            WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE categorias.nombre = v.nombre)
        `);
        console.log('✅ Categorías insertadas');

        // 2. Insertar marcas (solo si no existen)
        await pool.query(`
            INSERT INTO marcas (nombre)
            SELECT * FROM (VALUES 
                ('Nike'),
                ('Adidas'),
                ('Puma'),
                ('Zara'),
                ('H&M'),
                ('Levis'),
                ('Calvin Klein'),
                ('Tommy Hilfiger')
            ) AS v(nombre)
            WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE marcas.nombre = v.nombre)
        `);
        console.log('✅ Marcas insertadas');

        // 3. Insertar colores (solo si no existen)
        await pool.query(`
            INSERT INTO colores (nombre, codigo_hex)
            SELECT * FROM (VALUES 
                ('Negro', '#000000'),
                ('Blanco', '#FFFFFF'),
                ('Rojo', '#E74C3C'),
                ('Azul', '#2E86C1'),
                ('Verde', '#27AE60'),
                ('Amarillo', '#F1C40F'),
                ('Gris', '#95A5A6'),
                ('Rosado', '#F8A5C2'),
                ('Marrón', '#8D6E63'),
                ('Naranja', '#F39C12')
            ) AS v(nombre, codigo_hex)
            WHERE NOT EXISTS (SELECT 1 FROM colores WHERE colores.nombre = v.nombre)
        `);
        console.log('✅ Colores insertados');

        // 4. Insertar tallas (solo si no existen)
        await pool.query(`
            INSERT INTO tallas (nombre, tipo)
            SELECT * FROM (VALUES 
                ('XS', 'ropa'),
                ('S', 'ropa'),
                ('M', 'ropa'),
                ('L', 'ropa'),
                ('XL', 'ropa'),
                ('XXL', 'ropa'),
                ('36', 'calzado'),
                ('37', 'calzado'),
                ('38', 'calzado'),
                ('39', 'calzado'),
                ('40', 'calzado'),
                ('41', 'calzado'),
                ('42', 'calzado'),
                ('43', 'calzado'),
                ('44', 'calzado')
            ) AS v(nombre, tipo)
            WHERE NOT EXISTS (SELECT 1 FROM tallas WHERE tallas.nombre = v.nombre)
        `);
        console.log('✅ Tallas insertadas');

        // 5. Insertar materiales (solo si no existen)
        await pool.query(`
            INSERT INTO materiales (nombre)
            SELECT * FROM (VALUES 
                ('Algodón'),
                ('Poliéster'),
                ('Lana'),
                ('Seda'),
                ('Cuero'),
                ('Lona'),
                ('Gamuza'),
                ('Nylon'),
                ('Spandex'),
                ('Denim')
            ) AS v(nombre)
            WHERE NOT EXISTS (SELECT 1 FROM materiales WHERE materiales.nombre = v.nombre)
        `);
        console.log('✅ Materiales insertados');

        // 6. Obtener IDs de categorías y marcas
        const categorias = await pool.query('SELECT id, nombre FROM categorias');
        const marcas = await pool.query('SELECT id, nombre FROM marcas');

        const catMap = {};
        categorias.rows.forEach(c => catMap[c.nombre] = c.id);

        const marcaMap = {};
        marcas.rows.forEach(m => marcaMap[m.nombre] = m.id);

        // 7. Insertar productos (Ropa) - solo si no existen
        const productosRopa = [
            { nombre: 'Camiseta Basica Negra', descripcion: 'Camiseta de algodon 100%', precio: 899, categoria: 'Ropa', marca: 'Zara' },
            { nombre: 'Polo Blanco Casual', descripcion: 'Polo elegante para todo momento', precio: 1299, categoria: 'Ropa', marca: 'Tommy Hilfiger' },
            { nombre: 'Jeans Azul Clasico', descripcion: 'Jeans recto de denim', precio: 2499, categoria: 'Ropa', marca: 'Levis' },
            { nombre: 'Chaqueta Cuero Negra', descripcion: 'Chaqueta de cuero genuino', precio: 5999, categoria: 'Ropa', marca: 'Calvin Klein' },
            { nombre: 'Vestido Floral', descripcion: 'Vestido veraniego con estampado', precio: 1899, categoria: 'Ropa', marca: 'Zara' },
            { nombre: 'Sudadera Oversize Gris', descripcion: 'Sudadera comoda y moderna', precio: 1599, categoria: 'Ropa', marca: 'H&M' }
        ];

        for (const p of productosRopa) {
            await pool.query(`
                INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, sku, activo)
                SELECT $1, $2, $3, $4, $5, $6, true
                WHERE NOT EXISTS (SELECT 1 FROM productos WHERE productos.nombre = $1)
            `, [p.nombre, p.descripcion, p.precio, catMap[p.categoria], marcaMap[p.marca], `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`]);
        }
        console.log('✅ Productos de ropa insertados');

        // 8. Insertar productos (Calzado)
        const productosCalzado = [
            { nombre: 'Tenis Deportivos Blancos', descripcion: 'Tenis ligeros para running', precio: 3999, categoria: 'Calzado', marca: 'Nike' },
            { nombre: 'Zapatos Casual Cafe', descripcion: 'Zapatos de cuero para oficina', precio: 4599, categoria: 'Calzado', marca: 'Adidas' },
            { nombre: 'Sandalias Verano', descripcion: 'Sandalias comodas para playa', precio: 1299, categoria: 'Calzado', marca: 'Puma' },
            { nombre: 'Botas Taco Alto', descripcion: 'Botas elegantes para ocasiones especiales', precio: 5499, categoria: 'Calzado', marca: 'Zara' }
        ];

        for (const p of productosCalzado) {
            await pool.query(`
                INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, sku, activo)
                SELECT $1, $2, $3, $4, $5, $6, true
                WHERE NOT EXISTS (SELECT 1 FROM productos WHERE productos.nombre = $1)
            `, [p.nombre, p.descripcion, p.precio, catMap[p.categoria], marcaMap[p.marca], `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`]);
        }
        console.log('✅ Productos de calzado insertados');

        // 9. Insertar productos (Accesorios)
        const productosAccesorios = [
            { nombre: 'Bolso de Mano Negro', descripcion: 'Bolso elegante para mujer', precio: 3299, categoria: 'Accesorios', marca: 'Calvin Klein' },
            { nombre: 'Cinturon Cuero Marron', descripcion: 'Cinturon clasico de cuero', precio: 1499, categoria: 'Accesorios', marca: 'Tommy Hilfiger' },
            { nombre: 'Gafas de Sol Polarizadas', descripcion: 'Gafas con proteccion UV', precio: 2899, categoria: 'Accesorios', marca: 'Puma' },
            { nombre: 'Reloj Deportivo', descripcion: 'Reloj resistente al agua', precio: 4999, categoria: 'Accesorios', marca: 'Nike' },
            { nombre: 'Collar Plata', descripcion: 'Collar de plata 925', precio: 2199, categoria: 'Accesorios', marca: 'Zara' },
            { nombre: 'Sombrero Playero', descripcion: 'Sombrero de ala ancha', precio: 999, categoria: 'Accesorios', marca: 'H&M' }
        ];

        for (const p of productosAccesorios) {
            await pool.query(`
                INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, sku, activo)
                SELECT $1, $2, $3, $4, $5, $6, true
                WHERE NOT EXISTS (SELECT 1 FROM productos WHERE productos.nombre = $1)
            `, [p.nombre, p.descripcion, p.precio, catMap[p.categoria], marcaMap[p.marca], `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`]);
        }
        console.log('✅ Productos de accesorios insertados');

        console.log('🎉 Todos los productos de ejemplo insertados exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error insertando productos:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

seedProducts();