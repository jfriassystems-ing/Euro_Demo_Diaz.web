const pool = require('./database');

const createAllCategories = async () => {
    try {
        console.log('📌 Creando todas las categorías...');

        // 1. Primero limpiar categorías existentes (pero no borrar las que tienen productos)
        const categoriasExistentes = await pool.query('SELECT id, nombre FROM categorias');
        console.log('📋 Categorías existentes:', categoriasExistentes.rows);

        // 2. Definir todas las categorías que queremos
        const categorias = [
            { nombre: 'Ropa', descripcion: 'Prendas de vestir para hombre y mujer', icono: 'fa-tshirt' },
            { nombre: 'Pantalones', descripcion: 'Pantalones, jeans y bermudas', icono: 'fa-user-tie' },
            { nombre: 'Ropa Interior', descripcion: 'Ropa interior, calcetines y pijamas', icono: 'fa-vest' },
            { nombre: 'Calzado', descripcion: 'Zapatos, tenis y sandalias', icono: 'fa-shoe-prints' },
            { nombre: 'Accesorios', descripcion: 'Bolsos, cinturones y joyería', icono: 'fa-gem' },
            { nombre: 'Ofertas', descripcion: 'Productos en promoción', icono: 'fa-tags' }
        ];

        // 3. Insertar o actualizar cada categoría
        for (const cat of categorias) {
            // Verificar si existe
            const existe = await pool.query('SELECT id FROM categorias WHERE nombre = $1', [cat.nombre]);
            
            if (existe.rows.length === 0) {
                // Insertar nueva
                await pool.query(`
                    INSERT INTO categorias (nombre, descripcion)
                    VALUES ($1, $2)
                `, [cat.nombre, cat.descripcion]);
                console.log(`✅ Categoría creada: ${cat.nombre}`);
            } else {
                // Actualizar existente
                await pool.query(`
                    UPDATE categorias 
                    SET descripcion = $1 
                    WHERE nombre = $2
                `, [cat.descripcion, cat.nombre]);
                console.log(`🔄 Categoría actualizada: ${cat.nombre}`);
            }
        }

        // 4. Asignar productos a categorías correctas
        console.log('\n📌 Asignando productos a categorías...');
        
        // Obtener todas las categorías con sus IDs
        const cats = await pool.query('SELECT id, nombre FROM categorias');
        const catMap = {};
        cats.rows.forEach(c => catMap[c.nombre] = c.id);

        // Mapeo de productos por nombre a categoría
        const productMapping = [
            // Ropa
            { nombres: ['Camiseta', 'Polo', 'Vestido', 'Chaqueta', 'Sudadera', 'Camisa'], categoria: 'Ropa' },
            // Pantalones
            { nombres: ['Jeans', 'Pantalón', 'Bermuda', 'Jogger', 'Short'], categoria: 'Pantalones' },
            // Ropa Interior
            { nombres: ['Boxer', 'Calcetines', 'Braguitas', 'Pijama', 'Calzoncillo'], categoria: 'Ropa Interior' },
            // Calzado
            { nombres: ['Tenis', 'Zapatos', 'Sandalias', 'Botas', 'Zapatilla'], categoria: 'Calzado' },
            // Accesorios
            { nombres: ['Bolso', 'Cinturon', 'Gafas', 'Reloj', 'Collar', 'Sombrero'], categoria: 'Accesorios' }
        ];

        // Obtener todos los productos sin categoría o con categoría incorrecta
        const productos = await pool.query(`
            SELECT p.id, p.nombre, p.categoria_id
            FROM productos p
            WHERE p.activo = true
        `);

        let asignados = 0;
        for (const p of productos.rows) {
            let categoriaAsignada = null;
            
            // Buscar coincidencia
            for (const map of productMapping) {
                for (const nombre of map.nombres) {
                    if (p.nombre.toLowerCase().includes(nombre.toLowerCase())) {
                        categoriaAsignada = map.categoria;
                        break;
                    }
                }
                if (categoriaAsignada) break;
            }

            // Si no tiene categoría, asignar a 'Ofertas' como fallback
            if (!categoriaAsignada) {
                categoriaAsignada = 'Ofertas';
            }

            const catId = catMap[categoriaAsignada];
            if (catId && p.categoria_id !== catId) {
                await pool.query('UPDATE productos SET categoria_id = $1 WHERE id = $2', [catId, p.id]);
                console.log(`   ✅ ${p.nombre} → ${categoriaAsignada}`);
                asignados++;
            }
        }

        console.log(`\n📊 ${asignados} productos asignados a categorías`);

        // 5. Verificar resultado final
        const resultado = await pool.query(`
            SELECT 
                c.id,
                c.nombre, 
                c.descripcion,
                COUNT(p.id) as total_productos
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre
        `);
        
        console.log('\n📋 RESUMEN FINAL DE CATEGORÍAS:');
        console.log('====================================');
        resultado.rows.forEach(row => {
            console.log(`   📁 ${row.nombre}: ${row.total_productos} productos`);
        });
        console.log('====================================');

        console.log('\n🎉 Todas las categorías creadas exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

createAllCategories();