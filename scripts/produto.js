const categorias = [
    { category: "tops", nome: "Camisetas" },
    { category: "womens-dresses", nome: "Vestidos Femininos" },
    { category: "mens-shirts", nome: "Camisas Masculinas" },
    { category: "womens-shoes", nome: "Sapatos Femininos" },
];

// Mapa de produtos para lookup rápido ao adicionar ao carrinho
const produtosMap = new Map();

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notif';
    toast.innerHTML = `<i class="bi bi-bag-check"></i> ${msg}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

const colorPalettes = [
    ["#d4b896", "#f5f5f5", "#1a1a1a"],
    ["#7B3F2E", "#C4923C", "#1a1a1a"],
    ["#e8e8e8", "#a8c8e8", "#1a2a4a"],
    ["#d4b896", "#8a9a8a", "#1a1a1a"],
    ["#7B3F2E", "#4a5a3a", "#1a1a1a"],
];

const listaCategorias = document.getElementById("lista-categorias");

categorias.forEach(({ category, nome }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = nome;
    a.dataset.categoria = category;

    a.addEventListener("click", (e) => {
        e.preventDefault();
        filtrarPorCategoria(category);
    });

    li.appendChild(a);
    listaCategorias.appendChild(li);
});


document.getElementById("produtos-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-to-cart");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const produto = produtosMap.get(id);
    if (!produto) return;

    btn.disabled = true;
    addItem(produto);
    showToast(`${produto.title} adicionado ao carrinho!`);
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Adicionado';
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-bag-plus"></i> Adicionar';
    }, 1800);
});

function renderProdutos(produtos) {
    const grid = document.getElementById("produtos-grid");
    grid.innerHTML = "";

    produtos.forEach((produto, index) => {
        produtosMap.set(produto.id, produto);
        const colors = colorPalettes[index % colorPalettes.length];
        const precoFormatado = (produto.price * 5.5)
            .toFixed(2)
            .replace(".", ",");

        const card = document.createElement("div");
        card.className = "produto-card";
        card.innerHTML = `
            <div class="produto-imagem">
                <img src="${produto.thumbnail}" alt="${produto.title}">
                <button class="btn-favorito" aria-label="Favoritar">
                    <i class="bi bi-heart"></i>
                </button>
            </div>
            <div class="produto-info">
                <h3>${produto.title}</h3>
                <div class="produto-cores">
                    ${colors.map(c => `<span class="cor" style="background:${c}"></span>`).join("")}
                </div>
                <p class="produto-preco">R$ ${precoFormatado}</p>
                <button class="btn-add-to-cart" data-id="${produto.id}" aria-label="Adicionar ao carrinho">
                    <i class="bi bi-bag-plus"></i> Adicionar
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filtrarPorCategoria(category) {
    fetch(`https://dummyjson.com/products/category/${encodeURIComponent(category)}`)
        .then((res) => res.json())
        .then((dados) => renderProdutos(dados.products));
}

fetch("https://dummyjson.com/products?limit=5")
    .then((res) => res.json())
    .then((dados) => renderProdutos(dados.products));