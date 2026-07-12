const pool = require('../src/config/database');

const marcaController = {
    async getAll(req, res) {
        try {
            const result = await pool.query('SELECT id, nombre FROM marcas ORDER BY nombre');
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async create(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }
            
            const existe = await pool.query('SELECT id FROM marcas WHERE nombre ILIKE $1', [nombre]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Esta marca ya existe' });
            }
            
            const result = await pool.query(
                'INSERT INTO marcas (nombre) VALUES ($1) RETURNING id, nombre',
                [nombre]
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const productos = await pool.query('SELECT id FROM productos WHERE marca_id = $1', [id]);
            if (productos.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede eliminar, hay productos asociados a esta marca' 
                });
            }
            
            await pool.query('DELETE FROM marcas WHERE id = $1', [id]);
            res.json({ success: true, message: 'Marca eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = marcaController;