// ============================================================
// EUROMODADIAZ - main.js (VERSIÓN SEGURA - SIN ONCLICK)
// ============================================================

// ===== CONFIGURACIÓN =====
const API_URL = 'https://euro-demo-diaz-web.vercel.app/api';

// ===== ESTADO =====
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ===== DOM REFS =====
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const bottomCartBtn = document.getElementById('bottomCartBtn');

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

// Cargar productos desde la API
async function cargarProductos() {
    try {
        productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            productos = data.data;
            renderizarProductos(productos);
        } else {
            productsGrid.innerHTML = '<p class="error">Error al cargar productos</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = '<p class="error">Error de conexión al servidor</p>';
    }
}

// Renderizar productos (SIN ONCLICK - usa data-id)
function renderizarProductos(productos) {
    if (productos.length === 0) {
        productsGrid.innerHTML = '<p class="empty">No hay productos disponibles</p>';
        return;
    }

    productsGrid.innerHTML = productos.map(producto => `
        <div class="product-card" data-id="${producto.id}" onclick="abrirModalProducto(${producto.id})">
            <div class="product-image">
                ${producto.imagen_principal 
                    ? `<img src="${producto.imagen_principal}" alt="${producto.nombre}" loading="lazy">`
                    : `<div class="no-image"><i class="fas fa-image"></i></div>`
                }
                ${producto.agotado ? `
                    <div class="sello-agotado">
                        <span>AGOTADO</span>
                    </div>
                ` : ''}
                ${!producto.agotado && producto.en_oferta ? `
                    <div class="sello-oferta">
                        <span>🔥 OFERTA</span>
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-category">${producto.categoria || 'Sin categoría'}</p>
                <p class="product-price">RD$ ${Number(producto.precio).toFixed(2)}</p>
                ${producto.agotado ? `
                    <button class="btn-add-cart" style="background:#b2bec3;cursor:not-allowed;" disabled>
                        <i class="fas fa-times"></i> Agotado
                    </button>
                ` : `
                    <button class="btn-add-cart" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// ===== CARGAR OFERTAS (SIN ONCLICK - usa data-id) =====
async function cargarOfertas() {
    try {
        const ofertasGrid = document.getElementById('ofertasGrid');
        if (!ofertasGrid) return;
        
        ofertasGrid.innerHTML = '<div class="loading">Cargando ofertas...</div>';
        
        const response = await fetch(`${API_URL}/productos/ofertas`);
        const data = await response.json();
        
        if (data.success) {
            if (data.data.length === 0) {
                ofertasGrid.innerHTML = `
                    <div class="empty" style="grid-column:1/-1;text-align:center;padding:40px;color:#b2bec3;">
                        <i class="fas fa-tags" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.3;"></i>
                        No hay productos en oferta
                    </div>
                `;
                return;
            }
            
            ofertasGrid.innerHTML = data.data.map(producto => `
    <div class="product-card" data-id="${producto.id}" onclick="abrirModalProducto(${producto.id})">
        <div class="product-image">
            ${producto.imagen_principal 
                ? `<img src="${producto.imagen_principal}" alt="${producto.nombre}" loading="lazy">`
                : `<div class="no-image"><i class="fas fa-image"></i></div>`
            }
            <div class="sello-oferta">
                <span>🔥 OFERTA</span>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${producto.nombre}</h3>
            <p class="product-category">${producto.categoria || 'Sin categoría'}</p>
            <p class="product-price">RD$ ${Number(producto.precio).toFixed(2)}</p>
            <button class="btn-add-cart" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
                <i class="fas fa-cart-plus"></i> Agregar
            </button>
        </div>
    </div>
`).join('');
        }
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        const ofertasGrid = document.getElementById('ofertasGrid');
        if (ofertasGrid) {
            ofertasGrid.innerHTML = '<p class="error">Error al cargar ofertas</p>';
        }
    }
}

// ============================================================
// CARRITO - AGREGAR PRODUCTO (VERSIÓN GLOBAL)
// ============================================================

window.agregarAlCarrito = function(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const existe = carrito.find(item => item.id === productoId);
    
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen_principal || '',
            cantidad: 1
        });
    }

    actualizarCarrito();
    abrirCarrito();
};

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    actualizarCarrito();
}

function cambiarCantidad(productoId, cantidad) {
    const item = carrito.find(i => i.id === productoId);
    if (!item) return;

    item.cantidad += cantidad;
    
    if (item.cantidad <= 0) {
        eliminarDelCarrito(productoId);
        return;
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    cartTotal.textContent = `RD$ ${total.toFixed(2)}`;

    if (carrito.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        return;
    }

    cartItems.innerHTML = carrito.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.imagen 
                    ? `<img src="${item.imagen}" alt="${item.nombre}">`
                    : `<div class="no-image"><i class="fas fa-image"></i></div>`
                }
            </div>
            <div class="cart-item-info">
                <p class="cart-item-name">${item.nombre}</p>
                <p class="cart-item-price">RD$ ${Number(item.precio).toFixed(2)}</p>
                <div class="cart-item-actions">
                    <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function abrirCarrito() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function finalizarPedido() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    window.location.href = 'checkout.html';
}

// ============================================================
// SCROLL A SECCIÓN PRODUCTOS
// ============================================================

function scrollToProductos() {
    const productosSection = document.getElementById('productos');
    if (productosSection) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const rect = productosSection.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        window.scrollTo({
            top: absoluteTop - headerHeight,
            behavior: 'smooth'
        });
    }
}

// ============================================================
// CATEGORÍAS
// ============================================================

async function filtrarPorCategoria(categoria) {
    try {
        productsGrid.innerHTML = '<div class="loading">Cargando...</div>';
        
        const responseCats = await fetch(`${API_URL}/categorias`);
        const dataCats = await responseCats.json();
        
        if (!dataCats.success) {
            productsGrid.innerHTML = '<p class="error">Error al obtener categorías</p>';
            return;
        }
        
        const cat = dataCats.data.find(c => c.nombre.toLowerCase() === categoria.toLowerCase());
        
        if (!cat) {
            productsGrid.innerHTML = `<p class="error">Categoría "${categoria}" no encontrada</p>`;
            return;
        }
        
        const responseProd = await fetch(`${API_URL}/productos/categoria/${cat.id}`);
        const dataProd = await responseProd.json();
        
        if (dataProd.success) {
            renderizarProductos(dataProd.data);
            setTimeout(() => scrollToProductos(), 100);
            window.location.hash = `categoria-${categoria.toLowerCase()}`;
        } else {
            productsGrid.innerHTML = '<p class="error">Error al obtener productos</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = '<p class="error">Error al filtrar productos</p>';
    }
}

function mostrarTodos() {
    cargarProductos();
    setTimeout(() => scrollToProductos(), 100);
    window.location.hash = '';
    document.querySelectorAll('.category-card').forEach(c => c.style.border = 'none');
}

// ============================================================
// MENÚ INFERIOR
// ============================================================

function setupBottomNav() {
    const bottomLinks = document.querySelectorAll('.bottom-nav-items a');
    bottomLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const section = this.dataset.section;
            
            if (this.id === 'bottomCartBtn') {
                e.preventDefault();
                abrirCarrito();
                return;
            }
            
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const rect = element.getBoundingClientRect();
                    const absoluteTop = rect.top + window.pageYOffset;
                    window.scrollTo({
                        top: absoluteTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
                bottomLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
            
            if (section) {
                const sectionMap = {
                    'inicio': 'body',
                    'productos': '#productos',
                    'categorias': '#categorias',
                    'contacto': '#contacto'
                };
                if (sectionMap[section]) {
                    e.preventDefault();
                    const target = sectionMap[section];
                    if (target === 'body') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        const element = document.querySelector(target);
                        if (element) {
                            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                            const rect = element.getBoundingClientRect();
                            const absoluteTop = rect.top + window.pageYOffset;
                            window.scrollTo({
                                top: absoluteTop - headerHeight,
                                behavior: 'smooth'
                            });
                        }
                    }
                    bottomLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
}

// ============================================================
// TARJETAS DE CATEGORÍAS
// ============================================================

function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoria = this.dataset.categoria || this.querySelector('p')?.textContent;
            if (categoria === 'Todos') {
                mostrarTodos();
                document.querySelectorAll('.category-card').forEach(c => c.style.border = 'none');
                this.style.border = '2px solid #e74c3c';
            } else {
                filtrarPorCategoria(categoria);
                document.querySelectorAll('.category-card').forEach(c => c.style.border = 'none');
                this.style.border = '2px solid #e74c3c';
            }
        });
    });
}

// ============================================================
// AGREGAR BOTÓN "TODOS"
// ============================================================

function addTodosButton() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (categoriesGrid) {
        const existing = categoriesGrid.querySelector('[data-categoria="Todos"]');
        if (!existing) {
            const todosCard = document.createElement('div');
            todosCard.className = 'category-card';
            todosCard.dataset.categoria = 'Todos';
            todosCard.innerHTML = `
                <i class="fas fa-th-large"></i>
                <p>Todos</p>
            `;
            categoriesGrid.prepend(todosCard);
        }
    }
}

// ============================================================
// EVENTOS
// ============================================================

cartToggle.addEventListener('click', abrirCarrito);
cartClose.addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', cerrarCarrito);
checkoutBtn.addEventListener('click', finalizarPedido);
if (bottomCartBtn) {
    bottomCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        abrirCarrito();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarCarrito();
});

// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 EUROMODADIAZ - Inicializando...');
    cargarProductos();
    cargarOfertas();
    actualizarCarrito();
    setupBottomNav();
    setupCategoryCards();
    addTodosButton();
    
    // ===== NUEVO: Event listener para botones "Agregar" (seguro, sin onclick) =====
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-add-cart');
        if (!btn) return;
        if (btn.disabled) return;
        
        const productoId = parseInt(btn.dataset.id);
        if (!productoId) return;
        
        e.preventDefault();
        agregarAlCarrito(productoId);
    });
    
    console.log('✅ EUROMODADIAZ - Listo!');
});

console.log('🛍️ EUROMODADIAZ - Tienda en línea');

// ============================================================
// BOTONES DEL MENÚ INFERIOR
// ============================================================

const menuCategorias = document.getElementById('menuCategorias');
if (menuCategorias) {
    menuCategorias.addEventListener('click', function(e) {
        e.preventDefault();
        const categoriasSection = document.getElementById('categorias');
        if (categoriasSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const rect = categoriasSection.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            window.scrollTo({
                top: absoluteTop - headerHeight,
                behavior: 'smooth'
            });
        }
        document.querySelectorAll('.bottom-nav-items a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
}

// ============================================================
// MODAL DETALLE PRODUCTO
// ============================================================

async function abrirModalProducto(productoId) {
    const modal = document.getElementById('modalProductoDetalle');
    const body = document.getElementById('modalProductoBody');
    
    // Mostrar loading
    body.innerHTML = `
        <div class="modal-producto-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando producto...
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        // Obtener datos del producto
        const response = await fetch(`${API_URL}/productos/${productoId}`);
        const data = await response.json();
        
        if (!data.success) {
            body.innerHTML = `
                <div class="modal-producto-loading" style="color:#e74c3c;">
                    <i class="fas fa-exclamation-circle"></i>
                    Producto no encontrado
                </div>
            `;
            return;
        }

        const p = data.data;
        
        // Construir HTML del modal
        body.innerHTML = `
            <div class="modal-producto-imagen">
                ${p.imagen_principal 
                    ? `<img src="${p.imagen_principal}" alt="${p.nombre}">`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#b2bec3;font-size:3rem;">
                        <i class="fas fa-image"></i>
                      </div>`
                }
            </div>
            <div class="modal-producto-info">
                <h2 class="modal-producto-nombre">${p.nombre}</h2>
                <p class="modal-producto-categoria">${p.categoria || 'Sin categoría'}</p>
                <p class="modal-producto-precio">RD$ ${Number(p.precio).toFixed(2)}</p>
                ${p.descripcion ? `<p class="modal-producto-descripcion">${p.descripcion}</p>` : ''}
                ${p.marca ? `<p class="modal-producto-marca"><strong>Marca:</strong> ${p.marca}</p>` : ''}
                <div class="modal-producto-stock ${p.agotado ? 'agotado' : 'disponible'}">
                    ${p.agotado ? '❌ Agotado' : '✅ Disponible'}
                </div>
                ${p.agotado ? `
                    <button class="modal-producto-btn" disabled>
                        <i class="fas fa-times"></i> Agotado
                    </button>
                ` : `
                    <button class="modal-producto-btn" onclick="agregarDesdeModal(${p.id})">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('Error:', error);
        body.innerHTML = `
            <div class="modal-producto-loading" style="color:#e74c3c;">
                <i class="fas fa-exclamation-circle"></i>
                Error al cargar el producto
            </div>
        `;
    }
}

// ===== CERRAR MODAL =====
function cerrarModalProducto() {
    const modal = document.getElementById('modalProductoDetalle');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== AGREGAR DESDE MODAL =====
function agregarDesdeModal(productoId) {
    agregarAlCarrito(productoId);
    cerrarModalProducto();
}

// ===== EVENTOS DEL MODAL =====
document.addEventListener('DOMContentLoaded', function() {
    // ... tu código existente ...
    
    // Cerrar modal con overlay
    document.getElementById('modalProductoOverlay').addEventListener('click', cerrarModalProducto);
    
    // Cerrar modal con botón X
    document.getElementById('modalProductoClose').addEventListener('click', cerrarModalProducto);
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarModalProducto();
    });
});


const menuProductos = document.querySelector('.bottom-nav-items a[data-section="productos"]');
if (menuProductos) {
    menuProductos.addEventListener('click', function(e) {
        e.preventDefault();
        const productosSection = document.getElementById('productos');
        if (productosSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const rect = productosSection.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            window.scrollTo({
                top: absoluteTop - headerHeight,
                behavior: 'smooth'
            });
        }
        document.querySelectorAll('.bottom-nav-items a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
}

const menuContacto = document.querySelector('.bottom-nav-items a[data-section="contacto"]');
if (menuContacto) {
    menuContacto.addEventListener('click', function(e) {
        e.preventDefault();
        const contactoSection = document.getElementById('contacto');
        if (contactoSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const rect = contactoSection.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            window.scrollTo({
                top: absoluteTop - headerHeight,
                behavior: 'smooth'
            });
        }
        document.querySelectorAll('.bottom-nav-items a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
}

const menuInicio = document.querySelector('.bottom-nav-items a[data-section="inicio"]');
if (menuInicio) {
    menuInicio.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.bottom-nav-items a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
}