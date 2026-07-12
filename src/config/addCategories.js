const pool = require('./database');

const addCategories = async () => {
    try {
        console.log('📌 Agregando nuevas categorías...');

        // Agregar categorías que faltan
        const nuevasCategorias = [
            { nombre: 'Pantalones', descripcion: 'Pantalones, jeans y bermudas' },
            { nombre: 'Ropa Interior', descripcion: 'Ropa interior, calcetines y pijamas' }
        ];

        for (const cat of nuevasCategorias) {
            const result = await pool.query(`
                INSERT INTO categorias (nombre, descripcion)
                SELECT $1, $2
                WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = $1)
                RETURNING id, nombre
            `, [cat.nombre, cat.descripcion]);
            
            if (result.rows.length > 0) {
                console.log(`✅ Categoría agregada: ${cat.nombre}`);
            } else {
                console.log(`ℹ️ La categoría "${cat.nombre}" ya existe`);
            }
        }

        // Verificar categorías finales
        const resultado = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
        console.log('📋 Categorías disponibles:', resultado.rows);

        console.log('🎉 Proceso completado');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

addCategories();