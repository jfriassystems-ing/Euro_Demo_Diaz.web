const pool = require('../src/config/database');
const cloudinary = require('../src/config/cloudinary');

const imagenController = {
    async uploadProductImage(req, res) {
        try {
            const { producto_id, principal } = req.body;
            
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No hay imagen' });
            }

            if (!producto_id) {
                return res.status(400).json({ success: false, message: 'Producto requerido' });
            }

            const publicUrl = req.file.path;

            const result = await pool.query(
                'INSERT INTO producto_imagenes (producto_id, url, principal) VALUES ($1, $2, $3) RETURNING id, url, principal',
                [producto_id, publicUrl, principal === 'true']
            );

            if (principal === 'true') {
                await pool.query('UPDATE producto_imagenes SET principal = false WHERE producto_id = $1 AND id != $2', [producto_id, result.rows[0].id]);
            }

            res.json({ success: true, message: 'Imagen subida a Cloudinary', data: result.rows[0] });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async uploadTempImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No hay imagen'
                });
            }

            const publicUrl = req.file.path;

            res.json({
                success: true,
                message: 'Imagen subida temporalmente',
                data: {
                    url: publicUrl,
                    public_id: req.file.filename || publicUrl.split('/').pop().split('.')[0]
                }
            });

        } catch (error) {
            console.error('Error en uploadTempImage:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async deleteImage(req, res) {
        try {
            const { id } = req.params;
            const imagen = await pool.query('SELECT url FROM producto_imagenes WHERE id = $1', [id]);
            if (imagen.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No encontrada' });
            }

            const url = imagen.rows[0].url;
            const publicId = url.split('/').slice(7).join('/').split('.')[0];
            
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }

            await pool.query('DELETE FROM producto_imagenes WHERE id = $1', [id]);
            res.json({ success: true, message: 'Imagen eliminada' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getProductImages(req, res) {
        try {
            const { producto_id } = req.params;
            const result = await pool.query(
                'SELECT id, url, principal FROM producto_imagenes WHERE producto_id = $1 ORDER BY principal DESC',
                [producto_id]
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async setPrincipal(req, res) {
        try {
            const { id } = req.params;
            const imagen = await pool.query('SELECT producto_id FROM producto_imagenes WHERE id = $1', [id]);
            if (imagen.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No encontrada' });
            }

            const producto_id = imagen.rows[0].producto_id;
            await pool.query('UPDATE producto_imagenes SET principal = false WHERE producto_id = $1', [producto_id]);
            await pool.query('UPDATE producto_imagenes SET principal = true WHERE id = $1', [id]);
            res.json({ success: true, message: 'Principal actualizada' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = imagenController;