const pool = require('./database');

const cleanCategoriesFinal = async () => {
    try {
        console.log('🧹 Limpiando categorías duplicadas (versión final)...');

        // IDs a mantener (las que tienen productos)
        const keepIds = [9, 10, 11];
        console.log('✅ IDs a mantener:', keepIds);

        // 1. Obtener todas las categorías
        const categorias = await pool.query('SELECT id, nombre FROM categorias');
        
        // 2. Eliminar duplicados (excepto los que tienen productos)
        for (const cat of categorias.rows) {
            if (!keepIds.includes(cat.id)) {
                // Primero actualizar productos que usan esta categoría (NULL)
                await pool.query('UPDATE productos SET categoria_id = NULL WHERE categoria_id = $1', [cat.id]);
                // Luego eliminar la categoría
                await pool.query('DELETE FROM categorias WHERE id = $1', [cat.id]);
                console.log(`🗑️ Eliminada categoría ID ${cat.id} (${cat.nombre})`);
            }
        }

        // 3. Verificar resultado final
        const result = await pool.query(`
            SELECT c.id, c.nombre, COUNT(p.id) as total_productos
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
            GROUP BY c.id, c.nombre
            ORDER BY c.nombre
        `);
        console.log('📊 Categorías finales:', result.rows);

        console.log('🎉 Limpieza completada');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

cleanCategoriesFinal();