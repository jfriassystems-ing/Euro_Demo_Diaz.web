﻿// ============================================================
// EUROMODADIAZ - admin.js (VERSIÓN SEGURA - SIN ONCLICK)
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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado, observacion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast(`✅ Pedido #${pedidoIdActual} actualizado a "${nuevoEstado}"`, 'success');
            cerrarModal('modalEstado');
            cargarPedidos();
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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
                'Authorization': `Bearer ${token}`
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
            mostrarToast('❌ ' + result.message, 'error');
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
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Producto eliminado', 'success');
            cargarProductosAdmin();
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Categoría creada', 'success');
            cerrarModal('modalNuevaCategoria');
            cargarCategorias();
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarToast('✅ Marca creada', 'success');
            cerrarModal('modalNuevaMarca');
            cargarMarcas();
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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
        } else {
            mostrarToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
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