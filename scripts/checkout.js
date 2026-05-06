/* ═══════════════════════════════════════════════════════════════════════════
   CLEBER STORE — Checkout
   - Renderiza resumo do pedido a partir de cs_cart (localStorage)
   - Lookup de CEP via ViaCEP
   - Tabs de forma de pagamento
   - Máscaras de input (CPF, telefone, CEP, cartão, validade, CVV)
   - Submit: valida → POST /carts/add (dummyjson) → salva cs_order → redireciona
   ═══════════════════════════════════════════════════════════════════════════ */

const DISCOUNT_RATE = 0.05; // 5% de desconto

document.addEventListener('DOMContentLoaded', () => {
    _renderCheckoutSummary();
    _setupMasks();
    _setupPaymentTabs();
    _setupCepLookup();
    _setupFormSubmit();
});

// ── Resumo do pedido ──────────────────────────────────────────────────────────

function _renderCheckoutSummary() {
    const cart = getCart();
    const listEl = document.getElementById('checkout-items');
    const $ = id => document.getElementById(id);

    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = '<p style="font-family:Inter,sans-serif;font-size:.85rem;color:#999;text-align:center;padding:16px 0">Carrinho vazio</p>';
    } else {
        listEl.innerHTML = '';
        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'chk-item';
            el.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.title}" class="chk-item-img">
                <div class="chk-item-info">
                    <p class="chk-item-title">${item.title}</p>
                    <p class="chk-item-qty">Qtd: ${item.quantity}</p>
                </div>
                <span class="chk-item-price">R$&nbsp;${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            `;
            listEl.appendChild(el);
        });
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = subtotal * DISCOUNT_RATE;
    const total = subtotal - discount;

    if ($('chk-subtotal')) $('chk-subtotal').textContent = `R$\u00a0${subtotal.toFixed(2).replace('.', ',')}`;
    if ($('chk-desconto')) $('chk-desconto').textContent = `— R$\u00a0${discount.toFixed(2).replace('.', ',')}`;
    if ($('chk-total')) $('chk-total').textContent = `R$\u00a0${total.toFixed(2).replace('.', ',')}`;

    // Popula parcelamento
    _buildParcelamento(total);
}

function _buildParcelamento(total) {
    const sel = document.getElementById('parcelamento');
    if (!sel) return;
    sel.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
        const opt = document.createElement('option');
        const parcela = total / i;
        opt.value = i;
        opt.textContent = i === 1
            ? `1x de R$\u00a0${parcela.toFixed(2).replace('.', ',')} (à vista)`
            : `${i}x de R$\u00a0${parcela.toFixed(2).replace('.', ',')} sem juros`;
        sel.appendChild(opt);
    }
}

// ── Abas de pagamento ─────────────────────────────────────────────────────────

function _setupPaymentTabs() {
    document.querySelectorAll('.payment-method').forEach(label => {
        label.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(l => l.classList.remove('active'));
            label.classList.add('active');

            const method = label.dataset.method;
            ['cartao', 'pix', 'boleto', 'carteira'].forEach(m => {
                const el = document.getElementById(`form-${m}`);
                if (el) el.hidden = (m !== method);
            });
        });
    });
}

// ── Lookup de CEP (ViaCEP) ────────────────────────────────────────────────────

function _setupCepLookup() {
    const cepInput = document.getElementById('cep');
    const spinner = document.getElementById('cep-spinner');
    if (!cepInput) return;

    cepInput.addEventListener('input', () => {
        cepInput.value = _maskCep(cepInput.value);
        if (cepInput.value.replace(/\D/g, '').length === 8) {
            _buscarCep(cepInput.value.replace(/\D/g, ''), spinner);
        }
    });
}

async function _buscarCep(cep, spinner) {
    if (spinner) spinner.hidden = false;
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) { _setFieldError(document.getElementById('cep'), 'CEP não encontrado'); return; }
        const $ = id => document.getElementById(id);
        if ($('endereco')) $('endereco').value = data.logradouro || '';
        if ($('bairro')) $('bairro').value = data.bairro || '';
        if ($('cidade')) $('cidade').value = data.localidade || '';
        if ($('estado')) $('estado').value = data.uf || '';
        document.getElementById('numero')?.focus();
    } catch {
        // usuário pode preencher manualmente
    } finally {
        if (spinner) spinner.hidden = true;
    }
}

// ── Máscaras de input ─────────────────────────────────────────────────────────

function _setupMasks() {
    const rules = [
        { id: 'cpf', fn: _maskCpf },
        { id: 'telefone', fn: _maskTelefone },
        { id: 'cep', fn: _maskCep },
        { id: 'num-cartao', fn: _maskCartao },
        { id: 'validade', fn: _maskValidade },
        { id: 'cvv', fn: _maskCvv },
    ];
    rules.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { el.value = fn(el.value); });
    });
}

function _maskCpf(v) { return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+$/, '$1'); }
function _maskTelefone(v) { return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+$/, '$1'); }
function _maskCep(v) { return v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+$/, '$1'); }
function _maskCartao(v) { return v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19); }
function _maskValidade(v) { return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5); }
function _maskCvv(v) { return v.replace(/\D/g, '').slice(0, 4); }

// ── Validação e submit ────────────────────────────────────────────────────────

function _setupFormSubmit() {
    document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!_validateForm()) return;

        const btn = document.getElementById('btn-finalizar');
        const txtSpan = document.getElementById('btn-finalizar-txt');
        const ldSpan = document.getElementById('btn-finalizar-loading');
        const errEl = document.getElementById('form-error');

        btn.disabled = true;
        txtSpan.hidden = true;
        ldSpan.hidden = false;
        errEl.hidden = true;

        try {
            const cart = getCart();
            const user = JSON.parse(localStorage.getItem('cs_user') || 'null');
            const method = document.querySelector('.payment-method.active')?.dataset.method || 'cartao';

            // dummyjson — CREATE cart (operação simulada de CRUD)
            const res = await fetch('https://dummyjson.com/carts/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id || 1,
                    products: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                }),
            });
            const apiCart = await res.json();

            // Coleta dados do formulário
            const formData = new FormData(document.getElementById('checkout-form'));

            const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
            const discount = subtotal * DISCOUNT_RATE;
            const total = subtotal - discount;

            // Salva pedido no localStorage
            const order = {
                orderId: apiCart.id || Math.floor(Math.random() * 90000 + 10000),
                items: cart,
                subtotal,
                discount,
                total,
                metodo: method,
                cliente: formData.get('nome'),
                email: formData.get('email'),
                endereco: `${formData.get('endereco')}, ${formData.get('numero')} — ${formData.get('bairro')}, ${formData.get('cidade')}/${formData.get('estado')}`,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem('cs_order', JSON.stringify(order));

            // Limpa carrinho (dispara DELETE no dummyjson via clearCart)
            clearCart();

            window.location.href = '/pages/confirmacao.html';
        } catch {
            errEl.textContent = 'Erro ao processar pedido. Verifique sua conexão e tente novamente.';
            errEl.hidden = false;
            btn.disabled = false;
            txtSpan.hidden = false;
            ldSpan.hidden = true;
        }
    });
}

function _validateForm() {
    let ok = true;
    const requiredFields = ['nome', 'email', 'cpf', 'telefone', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado'];

    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!el.value.trim()) {
            _setFieldError(el, '');
            ok = false;
        } else {
            _clearFieldError(el);
        }
    });

    const method = document.querySelector('.payment-method.active')?.dataset.method;
    if (method === 'cartao') {
        ['num-cartao', 'nome-cartao', 'validade', 'cvv'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (!el.value.trim()) {
                _setFieldError(el, '');
                ok = false;
            } else {
                _clearFieldError(el);
            }
        });
    }

    if (!ok) {
        const errEl = document.getElementById('form-error');
        if (errEl) {
            errEl.textContent = 'Preencha todos os campos obrigatórios antes de continuar.';
            errEl.hidden = false;
        }
    }
    return ok;
}

function _setFieldError(el, msg) {
    el.classList.add('field-error');
    if (msg) {
        let hint = el.parentElement.querySelector('.field-hint-err');
        if (!hint) {
            hint = document.createElement('span');
            hint.className = 'field-hint-err';
            hint.style.cssText = 'font-family:Inter,sans-serif;font-size:.72rem;color:#e03a3a;';
            el.parentElement.appendChild(hint);
        }
        hint.textContent = msg;
    }
}

function _clearFieldError(el) {
    el.classList.remove('field-error');
    el.parentElement.querySelector('.field-hint-err')?.remove();
}
