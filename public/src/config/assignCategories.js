const pool = require('./database');

const assignCategories = async () => {
    try {
        console.log('📌 Asignando productos a categorías...');

        // 1. Obtener IDs de las categorías finales
        const categorias = await pool.query('SELECT id, nombre FROM categorias');
        console.log('📋 Categorías disponibles:', categorias.rows);

        const catMap = {};
        categorias.rows.forEach(c => catMap[c.nombre] = c.id);

        // 2. Obtener todos los productos sin categoría
        const productos = await pool.query(`
            SELECT id, nombre FROM productos WHERE categoria_id IS NULL OR categoria_id NOT IN (SELECT id FROM categorias)
        `);
        console.log(`📦 ${productos.rows.length} productos sin categoría`);

        // 3. Asignar categoría según nombre
        let actualizados = 0;
        for (const p of productos.rows) {
            const nombreLower = p.nombre.toLowerCase();
            let categoriaId = null;

            if (nombreLower.includes('camiseta') || nombreLower.includes('polo') || 
                nombreLower.includes('jeans') || nombreLower.includes('chaqueta') ||
                nombreLower.includes('vestido') || nombreLower.includes('sudadera')) {
                categoriaId = catMap['Ropa'];
            } else if (nombreLower.includes('tenis') || nombreLower.includes('zapatos') ||
                       nombreLower.includes('sandalias') || nombreLower.includes('botas')) {
                categoriaId = catMap['Calzado'];
            } else if (nombreLower.includes('bolso') || nombreLower.includes('cinturon') ||
                       nombreLower.includes('gafas') || nombreLower.includes('reloj') ||
                       nombreLower.includes('collar') || nombreLower.includes('sombrero')) {
                categoriaId = catMap['Accesorios'];
            }

            if (categoriaId) {
                await pool.query('UPDATE productos SET categoria_id = $1 WHERE id = $2', [categoriaId, p.id]);
                console.log(`✅ ${p.nombre} → ${Object.keys(catMap).find(k => catMap[k] === categoriaId)}`);
                actualizados++;
            }
        }

        // 4. Verificar resultado
        const result = await pool.query(`
            SELECT c.nombre as categoria, COUNT(p.id) as total
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
            GROUP BY c.id, c.nombre
            ORDER BY c.nombre
        `);
        console.log('📊 Resumen final:', result.rows);

        console.log(`🎉 ${actualizados} productos actualizados`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

assignCategories();