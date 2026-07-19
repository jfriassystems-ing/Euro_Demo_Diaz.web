const pool = require('../src/config/database');

// Generar SKU único automáticamente
function generarSKU(nombre, categoria_id, marca_id) {
    const prefix = nombre.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${random}-${timestamp}`;
}

const productoController = {
    // Obtener todos los productos
    async getAll(req, res) {
        try {
            const query = `
                SELECT p.*, 
                       c.nombre as categoria,
                       m.nombre as marca,
                       (SELECT url FROM producto_imagenes WHERE producto_id = p.id AND principal = true LIMIT 1) as imagen_principal
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN marcas m ON p.marca_id = m.id
                WHERE p.activo = true
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Productos en oferta
    async getOfertas(req, res) {
        try {
            const query = `
                SELECT p.*, 
                       c.nombre as categoria,
                       m.nombre as marca,
                       (SELECT url FROM producto_imagenes WHERE producto_id = p.id AND principal = true LIMIT 1) as imagen_principal
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN marcas m ON p.marca_id = m.id
                WHERE p.activo = true AND p.en_oferta = true
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Obtener producto por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const query = `
                SELECT p.*, 
                       c.nombre as categoria,
                       m.nombre as marca,
                       (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'principal', pi.principal)) 
                        FROM producto_imagenes pi WHERE pi.producto_id = p.id) as imagenes,
                       (SELECT json_agg(
                            json_build_object(
                                'id', v.id, 
                                'color', col.nombre,
                                'color_hex', col.codigo_hex,
                                'talla', t.nombre,
                                'material', mat.nombre,
                                'stock', v.stock,
                                'precio_extra', v.precio_extra
                            )
                       ) FROM variantes_producto v 
                         LEFT JOIN colores col ON v.color_id = col.id
                         LEFT JOIN tallas t ON v.talla_id = t.id
                         LEFT JOIN materiales mat ON v.material_id = mat.id
                       WHERE v.producto_id = p.id) as variantes
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN marcas m ON p.marca_id = m.id
                WHERE p.id = $1
            `;
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Crear producto con imágenes
    async create(req, res) {
        try {
            let { nombre, descripcion, precio, categoria_id, marca_id, sku, activo, agotado, en_oferta, imagenes } = req.body;
            
            if (!nombre || !precio) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y precio son requeridos'
                });
            }
            
            if (!sku) {
                sku = generarSKU(nombre, categoria_id, marca_id);
            }
            
            const existe = await pool.query('SELECT id FROM productos WHERE sku = $1', [sku]);
            if (existe.rows.length > 0) {
                sku = `${sku}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
            }
            
            const query = `
                INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, sku, activo, agotado, en_oferta)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, descripcion, precio, categoria_id, marca_id, sku, activo !== false, agotado || false, en_oferta || false]);
            const producto = result.rows[0];
            
            // Si hay imágenes, guardarlas
            if (imagenes && imagenes.length > 0) {
                for (let i = 0; i < imagenes.length; i++) {
                    const img = imagenes[i];
                    await pool.query(
                        'INSERT INTO producto_imagenes (producto_id, url, principal) VALUES ($1, $2, $3)',
                        [producto.id, img.url, img.principal || (i === 0)]
                    );
                }
            }
            
            res.status(201).json({
                success: true,
                message: 'Producto creado con imágenes',
                data: producto
            });
            
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Actualizar producto con imágenes
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, categoria_id, marca_id, sku, activo, agotado, en_oferta, imagenes } = req.body;
            
            const query = `
                UPDATE productos 
                SET nombre = $1, descripcion = $2, precio = $3, 
                    categoria_id = $4, marca_id = $5, sku = $6, 
                    activo = $7, agotado = $8, en_oferta = $9
                WHERE id = $10
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, descripcion, precio, categoria_id, marca_id, sku, activo, agotado || false, en_oferta || false, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            
            const producto = result.rows[0];
            
            // Si hay imágenes, actualizarlas
            if (imagenes && imagenes.length > 0) {
                await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [id]);
                
                for (let i = 0; i < imagenes.length; i++) {
                    const img = imagenes[i];
                    await pool.query(
                        'INSERT INTO producto_imagenes (producto_id, url, principal) VALUES ($1, $2, $3)',
                        [producto.id, img.url, img.principal || (i === 0)]
                    );
                }
            }
            
            res.json({ success: true, data: producto });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

  // ELIMINAR UN PRODUCTO ESPECÍFICO (HARD DELETE - FÍSICO)
async delete(req, res) {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Eliminando producto ID:', id);
        
        // Verificar si el producto existe
        const existe = await pool.query('SELECT id FROM productos WHERE id = $1', [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        // 1. Eliminar imágenes del producto
        await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [id]);
        console.log('✅ Imágenes eliminadas');
        
        // 2. Eliminar variantes del producto
        await pool.query('DELETE FROM variantes_producto WHERE producto_id = $1', [id]);
        console.log('✅ Variantes eliminadas');
        
        // 3. Eliminar inventario del producto
        await pool.query(`
            DELETE FROM inventario 
            WHERE variante_id IN (SELECT id FROM variantes_producto WHERE producto_id = $1)
        `, [id]);
        console.log('✅ Inventario eliminado');
        
        // 4. Eliminar el producto
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        console.log('✅ Producto eliminado');
        
        res.json({ 
            success: true, 
            message: 'Producto eliminado permanentemente' 
        });
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
},

    // Buscar productos
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Término de búsqueda requerido' });
            }
            const query = `
                SELECT p.*, 
                       c.nombre as categoria,
                       (SELECT url FROM producto_imagenes WHERE producto_id = p.id AND principal = true LIMIT 1) as imagen_principal
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.activo = true 
                AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1)
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query, [`%${q}%`]);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Productos por categoría
    async getByCategoria(req, res) {
        try {
            const { categoriaId } = req.params;
            const query = `
                SELECT p.*, 
                       c.nombre as categoria,
                       (SELECT url FROM producto_imagenes WHERE producto_id = p.id AND principal = true LIMIT 1) as imagen_principal
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.activo = true AND p.categoria_id = $1
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query, [categoriaId]);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = productoController;