const CART_KEY = 'cs_cart';
const CART_ID_KEY = 'cs_cart_id';
const API_BASE = 'https://dummyjson.com';


function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}

function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
}

function getCartId() {
    return localStorage.getItem(CART_ID_KEY);
}

function saveCartId(id) {
    if (id) localStorage.setItem(CART_ID_KEY, String(id));
}

function getCount() {
    return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function updateCartBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

function addItem(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: parseFloat((product.price * 5.5).toFixed(2)),
            priceUSD: product.price,
            thumbnail: product.thumbnail,
            quantity: 1,
        });
    }
    saveCart(cart);
    _apiAddCart(cart).catch(() => { });
}

function updateQty(id, newQty) {
    let cart = getCart();
    if (newQty <= 0) {
        cart = cart.filter(i => i.id !== id);
    } else {
        const item = cart.find(i => i.id === id);
        if (item) item.quantity = newQty;
    }
    saveCart(cart);
    const cartId = getCartId();
    if (cartId) _apiUpdateCart(cartId, cart).catch(() => { });
}

function removeItem(id) {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    // dummyjson — UPDATE (simulado)
    const cartId = getCartId();
    if (cartId) _apiUpdateCart(cartId, cart).catch(() => { });
}

function clearCart() {
    const cartId = getCartId();
    if (cartId) _apiDeleteCart(cartId).catch(() => { });
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(CART_ID_KEY);
    updateCartBadge();
}

async function _apiAddCart(cartItems) {
    const user = JSON.parse(localStorage.getItem('cs_user') || 'null');
    const res = await fetch(`${API_BASE}/carts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user?.id || 1,
            products: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
    });
    const data = await res.json();
    saveCartId(data.id);
    return data;
}

async function _apiUpdateCart(cartId, cartItems) {
    const res = await fetch(`${API_BASE}/carts/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            merge: false,
            products: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
    });
    return res.json();
}

async function _apiDeleteCart(cartId) {
    const res = await fetch(`${API_BASE}/carts/${cartId}`, { method: 'DELETE' });
    return res.json();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.addEventListener('click', _handleCartAction);
    _renderCarrinho();
});

function _renderCarrinho() {
    const cart = getCart();
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cart.length === 0) {
        if (emptyEl) emptyEl.style.display = 'flex';
        if (contentEl) contentEl.style.display = 'none';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'grid';

    container.innerHTML = '';

    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-unit-price">R$\u00a0${item.price.toFixed(2).replace('.', ',')}<span>\u00a0/ un</span></p>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar">+</button>
            </div>
            <p class="cart-item-subtotal">R$\u00a0${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover item">
                <i class="bi bi-trash3"></i>
            </button>
        `;
        container.appendChild(el);
    });

    _updateSummary();
}

function _handleCartAction(e) {
    const removeBtn = e.target.closest('.cart-item-remove');
    const qtyBtn = e.target.closest('.qty-btn');

    if (removeBtn) {
        removeItem(parseInt(removeBtn.dataset.id));
        _renderCarrinho();
    } else if (qtyBtn) {
        const id = parseInt(qtyBtn.dataset.id);
        const cart = getCart();
        const item = cart.find(i => i.id === id);
        if (!item) return;
        updateQty(id, qtyBtn.dataset.action === 'inc' ? item.quantity + 1 : item.quantity - 1);
        _renderCarrinho();
    }
}

function _updateSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const qty = cart.reduce((s, i) => s + i.quantity, 0);
    const $ = id => document.getElementById(id);

    if ($('summary-subtotal')) $('summary-subtotal').textContent = `R$\u00a0${subtotal.toFixed(2).replace('.', ',')}`;
    if ($('summary-total')) $('summary-total').textContent = `R$\u00a0${subtotal.toFixed(2).replace('.', ',')}`;
    if ($('summary-qty')) $('summary-qty').textContent = qty;
}
