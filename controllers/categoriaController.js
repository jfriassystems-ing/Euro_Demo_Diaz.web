const pool = require('../src/config/database');

const categoriaController = {
    // Obtener todas las categorías
    async getAll(req, res) {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.nombre,
                c.descripcion,
                c.created_at,
                COUNT(p.id) as total_productos
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id
            GROUP BY c.id, c.nombre, c.descripcion, c.created_at
            ORDER BY c.nombre
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
},

    // Crear nueva categoría
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

    // Actualizar categoría
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            
            if (!nombre) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }
            
            // Verificar si existe otra categoría con el mismo nombre
            const existe = await pool.query('SELECT id FROM categorias WHERE nombre ILIKE $1 AND id != $2', [nombre, id]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
            }
            
            const result = await pool.query(
                'UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING id, nombre, descripcion',
                [nombre, descripcion || '', id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
            }
            
            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Eliminar categoría
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