const pool = require('../src/config/database');

const marcaController = {
    // Obtener todas las marcas
    async getAll(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    m.id,
                    m.nombre,
                    m.created_at,
                    COUNT(p.id) as total_productos
                FROM marcas m
                LEFT JOIN productos p ON p.marca_id = m.id
                GROUP BY m.id, m.nombre, m.created_at
                ORDER BY m.nombre
            `);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Crear nueva marca
    async create(req, res) {
        try {
            const { nombre } = req.body;
            
            if (!nombre) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El nombre es requerido' 
                });
            }
            
            const existe = await pool.query(
                'SELECT id FROM marcas WHERE nombre ILIKE $1', 
                [nombre]
            );
            
            if (existe.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Esta marca ya existe' 
                });
            }
            
            const result = await pool.query(
                'INSERT INTO marcas (nombre) VALUES ($1) RETURNING id, nombre',
                [nombre]
            );
            
            res.status(201).json({ 
                success: true, 
                data: result.rows[0] 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    },

    // Actualizar marca
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            
            if (!nombre) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El nombre es requerido' 
                });
            }
            
            const existe = await pool.query(
                'SELECT id FROM marcas WHERE nombre ILIKE $1 AND id != $2', 
                [nombre, id]
            );
            
            if (existe.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Ya existe una marca con ese nombre' 
                });
            }
            
            const result = await pool.query(
                'UPDATE marcas SET nombre = $1 WHERE id = $2 RETURNING id, nombre',
                [nombre, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Marca no encontrada' 
                });
            }
            
            res.json({ 
                success: true, 
                data: result.rows[0] 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    },

    // ELIMINAR MARCA (HARD DELETE)
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const existe = await pool.query('SELECT id FROM marcas WHERE id = $1', [id]);
            if (existe.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Marca no encontrada' 
                });
            }
            
            const productos = await pool.query(
                'SELECT id FROM productos WHERE marca_id = $1', 
                [id]
            );
            
            if (productos.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede eliminar, hay productos asociados a esta marca' 
                });
            }
            
            await pool.query('DELETE FROM marcas WHERE id = $1', [id]);
            
            res.json({ 
                success: true, 
                message: 'Marca eliminada permanentemente' 
            });
        } catch (error) {
            console.error('Error al eliminar marca:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }
};

module.exports = marcaController;