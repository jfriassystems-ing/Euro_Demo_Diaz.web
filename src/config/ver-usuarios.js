const pool = require('./src/config/db'); // Asegúrate de que esta ruta apunte a tu archivo de conexión

async function consultarUsuarios() {
    try {
        const resultado = await pool.query('SELECT * FROM usuarios;'); // Si tu tabla se llama diferente, cámbialo aquí
        console.table(resultado.rows);
        process.exit(0);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error.message);
        process.exit(1);
    }
}

consultarUsuarios();
