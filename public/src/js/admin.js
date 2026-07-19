﻿// ============================================================
// EUROMODADIAZ - admin.js (VERSIÓN CORREGIDA)
// ============================================================

// ===== CONFIGURACIÓN =====
const API_URL = 'https://euro-demo-diaz-web.vercel.app/api';
let token = localStorage.getItem('adminToken');
let pedidos = [];
let productos = [];
let categorias = [];
let marcas = [];
let pedidoIdActual = null;
let productoIdEditando = null;

// ============================================================
// AUTENTICACIÓN
// ============================================================

function verificarAuth() {
    if (!token) {
        mostrarLogin();
        return false;
    }
    return true;
}

function mostrarLogin() {
    const panel = document.querySelector('.admin-panel');
    if (panel) {
        panel.innerHTML = `
            <div class="login-wrapper">
                <div class="login-container">
                    <div class="login-header">
                        <div class="login-logo">
                            <span class="login-icon">👔</span>
                            <span class="login-brand">EUROMODADIAZ</span>
                        </div>
                        <p class="login-subtitle">Panel de Administración</p>
                    </div>
                    
                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label class="login-label">
                                <i class="fas fa-envelope"></i> Correo Electrónico
                            </label>
                            <input type="email" id="loginEmail" class="login-input" 
                                   placeholder="admin@euromodadiaz.com" 
                                   value="euromodadiazweb@gmail.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="login-label">
                                <i class="fas fa-lock"></i> Contraseña
                            </label>
                            <input type="password" id="loginPassword" class="login-input" 
                                   placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="login-btn">
                            <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                        </button>
                    </form>
                    
                    <div class="login-footer">
                        <p>¿No tienes acceso? <a href="#" onclick="contactarSoporte()">Contacta al Soporte Técnico</a></p>
                        <p class="login-credential-info">
                            <i class="fas fa-info-circle"></i> 
                            Usuario: <strong>euromodadiazweb@gmail.com</strong>
                        </p>
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .login-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                padding: 20px;
                background: linear-gradient(135deg, #f5f6fa 0%, #e8e9ed 100%);
            }
            .login-container {
                background: white;
                border-radius: 24px;
                padding: 40px 36px;
                max-width: 420px;
                width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.08);
                animation: loginFadeIn 0.5s ease;
            }
            @keyframes loginFadeIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .login-header { text-align: center; margin-bottom: 30px; }
            .login-logo { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px; }
            .login-icon { font-size: 2.2rem; background: linear-gradient(135deg, #2d3436 0%, #e74c3c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .login-brand { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #2d3436 0%, #e74c3c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .login-subtitle { color: #b2bec3; font-size: 0.85rem; font-weight: 400; margin-top: 2px; }
            .login-form { display: flex; flex-direction: column; gap: 18px; }
            .login-label { display: block; font-weight: 600; font-size: 0.8rem; color: #2d3436; margin-bottom: 4px; }
            .login-label i { color: #e74c3c; width: 18px; margin-right: 4px; }
            .login-input { width: 100%; padding: 14px 16px; border: 2px solid #e8e9ed; border-radius: 12px; font-size: 0.95rem; font-family: 'Inter', sans-serif; transition: all 0.3s; background: #f8f9fa; color: #2d3436; }
            .login-input:focus { border-color: #e74c3c; outline: none; background: white; box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.08); }
            .login-input::placeholder { color: #b2bec3; font-size: 0.9rem; }
            .login-input.error { border-color: #e74c3c; animation: shake 0.4s ease; }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
            .login-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(231, 76, 60, 0.25); margin-top: 4px; }
            .login-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(231, 76, 60, 0.3); }
            .login-btn:active { transform: scale(0.96); }
            .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }
            .login-footer { text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f2f6; }
            .login-footer p { font-size: 0.8rem; color: #b2bec3; margin: 4px 0; }
            .login-footer a { color: #e74c3c; text-decoration: none; font-weight: 600; transition: color 0.3s; }
            .login-footer a:hover { color: #c0392b; text-decoration: underline; }
            .login-credential-info { background: #f8f9fa; padding: 8px 14px; border-radius: 8px; margin-top: 10px !important; font-size: 0.75rem !important; color: #636e72 !important; }
            .login-credential-info i { color: #e74c3c; margin-right: 6px; }
            .login-credential-info strong { color: #2d3436; }
        `;
        document.head.appendChild(style);

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const btn = document.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
            btn.disabled = true;
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    token = data.data.token;
                    localStorage.setItem('adminToken', token);
                    mostrarToast('✅ Login exitoso. Bienvenido!', 'success');
                    setTimeout(() => location.reload(), 500);
                } else {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    mostrarToast('❌ ' + data.message, 'error');
                    const inputs = document.querySelectorAll('.login-input');
                    inputs.forEach(inp => {
                        inp.style.borderColor = '#e74c3c';
                        setTimeout(() => inp.style.borderColor = '#e8e9ed', 2000);
                    });
                }
            } catch (error) {
                btn.innerHTML = originalText;
                btn.disabled = false;
                mostrarToast('❌ Error de conexión al servidor', 'error');
            }
        });
    }
}

function contactarSoporte() {
    const mensaje = encodeURIComponent(
        'Hola, necesito acceso al panel de administración de EUROMODADIAZ. ' +
        'Mi correo es: euromodadiazweb@gmail.com'
    );
    const telefono = '+18295515264';
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

window.logout = function() {
    localStorage.removeItem('adminToken');
    token = null;
    mostrarToast('👋 Sesión cerrada', 'success');
    setTimeout(() => location.reload(), 500);
};

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

window.cargarPedidos = async function() {
    if (!verificarAuth()) return;
    
    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            pedidos = data.data;
            renderizarPedidos(pedidos);
            actualizarStats(pedidos);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al cargar pedidos', 'error');
    }
};

window.cargarProductosAdmin = async function() {
    if (!verificarAuth()) return;
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            productos = data.data;
            renderizarProductosAdmin(productos);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al cargar productos', 'error');
    }
};

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const data = await response.json();
        if (data.success) {
            categorias = data.data;
            actualizarSelectCategorias();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarMarcas() {
    try {
        const response = await fetch(`${API_URL}/marcas`);
        const data = await response.json();
        if (data.success) {
            marcas = data.data;
            actualizarSelectMarcas();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================================
// RENDERIZAR PEDIDOS
// ============================================================

function renderizarPedidos(pedidos) {
    const tbody = document.getElementById('pedidosBody');
    
    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#b2bec3;">
            <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.3;"></i>
            No hay pedidos
        </td></tr>`;
        return;
    }

    tbody.innerHTML = pedidos.map(p => `
        <tr>
            <td><strong>#${p.id}</strong></td>
            <td>${p.cliente_nombre}</td>
            <td>${p.cliente_telefono}</td>
            <td><strong>RD$ ${Number(p.total).toFixed(2)}</strong></td>
            <td><span class="badge badge-${p.estado.toLowerCase().replace(' ', '-')}">${p.estado}</span></td>
            <td>${new Date(p.created_at).toLocaleDateString('es-DO')}</td>
            <td>
                <button class="btn-action btn-action-edit" data-action="abrirModalEstado" data-id="${p.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-action-view" data-action="verDetallePedido" data-id="${p.id}" style="background:#ebf5fb;color:#2980b9;padding:4px 10px;border:none;border-radius:6px;font-size:0.7rem;font-weight:600;cursor:pointer;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function actualizarStats(pedidos) {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
    const entregados = pedidos.filter(p => p.estado === 'Entregado').length;
    const totalVentas = pedidos.reduce((sum, p) => sum + Number(p.total), 0);

    document.getElementById('totalPedidos').textContent = total;
    document.getElementById('pedidosPendientes').textContent = pendientes;
    document.getElementById('pedidosEntregados').textContent = entregados;
    document.getElementById('totalVentas').textContent = `RD$ ${totalVentas.toFixed(2)}`;
}

// ============================================================
// RENDERIZAR PRODUCTOS (ADMIN)
// ============================================================

function renderizarProductosAdmin(productos) {
    const grid = document.getElementById('productosAdminGrid');
    
    if (productos.length === 0) {
        grid.innerHTML = `<div class="empty">No hay productos</div>`;
        return;
    }

    grid.innerHTML = productos.map(p => `
        <div class="producto-admin-card">
            <div class="img">
                ${p.imagen_principal 
                    ? `<img src="${p.imagen_principal}" alt="${p.nombre}">`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#b2bec3;">
                        <i class="fas fa-image"></i>
                      </div>`
                }
            </div>
            <div class="info">
                <div class="nombre">${p.nombre}</div>
                <div class="precio">RD$ ${Number(p.precio).toFixed(2)}</div>
                <div class="categoria">${p.categoria || 'Sin categoría'}</div>
            </div>
            <div class="acciones">
                <button class="btn-action btn-action-edit" data-action="editarProducto" data-id="${p.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-action-delete" data-action="eliminarProducto" data-id="${p.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================================
// MODAL DE ESTADO DE PEDIDO
// ============================================================

window.abrirModalEstado = function(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedidoIdActual = pedidoId;
    
    document.getElementById('estadoPedidoId').textContent = pedidoId;
    document.getElementById('estadoPedidoTotal').textContent = `RD$ ${Number(pedido.total).toFixed(2)}`;
    document.getElementById('estadoClienteNombre').textContent = pedido.cliente_nombre;
    document.getElementById('estadoClienteTelefono').textContent = pedido.cliente_telefono;
    document.getElementById('estadoClienteDireccion').textContent = pedido.cliente_direccion || 'No especificada';
    document.getElementById('estadoClienteCiudad').textContent = pedido.cliente_ciudad || 'No especificada';
    document.getElementById('nuevoEstado').value = pedido.estado;
    document.getElementById('estadoObservacion').value = '';
    
    document.getElementById('modalEstado').classList.add('active');
};

window.actualizarEstado = async function() {
    const nuevoEstado = document.getElementById('nuevoEstado').value;
    const observacion = document.getElementById('estadoObservacion').value || `Cambio a ${nuevoEstado}`;
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${pedidoIdActual}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado, observacion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast(`✅ Pedido #${pedidoIdActual} actualizado a "${nuevoEstado}"`, 'success');
            cerrarModal('modalEstado');
            cargarPedidos();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al actualizar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al actualizar', 'error');
    }
};

// ============================================================
// MODAL DE PRODUCTO
// ============================================================

window.abrirModalProducto = function(producto = null) {
    productoIdEditando = producto?.id || null;
    
    document.getElementById('modalProductoTitulo').textContent = producto ? 'Editar Producto' : 'Nuevo Producto';
    document.getElementById('prodId').value = producto?.id || '';
    document.getElementById('prodNombre').value = producto?.nombre || '';
    document.getElementById('prodPrecio').value = producto?.precio || '';
    document.getElementById('prodDescripcion').value = producto?.descripcion || '';
    document.getElementById('prodSku').value = producto?.sku || '';
    document.getElementById('prodCategoria').value = producto?.categoria_id || '';
    document.getElementById('prodMarca').value = producto?.marca_id || '';
    
    const agotadoCheck = document.getElementById('prodAgotado');
    if (agotadoCheck) {
        agotadoCheck.checked = producto ? !producto.activo : false;
    }
    
    const enOfertaCheck = document.getElementById('prodEnOferta');
    if (enOfertaCheck) {
        enOfertaCheck.checked = producto ? producto.en_oferta || false : false;
    }

    const grid = document.getElementById('imagenesGrid');
    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;color:#b2bec3;padding:20px;font-size:0.85rem;">
            <i class="fas fa-image" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.3;"></i>
            No hay imágenes
        </div>
    `;
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    if (producto && producto.id) {
        cargarImagenesProducto(producto.id);
    }
    
    const modal = document.getElementById('modalProducto');
    if (modal) modal.classList.add('active');
};

window.guardarProducto = async function() {
    const btn = document.querySelector('.modal-footer .btn-primary');
    
    if (btn.disabled) {
        console.log('⏳ Ya está guardando...');
        return;
    }
    
    const id = document.getElementById('prodId').value;
    const nombre = document.getElementById('prodNombre').value.trim();
    const precio = parseFloat(document.getElementById('prodPrecio').value);
    const descripcion = document.getElementById('prodDescripcion').value.trim();
    const categoria_id = parseInt(document.getElementById('prodCategoria').value) || null;
    const marca_id = parseInt(document.getElementById('prodMarca').value) || null;
    const sku = document.getElementById('prodSku').value.trim() || null;
    const agotado = document.getElementById('prodAgotado')?.checked || false;
    const en_oferta = document.getElementById('prodEnOferta')?.checked || false;
    
    if (!nombre || !precio) {
        mostrarToast('⚠️ Nombre y precio son requeridos', 'error');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;
    
    try {
        const fileInput = document.getElementById('fileInput');
        const imagenesSubidas = [];
        
        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const formData = new FormData();
                formData.append('imagen', file);
                
                const response = await fetch(`${API_URL}/imagenes/upload-temp`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    imagenesSubidas.push({
                        url: data.data.url,
                        principal: i === 0
                    });
                }
            }
        }
        
        const data = { 
            nombre, 
            descripcion, 
            precio, 
            categoria_id, 
            marca_id, 
            sku, 
            activo: true,
            agotado: agotado,
            en_oferta: en_oferta,
            imagenes: imagenesSubidas
        };
        
        const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarToast(id ? '✅ Producto actualizado' : '✅ Producto creado con imágenes', 'success');
            cerrarModal('modalProducto');
            cargarProductosAdmin();
            if (fileInput) fileInput.value = '';
        } else {
            mostrarToast('❌ ' + (result.message || 'Error al guardar'), 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al guardar', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

window.editarProducto = function(id) {
    console.log('✏️ Editando producto ID:', id);
    
    if (!id) {
        mostrarToast('❌ ID de producto no válido', 'error');
        return;
    }
    
    const producto = productos.find(p => p.id === id);
    
    if (producto) {
        console.log('📦 Producto encontrado:', producto.nombre);
        abrirModalProducto(producto);
    } else {
        cargarProductoParaEditar(id);
    }
};

async function cargarProductoParaEditar(id) {
    try {
        mostrarToast('📦 Cargando producto...', 'info');
        
        const response = await fetch(`${API_URL}/productos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const producto = data.data;
            console.log('✅ Producto cargado:', producto.nombre);
            abrirModalProducto(producto);
        } else {
            mostrarToast('❌ Producto no encontrado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al cargar producto', 'error');
    }
}

window.eliminarProducto = async function(id) {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        console.log('🗑️ Respuesta eliminar producto:', data);
        
        if (data.success) {
            mostrarToast('✅ Producto eliminado permanentemente', 'success');
            // Recargar la lista de productos
            cargarProductosAdmin();
            // Actualizar también categorías y marcas
            cargarCategoriasAdmin();
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al eliminar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar', 'error');
    }
};

// ============================================================
// IMÁGENES DE PRODUCTOS
// ============================================================

async function cargarImagenesProducto(productoId) {
    try {
        const response = await fetch(`${API_URL}/imagenes/producto/${productoId}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const grid = document.getElementById('imagenesGrid');
            grid.innerHTML = data.data.map(img => `
                <div class="imagen-item ${img.principal ? 'principal' : ''}">
                    <img src="${img.url}" alt="Imagen producto">
                    ${img.principal ? '<div class="badge-principal">★ Principal</div>' : ''}
                    <button class="btn-eliminar-imagen" data-action="eliminarImagen" data-id="${img.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    ${!img.principal ? `
                        <button class="btn-principal" data-action="hacerPrincipal" data-id="${img.id}">
                            <i class="fas fa-star"></i> Principal
                        </button>
                    ` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.eliminarImagen = async function(id) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    
    try {
        const response = await fetch(`${API_URL}/imagenes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            mostrarToast('✅ Imagen eliminada', 'success');
            const productoId = document.getElementById('prodId').value;
            if (productoId) cargarImagenesProducto(productoId);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar imagen', 'error');
    }
};

window.hacerPrincipal = async function(id) {
    try {
        const response = await fetch(`${API_URL}/imagenes/${id}/principal`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            mostrarToast('✅ Imagen principal actualizada', 'success');
            const productoId = document.getElementById('prodId').value;
            if (productoId) cargarImagenesProducto(productoId);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al actualizar', 'error');
    }
};

// ============================================================
// CATEGORÍAS Y MARCAS
// ============================================================

function actualizarSelectCategorias() {
    const select = document.getElementById('prodCategoria');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar categoría</option>' +
        categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function actualizarSelectMarcas() {
    const select = document.getElementById('prodMarca');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar marca</option>' +
        marcas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
}

window.abrirModalNuevaCategoria = function() {
    document.getElementById('nuevaCategoriaNombre').value = '';
    document.getElementById('nuevaCategoriaDescripcion').value = '';
    document.getElementById('modalNuevaCategoria').classList.add('active');
};

window.guardarNuevaCategoria = async function() {
    const nombre = document.getElementById('nuevaCategoriaNombre').value.trim();
    const descripcion = document.getElementById('nuevaCategoriaDescripcion').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Categoría creada', 'success');
            cerrarModal('modalNuevaCategoria');
            cargarCategorias();
            cargarCategoriasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al crear'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al crear', 'error');
    }
};

window.eliminarCategoria = async function() {
    const select = document.getElementById('prodCategoria');
    const id = select.value;
    if (!id) return;
    if (!confirm('¿Eliminar esta categoría?')) return;
    
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            mostrarToast('✅ Categoría eliminada', 'success');
            cargarCategorias();
            cargarCategoriasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al eliminar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar', 'error');
    }
};

window.abrirModalNuevaMarca = function() {
    document.getElementById('nuevaMarcaNombre').value = '';
    document.getElementById('modalNuevaMarca').classList.add('active');
};

window.guardarNuevaMarca = async function() {
    const nombre = document.getElementById('nuevaMarcaNombre').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/marcas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Marca creada', 'success');
            cerrarModal('modalNuevaMarca');
            cargarMarcas();
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al crear'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al crear', 'error');
    }
};

window.eliminarMarca = async function() {
    const select = document.getElementById('prodMarca');
    const id = select.value;
    if (!id) return;
    if (!confirm('¿Eliminar esta marca?')) return;
    
    try {
        const response = await fetch(`${API_URL}/marcas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            mostrarToast('✅ Marca eliminada', 'success');
            cargarMarcas();
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al eliminar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar', 'error');
    }
};

// ============================================================
// SUBIR IMÁGENES - VISTA PREVIA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length === 0) return;
            
            const grid = document.getElementById('imagenesGrid');
            const emptyMsg = grid.querySelector('div[style*="grid-column:1/-1"]');
            if (emptyMsg) emptyMsg.remove();
            
            for (const file of files) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const div = document.createElement('div');
                    div.className = 'imagen-item';
                    div.innerHTML = `
                        <img src="${event.target.result}" alt="Vista previa">
                        <div class="badge-principal">📸 Nueva</div>
                        <button class="btn-eliminar-imagen" data-action="eliminarVistaPrevia">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    grid.appendChild(div);
                };
                reader.readAsDataURL(file);
            }
            
            mostrarToast(`📸 ${files.length} imagen(es) seleccionada(s). Se subirán al guardar.`, 'info');
        });
    }
});

// ============================================================
// TOAST NOTIFICACIONES
// ============================================================

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast';
        document.body.appendChild(newToast);
    }
    
    const toastEl = document.getElementById('toast');
    toastEl.textContent = mensaje;
    toastEl.className = `toast ${tipo}`;
    toastEl.classList.add('show');
    
    clearTimeout(toastEl._timeout);
    toastEl._timeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

window.cerrarModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
};

// ============================================================
// TABS
// ============================================================

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const tabId = this.dataset.tab;
            document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
            
            if (tabId === 'pedidos') {
                cargarPedidos();
            } else if (tabId === 'productos') {
                cargarProductosAdmin();
                cargarCategorias();
                cargarMarcas();
            } else if (tabId === 'categorias') {
                cargarCategoriasAdmin();
                cargarMarcasAdmin();
            }
        });
    });
}

// ============================================================
// GENERAR SKU
// ============================================================

window.generarSKU = function() {
    const nombre = document.getElementById('prodNombre').value.trim();
    if (!nombre) {
        mostrarToast('⚠️ Escribe el nombre primero', 'error');
        return;
    }
    
    const prefix = nombre.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const sku = `${prefix}-${random}-${timestamp}`;
    
    document.getElementById('prodSku').value = sku;
    mostrarToast('✅ SKU generado', 'success');
};

// ============================================================
// EVENT LISTENER GLOBAL (SIN ONCLICK - SEGURO)
// ============================================================

document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    e.preventDefault();
    
    switch(action) {
        case 'cargarPedidos':
            cargarPedidos();
            break;
        case 'abrirModalProducto':
            abrirModalProducto();
            break;
        case 'cargarProductosAdmin':
            cargarProductosAdmin();
            break;
        case 'abrirModalNuevaCategoria':
            abrirModalNuevaCategoria();
            break;
        case 'abrirModalNuevaMarca':
            abrirModalNuevaMarca();
            break;
        case 'guardarNuevaCategoria':
            guardarNuevaCategoria();
            break;
        case 'guardarNuevaMarca':
            guardarNuevaMarca();
            break;
        case 'eliminarCategoria':
            eliminarCategoria();
            break;
        case 'eliminarMarca':
            eliminarMarca();
            break;
        case 'generarSKU':
            generarSKU();
            break;
        case 'subirImagen':
            document.getElementById('fileInput').click();
            break;
        case 'actualizarEstado':
            actualizarEstado();
            break;
        case 'guardarProducto':
            guardarProducto();
            break;
        case 'logout':
            logout();
            break;
        case 'abrirModalEstado':
            const pedidoId = parseInt(target.dataset.id);
            if (pedidoId) abrirModalEstado(pedidoId);
            break;
        case 'editarProducto':
            const prodId = parseInt(target.dataset.id);
            if (prodId) editarProducto(prodId);
            break;
        case 'eliminarProducto':
            const delId = parseInt(target.dataset.id);
            if (delId) eliminarProducto(delId);
            break;
        case 'eliminarImagen':
            const imgId = parseInt(target.dataset.id);
            if (imgId) eliminarImagen(imgId);
            break;
        case 'hacerPrincipal':
            const prinId = parseInt(target.dataset.id);
            if (prinId) hacerPrincipal(prinId);
            break;
        case 'eliminarVistaPrevia':
            const item = target.closest('.imagen-item');
            if (item) item.remove();
            break;
        // ===== NUEVO CASE =====
        case 'verDetallePedido':
            const detalleId = parseInt(target.dataset.id);
            if (detalleId) verDetallePedido(detalleId);
            break;
        // ===== FIN NUEVO CASE =====
        default:
            console.warn('Acción no reconocida:', action);
    }
});

// ============================================================
// EVENT LISTENER PARA CERRAR MODALES
// ============================================================

document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-modal]');
    if (!target) return;
    
    const modalId = target.dataset.modal;
    e.preventDefault();
    cerrarModal(modalId);
});

// ============================================================
// CATEGORÍAS ADMIN
// ============================================================

async function cargarCategoriasAdmin() {
    try {
        const grid = document.getElementById('categoriasAdminGrid');
        grid.innerHTML = '<div class="loading">Cargando categorías...</div>';
        
        const response = await fetch(`${API_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        console.log('📦 Categorías admin recibidas:', data);
        
        if (data.success) {
            renderizarCategoriasAdmin(data.data);
        } else {
            grid.innerHTML = '<p class="error">Error al cargar categorías</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('categoriasAdminGrid').innerHTML = '<p class="error">Error al cargar categorías</p>';
    }
}

function renderizarCategoriasAdmin(categorias) {
    const grid = document.getElementById('categoriasAdminGrid');
    
    if (!categorias || categorias.length === 0) {
        grid.innerHTML = `<div class="empty">No hay categorías creadas</div>`;
        return;
    }
    
    console.log('📦 Renderizando categorías con datos:', categorias);
    
    grid.innerHTML = categorias.map(cat => {
        const total = cat.total_productos !== undefined && cat.total_productos !== null ? cat.total_productos : 0;
        
        return `
        <div class="categoria-admin-card" data-id="${cat.id}">
            <div class="info">
                <div class="nombre">${cat.nombre}</div>
                ${cat.descripcion ? `<div class="descripcion">${cat.descripcion}</div>` : ''}
                <div class="total-productos" style="font-weight:600;color:#e74c3c;">
                    <i class="fas fa-box"></i> ${total} productos
                </div>
            </div>
            <div class="acciones">
                <button class="btn-action btn-action-edit" onclick="abrirModalEditarCategoria(${cat.id}, '${cat.nombre}', '${cat.descripcion || ''}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-action-delete" onclick="eliminarCategoriaAdmin(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
    
    console.log('✅ Categorías renderizadas correctamente');
}

function abrirModalCategoria() {
    document.getElementById('nuevaCategoriaNombre').value = '';
    document.getElementById('nuevaCategoriaDescripcion').value = '';
    document.getElementById('modalNuevaCategoria').classList.add('active');
}

async function guardarNuevaCategoria() {
    const nombre = document.getElementById('nuevaCategoriaNombre').value.trim();
    const descripcion = document.getElementById('nuevaCategoriaDescripcion').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Categoría creada', 'success');
            cerrarModal('modalNuevaCategoria');
            cargarCategoriasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al crear'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al crear', 'error');
    }
}

function abrirModalEditarCategoria(id, nombre, descripcion) {
    document.getElementById('editCategoriaId').value = id;
    document.getElementById('editCategoriaNombre').value = nombre;
    document.getElementById('editCategoriaDescripcion').value = descripcion;
    document.getElementById('modalEditarCategoria').classList.add('active');
}

async function guardarEditarCategoria() {
    const id = document.getElementById('editCategoriaId').value;
    const nombre = document.getElementById('editCategoriaNombre').value.trim();
    const descripcion = document.getElementById('editCategoriaDescripcion').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Categoría actualizada', 'success');
            cerrarModal('modalEditarCategoria');
            cargarCategoriasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al actualizar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al actualizar', 'error');
    }
}

async function eliminarCategoriaAdmin(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Categoría eliminada', 'success');
            cargarCategoriasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al eliminar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar', 'error');
    }
}

// ============================================================
// MARCAS ADMIN
// ============================================================

async function cargarMarcasAdmin() {
    try {
        const grid = document.getElementById('marcasAdminGrid');
        if (!grid) {
            console.warn('⚠️ No se encontró #marcasAdminGrid');
            return;
        }
        
        grid.innerHTML = '<div class="loading">Cargando marcas...</div>';
        
        const response = await fetch(`${API_URL}/marcas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        console.log('🏷️ Marcas recibidas (RAW):', data);
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(m => {
                console.log(`📊 ${m.nombre}: ${m.total_productos} productos`);
            });
            renderizarMarcasAdmin(data.data);
        } else {
            grid.innerHTML = `<div class="empty">No hay marcas creadas</div>`;
        }
    } catch (error) {
        console.error('Error al cargar marcas:', error);
        document.getElementById('marcasAdminGrid').innerHTML = '<p class="error">Error al cargar marcas</p>';
    }
}

function renderizarMarcasAdmin(marcas) {
    const grid = document.getElementById('marcasAdminGrid');
    
    if (!marcas || marcas.length === 0) {
        grid.innerHTML = `<div class="empty">No hay marcas creadas</div>`;
        return;
    }
    
    console.log('🏷️ Renderizando marcas con datos:', marcas);
    
    grid.innerHTML = marcas.map(m => {
        const total = m.total_productos !== undefined && m.total_productos !== null ? m.total_productos : 0;
        
        return `
        <div class="marca-admin-card" data-id="${m.id}">
            <div class="info">
                <div class="nombre">${m.nombre}</div>
                <div class="total-productos" style="font-weight:600;color:#e74c3c;">
                    <i class="fas fa-box"></i> ${total} productos
                </div>
            </div>
            <div class="acciones">
                <button class="btn-action btn-action-edit" onclick="abrirModalEditarMarca(${m.id}, '${m.nombre}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-action-delete" onclick="eliminarMarcaAdmin(${m.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
    
    console.log('✅ Marcas renderizadas correctamente');
}

function abrirModalMarca() {
    document.getElementById('nuevaMarcaNombre').value = '';
    document.getElementById('modalNuevaMarca').classList.add('active');
}

async function guardarNuevaMarca() {
    const nombre = document.getElementById('nuevaMarcaNombre').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/marcas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Marca creada', 'success');
            cerrarModal('modalNuevaMarca');
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al crear'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al crear', 'error');
    }
}

function abrirModalEditarMarca(id, nombre) {
    document.getElementById('editMarcaId').value = id;
    document.getElementById('editMarcaNombre').value = nombre;
    document.getElementById('modalEditarMarca').classList.add('active');
}

async function guardarEditarMarca() {
    const id = document.getElementById('editMarcaId').value;
    const nombre = document.getElementById('editMarcaNombre').value.trim();
    
    if (!nombre) {
        mostrarToast('⚠️ El nombre es requerido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/marcas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nombre })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Marca actualizada', 'success');
            cerrarModal('modalEditarMarca');
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al actualizar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al actualizar', 'error');
    }
}

async function eliminarMarcaAdmin(id) {
    if (!confirm('¿Eliminar esta marca?')) return;
    
    try {
        const response = await fetch(`${API_URL}/marcas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Marca eliminada', 'success');
            cargarMarcasAdmin();
        } else {
            mostrarToast('❌ ' + (data.message || 'Error al eliminar'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('❌ Error al eliminar', 'error');
    }
}










// ============================================================
// VER DETALLE DE PEDIDO (CON ENLACES A MAPS Y WHATSAPP)
// ============================================================

window.verDetallePedido = async function(pedidoId) {
    try {
        // Mostrar modal
        const modal = document.getElementById('modalDetallePedido');
        if (!modal) {
            console.error('❌ Modal no encontrado');
            return;
        }
        modal.classList.add('active');
        document.getElementById('detallePedidoId').textContent = pedidoId;
        document.getElementById('detalleProductosBody').innerHTML = `
            <tr><td colspan="4" style="text-align:center;padding:20px;color:#b2bec3;">
                <i class="fas fa-spinner fa-spin"></i> Cargando productos...
            </td></tr>
        `;
        
        const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const pedido = data.data;
            
            // ===== INFORMACIÓN DEL CLIENTE =====
            const nombre = pedido.cliente_nombre || '-';
            const telefono = pedido.cliente_telefono || '-';
            const direccion = pedido.cliente_direccion || '-';
            const ciudad = pedido.cliente_ciudad || '-';
            const email = pedido.cliente_email || '-';
            const metodoPago = pedido.metodo_pago || '-';
            
            document.getElementById('detalleClienteNombre').textContent = nombre;
            document.getElementById('detalleClienteCiudad').textContent = ciudad;
            document.getElementById('detalleClienteEmail').textContent = email;
            document.getElementById('detalleMetodoPago').textContent = metodoPago;
            document.getElementById('detalleTotal').textContent = `RD$ ${Number(pedido.total).toFixed(2)}`;
            
            // ===== TELÉFONO → WHATSAPP =====
            const telefonoLink = document.getElementById('detalleClienteTelefonoLink');
            const telefonoSpan = document.getElementById('detalleClienteTelefono');
            
            // Limpiar número (solo dígitos)
            const telefonoLimpio = telefono.replace(/\D/g, '');
            telefonoSpan.textContent = telefono;
            
            if (telefonoLimpio.length > 0) {
                // Para República Dominicana (1 + 809/829/849)
                let numeroWhatsApp = telefonoLimpio;
                // Si tiene 10 dígitos y empieza con 8, agregar 1
                if (numeroWhatsApp.length === 10 && numeroWhatsApp.startsWith('8')) {
                    numeroWhatsApp = '1' + numeroWhatsApp;
                }
                // Si tiene 10 dígitos y empieza con 809/829/849
                if (numeroWhatsApp.length === 10) {
                    numeroWhatsApp = '1' + numeroWhatsApp;
                }
                telefonoLink.href = `https://wa.me/${numeroWhatsApp}?text=Hola!%20Me%20comunico%20por%20tu%20pedido%20%23${pedidoId}%20en%20EUROMODADIAZ.`;
                telefonoLink.style.color = '#25D366';
                telefonoLink.style.textDecoration = 'none';
                telefonoLink.style.fontWeight = '500';
                telefonoLink.title = 'Abrir en WhatsApp';
            } else {
                telefonoLink.href = '#';
                telefonoLink.style.color = '#b2bec3';
                telefonoLink.title = 'Número no disponible';
            }
            
            // ===== DIRECCIÓN → GOOGLE MAPS =====
            const direccionLink = document.getElementById('detalleClienteDireccionLink');
            const direccionSpan = document.getElementById('detalleClienteDireccion');
            
            direccionSpan.textContent = direccion;
            
            if (direccion !== '-' && direccion.trim().length > 0) {
                const direccionEncoded = encodeURIComponent(`${direccion}, ${ciudad}, República Dominicana`);
                direccionLink.href = `https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`;
                direccionLink.style.color = '#4285F4';
                direccionLink.style.textDecoration = 'none';
                direccionLink.style.fontWeight = '500';
                direccionLink.title = 'Abrir en Google Maps';
                direccionLink.target = '_blank';
            } else {
                direccionLink.href = '#';
                direccionLink.style.color = '#b2bec3';
                direccionLink.title = 'Dirección no disponible';
            }
            
            // ===== PRODUCTOS =====
            const detalles = pedido.detalles || [];
            const tbody = document.getElementById('detalleProductosBody');
            
            if (detalles.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#b2bec3;">
                    No hay productos en este pedido
                </td></tr>`;
                return;
            }
            
            tbody.innerHTML = detalles.map(item => `
                <tr>
                    <td><strong>${item.producto_nombre}</strong></td>
                    <td>${item.cantidad}</td>
                    <td>RD$ ${Number(item.precio_unitario).toFixed(2)}</td>
                    <td>RD$ ${Number(item.subtotal).toFixed(2)}</td>
                </tr>
            `).join('');
            
        } else {
            document.getElementById('detalleProductosBody').innerHTML = `
                <tr><td colspan="4" style="text-align:center;padding:20px;color:#e74c3c;">
                    ❌ Error al cargar los productos
                </td></tr>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('detalleProductosBody').innerHTML = `
            <tr><td colspan="4" style="text-align:center;padding:20px;color:#e74c3c;">
                ❌ Error al cargar el pedido
            </td></tr>
        `;
    }
};






// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 EUROMODADIAZ - Panel de Administración');
    
    if (!verificarAuth()) return;
    
    setupTabs();
    cargarPedidos();
    cargarCategorias();
    cargarMarcas();
    
    console.log('✅ Admin listo');
});