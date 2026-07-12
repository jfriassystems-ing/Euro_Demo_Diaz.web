const pool = require('../src/config/database');

const pedidoController = {
    async create(req, res) {
        const client = await pool.connect();
        
        try {
            const { cliente, items, total, metodo_pago, notas } = req.body;
            
            console.log('📦 Recibiendo pedido:', req.body);

            await client.query('BEGIN');

            const clienteResult = await client.query(`
                INSERT INTO clientes (nombre, telefono, email, direccion, referencia, ciudad)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [cliente.nombre, cliente.telefono, cliente.email, cliente.direccion, cliente.referencia, cliente.ciudad]);

            const clienteId = clienteResult.rows[0].id;

            const pedidoResult = await client.query(`
                INSERT INTO pedidos (
                    cliente_id, cliente_nombre, cliente_telefono, cliente_email,
                    cliente_direccion, cliente_referencia, total, estado, metodo_pago, notas
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                clienteId,
                cliente.nombre,
                cliente.telefono,
                cliente.email || '',
                cliente.direccion || 'No especificada',
                cliente.referencia || '',
                total,
                'Pendiente',
                metodo_pago || 'Efectivo',
                notas || ''
            ]);

            const pedidoId = pedidoResult.rows[0].id;

            for (const item of items) {
                await client.query(`
                    INSERT INTO detalle_pedidos (
                        pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    pedidoId,
                    item.id,
                    item.nombre,
                    item.cantidad,
                    item.precio,
                    item.subtotal
                ]);
            }

            await client.query(`
                INSERT INTO historial_pedido (pedido_id, estado_nuevo, observacion)
                VALUES ($1, $2, $3)
            `, [pedidoId, 'Pendiente', 'Pedido creado por el cliente']);

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: {
                    id: pedidoId,
                    cliente: cliente.nombre,
                    total: total,
                    estado: 'Pendiente'
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error al crear pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear pedido',
                error: error.message
            });
        } finally {
            client.release();
        }
    },

    async getAll(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    p.id,
                    p.cliente_nombre,
                    p.cliente_telefono,
                    p.total,
                    p.estado,
                    p.created_at,
                    p.metodo_pago,
                    COUNT(d.id) as total_items
                FROM pedidos p
                LEFT JOIN detalle_pedidos d ON d.pedido_id = p.id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            
            const pedido = await pool.query(`
                SELECT * FROM pedidos WHERE id = $1
            `, [id]);

            if (pedido.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }

            const detalles = await pool.query(`
                SELECT * FROM detalle_pedidos WHERE pedido_id = $1
            `, [id]);

            res.json({
                success: true,
                data: {
                    ...pedido.rows[0],
                    detalles: detalles.rows
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async updateEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado, observacion } = req.body;

            const estadosValidos = ['Pendiente', 'Confirmado', 'En preparación', 'Listo para entrega', 'Entregado', 'Cancelado'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({ success: false, message: 'Estado no válido' });
            }

            const pedidoActual = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
            if (pedidoActual.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }

            const estadoAnterior = pedidoActual.rows[0].estado;

            await pool.query(`
                UPDATE pedidos SET estado = $1 WHERE id = $2
            `, [estado, id]);

            await pool.query(`
                INSERT INTO historial_pedido (pedido_id, estado_anterior, estado_nuevo, observacion)
                VALUES ($1, $2, $3, $4)
            `, [id, estadoAnterior, estado, observacion || `Cambio de estado a ${estado}`]);

            res.json({
                success: true,
                message: `Estado actualizado a ${estado}`
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = pedidoController;