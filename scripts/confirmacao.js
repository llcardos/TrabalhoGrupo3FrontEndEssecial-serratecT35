/* ═══════════════════════════════════════════════════════════════════════════
   CLEBER STORE — Confirmação
   Lê cs_order do localStorage, renderiza o pedido e limpa após exibição.
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const order = _loadOrder();
    if (!order) return;
    _renderOrder(order);
    // Remove o pedido após renderizar (não deve persistir para sempre)
    localStorage.removeItem('cs_order');
});

function _loadOrder() {
    try {
        return JSON.parse(localStorage.getItem('cs_order')) || null;
    } catch {
        return null;
    }
}

function _renderOrder(order) {
    const $ = id => document.getElementById(id);

    // Número do pedido
    if ($('order-number')) $('order-number').textContent = order.orderId || '—';

    // Itens
    const listEl = $('confirmacao-items');
    if (listEl && order.items?.length) {
        listEl.innerHTML = '';
        order.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'conf-item';
            el.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.title}" class="conf-item-img">
                <div class="conf-item-info">
                    <p class="conf-item-title">${item.title}</p>
                    <p class="conf-item-qty">Quantidade: ${item.quantity}</p>
                </div>
                <span class="conf-item-price">R$\u00a0${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            `;
            listEl.appendChild(el);
        });
    }

    // Totais
    if ($('conf-subtotal')) $('conf-subtotal').textContent = `R$\u00a0${(order.subtotal || 0).toFixed(2).replace('.', ',')}`;
    if ($('conf-desconto')) $('conf-desconto').textContent = `— R$\u00a0${(order.discount || 0).toFixed(2).replace('.', ',')}`;
    if ($('conf-total')) $('conf-total').textContent = `R$\u00a0${(order.total || 0).toFixed(2).replace('.', ',')}`;

    // Previsão de entrega (7 dias úteis)
    if ($('delivery-date')) {
        const date = new Date(order.createdAt || Date.now());
        let added = 0;
        while (added < 7) {
            date.setDate(date.getDate() + 1);
            const day = date.getDay();
            if (day !== 0 && day !== 6) added++;
        }
        $('delivery-date').textContent = date.toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: 'long',
        });
    }

    // Info do cliente
    const clientEl = $('client-info');
    if (clientEl && order.cliente) {
        clientEl.innerHTML = `
            <strong>Nome:</strong> ${order.cliente}<br>
            <strong>E-mail:</strong> ${order.email || '—'}<br>
            <strong>Entrega:</strong> ${order.endereco || '—'}<br>
            <strong>Pagamento:</strong> ${_labelMetodo(order.metodo)}
        `;
        clientEl.classList.add('visible');
    }
}

function _labelMetodo(metodo) {
    const map = {
        cartao: 'Cartão de crédito',
        pix: 'PIX',
        boleto: 'Boleto bancário',
        carteira: 'Carteira digital',
    };
    return map[metodo] || metodo || '—';
}
