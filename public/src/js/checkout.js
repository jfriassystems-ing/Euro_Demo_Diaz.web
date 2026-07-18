// ============================================================
// EUROMODADIAZ - checkout.js (VERSIÓN SEGURA - SIN ONCLICK)
// ============================================================

// ===== CONFIGURACIÓN =====
const API_URL = 'https://euro-demo-diaz-web.vercel.app/api';

// ===== DOM REFS =====
const checkoutItems = document.getElementById('checkoutItems');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');
const submitBtn = document.getElementById('submitBtn');

// ===== CARRITO =====
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ============================================================
// RENDERIZAR CHECKOUT
// ============================================================

function renderizarCheckout() {
    if (carrito.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:10px;"></i>
                Tu carrito está vacío
            </div>
        `;
        checkoutTotal.textContent = 'RD$ 0.00';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        return;
    }

    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';

    checkoutItems.innerHTML = carrito.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-image">
                ${item.imagen 
                    ? `<img src="${item.imagen}" alt="${item.nombre}">`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#b2bec3;"><i class="fas fa-image"></i></div>`
                }
            </div>
            <div class="checkout-item-info">
                <p class="checkout-item-name">${item.nombre}</p>
                <p class="checkout-item-price">RD$ ${Number(item.precio).toFixed(2)}</p>
            </div>
            <div class="checkout-item-qty">x${item.cantidad}</div>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    checkoutTotal.textContent = `RD$ ${total.toFixed(2)}`;
}

// ============================================================
// ENVIAR PEDIDO
// ============================================================

async function enviarPedido(data) {
    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Enviando...';

        // Construir el pedido
        const pedido = {
            cliente: {
                nombre: data.nombre,
                telefono: data.telefono,
                email: data.email || '',
                direccion: data.direccion,
                referencia: data.referencia || '',
                ciudad: data.ciudad
            },
            items: carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio,
                subtotal: item.precio * item.cantidad
            })),
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            metodo_pago: data.metodo_pago,
            notas: data.notas || ''
        };

        console.log('📦 Enviando pedido:', pedido);

        // Enviar al backend
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        const result = await response.json();
        console.log('✅ Respuesta:', result);

        if (result.success) {
            // Éxito
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Pedido Enviado!';
            submitBtn.style.background = '#27ae60';
            
            // Limpiar carrito
            localStorage.removeItem('carrito');
            carrito = [];
            
            // Mostrar mensaje de éxito
            mostrarExito(result.data);
        } else {
            throw new Error(result.message || 'Error al enviar pedido');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar Pedido';
        alert('❌ Error al enviar el pedido. Intenta nuevamente.');
    }
}

// ============================================================
// MOSTRAR ÉXITO
// ============================================================

function mostrarExito(pedido) {
    const container = document.querySelector('.checkout-container');
    container.innerHTML = `
        <div class="success-message" style="grid-column:1/-1;background:white;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
            <i class="fas fa-check-circle" style="font-size:4rem;color:#27ae60;margin-bottom:16px;"></i>
            <h2>¡Pedido Realizado con Éxito!</h2>
            <p style="color:#b2bec3;margin-bottom:8px;">Tu pedido #${pedido?.id || 'N/A'} ha sido registrado.</p>
            <p style="color:#b2bec3;margin-bottom:20px;">Nos comunicaremos contigo para confirmar la entrega.</p>
            <a href="index.html" class="btn-primary" style="display:inline-block;">
                <i class="fas fa-arrow-left"></i> Volver a la tienda
            </a>
        </div>
    `;
}

// ============================================================
// UBICACIÓN DEL CLIENTE (VERSIÓN GLOBAL - SIN ONCLICK)
// ============================================================

let ubicacionCliente = {
    lat: null,
    lng: null,
    direccion: ''
};

window.obtenerUbicacionCliente = function() {
    const btn = document.querySelector('.btn-ubicacion');
    const input = document.getElementById('direccion');
    const info = document.getElementById('ubicacionInfo') || crearInfoUbicacion();
    
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    if (!navigator.geolocation) {
        alert('⚠️ Tu navegador no soporta geolocalización. Por favor, ingresa tu dirección manualmente.');
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-location-dot"></i>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // Éxito
        async (position) => {
            const { latitude, longitude } = position.coords;
            ubicacionCliente.lat = latitude;
            ubicacionCliente.lng = longitude;
            
            // Obtener dirección desde coordenadas (reverse geocoding)
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                
                let direccion = '';
                if (data.address) {
                    const addr = data.address;
                    direccion = [
                        addr.road || '',
                        addr.suburb || '',
                        addr.city || addr.town || addr.village || '',
                        addr.state || ''
                    ].filter(Boolean).join(', ');
                }
                
                if (!direccion) {
                    direccion = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                }
                
                ubicacionCliente.direccion = direccion;
                input.value = direccion;
                
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                
                info.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>📍 Ubicación obtenida: <strong>${direccion}</strong></span>
                `;
                info.classList.add('show');
                
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.innerHTML = '<i class="fas fa-location-dot"></i>';
                }, 3000);
                
            } catch (error) {
                console.error('Error obteniendo dirección:', error);
                input.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                btn.classList.remove('loading');
                btn.innerHTML = '<i class="fas fa-location-dot"></i>';
                info.innerHTML = `
                    <i class="fas fa-map-pin"></i>
                    <span>📍 Coordenadas: <strong>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</strong></span>
                `;
                info.classList.add('show');
            }
        },
        // Error
        (error) => {
            console.error('Error de geolocalización:', error);
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-location-dot"></i>';
            
            let mensaje = 'No se pudo obtener tu ubicación. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensaje += 'Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensaje += 'No se pudo determinar tu ubicación. Verifica tu GPS.';
                    break;
                case error.TIMEOUT:
                    mensaje += 'La solicitud de ubicación expiró. Intenta nuevamente.';
                    break;
                default:
                    mensaje += 'Intenta ingresar tu dirección manualmente.';
            }
            alert('⚠️ ' + mensaje);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};

function crearInfoUbicacion() {
    const container = document.querySelector('.direccion-group');
    const div = document.createElement('div');
    div.id = 'ubicacionInfo';
    div.className = 'ubicacion-info';
    container.parentNode.insertBefore(div, container.nextSibling);
    return div;
}

// Abrir Google Maps con la ubicación (opcional)
function abrirGoogleMaps() {
    if (ubicacionCliente.lat && ubicacionCliente.lng) {
        window.open(`https://www.google.com/maps?q=${ubicacionCliente.lat},${ubicacionCliente.lng}`, '_blank');
    } else {
        const direccion = document.getElementById('direccion').value;
        if (direccion) {
            window.open(`https://www.google.com/maps?q=${encodeURIComponent(direccion)}`, '_blank');
        } else {
            alert('⚠️ Ingresa una dirección primero');
        }
    }
}

// ============================================================
// EVENTOS DEL FORMULARIO
// ============================================================

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar que el carrito no esté vacío
    if (carrito.length === 0) {
        alert('❌ Tu carrito está vacío. Agrega productos antes de finalizar.');
        return;
    }

    // Validar campos
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const ciudad = document.getElementById('ciudad').value;
    const metodo_pago = document.getElementById('metodo_pago').value;

    if (!nombre || !telefono || !direccion || !ciudad || !metodo_pago) {
        alert('⚠️ Por favor, completa todos los campos obligatorios (*)');
        return;
    }

    const data = {
        nombre,
        telefono,
        email: document.getElementById('email').value.trim(),
        direccion,
        referencia: document.getElementById('referencia').value.trim(),
        ciudad,
        metodo_pago,
        notas: document.getElementById('notas').value.trim()
    };

    await enviarPedido(data);
});

// ============================================================
// EVENTO PARA BOTÓN DE UBICACIÓN (SIN ONCLICK - SEGURO)
// ============================================================

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-ubicacion');
    if (!btn) return;
    if (btn.dataset.action !== 'ubicacion') return;
    
    e.preventDefault();
    window.obtenerUbicacionCliente();
});

// ============================================================
// INICIALIZAR
// ============================================================

renderizarCheckout();

console.log('🛒 EUROMODADIAZ - Checkout');
console.log('📦 Items en carrito:', carrito.length);