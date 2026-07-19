const pool = require('../src/config/database');

const productoModel = {
    async getAll() {
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
        return result.rows;
    },

    async getById(id) {
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
        return result.rows[0] || null;
    },

    async create(data) {
        const { nombre, descripcion, precio, categoria_id, marca_id, sku } = data;
        const query = `
            INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, sku)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await pool.query(query, [nombre, descripcion, precio, categoria_id, marca_id, sku]);
        return result.rows[0];
    },

    async update(id, data) {
        const { nombre, descripcion, precio, categoria_id, marca_id, sku, activo } = data;
        const query = `
            UPDATE productos 
            SET nombre = $1, descripcion = $2, precio = $3, 
                categoria_id = $4, marca_id = $5, sku = $6, activo = $7
            WHERE id = $8
            RETURNING *
        `;
        const result = await pool.query(query, [nombre, descripcion, precio, categoria_id, marca_id, sku, activo, id]);
        return result.rows[0];
    },

   // ELIMINAR PRODUCTO (HARD DELETE - FÍSICO)
async delete(id) {
    // 1. Eliminar imágenes
    await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [id]);
    
    // 2. Eliminar variantes
    await pool.query('DELETE FROM variantes_producto WHERE producto_id = $1', [id]);
    
    // 3. Eliminar inventario
    await pool.query(`
        DELETE FROM inventario 
        WHERE variante_id IN (SELECT id FROM variantes_producto WHERE producto_id = $1)
    `, [id]);
    
    // 4. Eliminar el producto
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
},

    async search(term) {
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
        const result = await pool.query(query, [`%${term}%`]);
        return result.rows;
    },

    async getByCategoria(categoriaId) {
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
        return result.rows;
    }
};

module.exports = productoModel;