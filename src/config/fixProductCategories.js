const pool = require('./database');

const fixProductCategories = async () => {
    try {
        console.log('🔧 Actualizando categorías de productos...');

        // 1. Obtener las categorías correctas
        const categorias = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
        console.log('📋 Categorías disponibles:', categorias.rows);

        // 2. Mapeo de nombres a IDs
        const catMap = {};
        categorias.rows.forEach(c => catMap[c.nombre] = c.id);

        // 3. Obtener todos los productos
        const productos = await pool.query(`
            SELECT p.id, p.nombre, p.categoria_id, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `);
        console.log(`📦 ${productos.rows.length} productos encontrados`);

        // 4. Actualizar cada producto con la categoría correcta según su nombre
        for (const p of productos.rows) {
            let nuevaCategoria = null;
            
            // Determinar categoría según el nombre del producto
            const nombreLower = p.nombre.toLowerCase();
            if (nombreLower.includes('camiseta') || nombreLower.includes('polo') || 
                nombreLower.includes('jeans') || nombreLower.includes('chaqueta') ||
                nombreLower.includes('vestido') || nombreLower.includes('sudadera')) {
                nuevaCategoria = catMap['Ropa'];
            } else if (nombreLower.includes('tenis') || nombreLower.includes('zapatos') ||
                       nombreLower.includes('sandalias') || nombreLower.includes('botas')) {
                nuevaCategoria = catMap['Calzado'];
            } else if (nombreLower.includes('bolso') || nombreLower.includes('cinturon') ||
                       nombreLower.includes('gafas') || nombreLower.includes('reloj') ||
                       nombreLower.includes('collar') || nombreLower.includes('sombrero')) {
                nuevaCategoria = catMap['Accesorios'];
            } else if (nombreLower.includes('oferta')) {
                nuevaCategoria = catMap['Ofertas'];
            }

            if (nuevaCategoria) {
                await pool.query('UPDATE productos SET categoria_id = $1 WHERE id = $2', [nuevaCategoria, p.id]);
                console.log(`✅ ${p.nombre} → ${Object.keys(catMap).find(k => catMap[k] === nuevaCategoria)}`);
            } else {
                console.log(`⚠️ ${p.nombre} - sin categoría asignada`);
            }
        }

        // 5. Verificar resultado
        const result = await pool.query(`
            SELECT c.nombre as categoria, COUNT(p.id) as total
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
            GROUP BY c.id, c.nombre
            ORDER BY c.nombre
        `);
        console.log('📊 Resumen:', result.rows);

        console.log('🎉 Categorías actualizadas');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixProductCategories();