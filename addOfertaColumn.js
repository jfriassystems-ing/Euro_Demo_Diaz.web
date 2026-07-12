const pool = require('./src/config/database');

const addOfertaColumn = async () => {
    try {
        console.log('📌 Agregando columna en_oferta a productos...');
        
        await pool.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS en_oferta BOOLEAN DEFAULT false
        `);
        
        console.log('✅ Columna en_oferta agregada correctamente');
        
        // Verificar
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'productos' AND column_name = 'en_oferta'
        `);
        
        console.log('📋 Columna verificada:', result.rows);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

addOfertaColumn();