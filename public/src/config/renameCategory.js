const pool = require('./database');

const renameCategory = async () => {
    try {
        console.log('📌 Cambiando nombre de categoría...');

        // Cambiar "Ropa" a "Poloche/Camisa"
        const result = await pool.query(`
            UPDATE categorias 
            SET nombre = 'Poloche/Camisa' 
            WHERE nombre = 'Ropa'
            RETURNING id, nombre
        `);

        if (result.rows.length > 0) {
            console.log(`✅ Categoría actualizada: ${result.rows[0].nombre}`);
        } else {
            console.log('ℹ️ No se encontró la categoría "Ropa"');
        }

        // Verificar categorías finales
        const categorias = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
        console.log('\n📋 Categorías actuales:');
        categorias.rows.forEach(c => {
            console.log(`   📁 ${c.nombre}`);
        });

        console.log('\n🎉 Proceso completado');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

renameCategory();