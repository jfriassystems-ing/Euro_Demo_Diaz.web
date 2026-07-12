const pool = require('../src/config/database');

const categoriaController = {
    async getAll(req, res) {
        try {
            const result = await pool.query(`
                SELECT c.*, COUNT(p.id) as total_productos
                FROM categorias c
                LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
                GROUP BY c.id
                ORDER BY c.nombre
            `);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async create(req, res) {
        try {
            const { nombre, descripcion } = req.body;
            if (!nombre) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }
            
            const existe = await pool.query('SELECT id FROM categorias WHERE nombre ILIKE $1', [nombre]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Esta categoría ya existe' });
            }
            
            const result = await pool.query(
                'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING id, nombre, descripcion',
                [nombre, descripcion || '']
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const productos = await pool.query('SELECT id FROM productos WHERE categoria_id = $1', [id]);
            if (productos.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede eliminar, hay productos asociados a esta categoría' 
                });
            }
            
            await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
            res.json({ success: true, message: 'Categoría eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = categoriaController;