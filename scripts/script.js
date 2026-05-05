const categorias = [
    { category: "tops", nome: "Camisetas" },
    { category: "womens-dresses", nome: "Vestidos Femininos" },
    { category: "mens-shirts", nome: "Camisas Masculinas" },
    { category: "womens-shoes", nome: "Sapatos Femininos" },
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

function filtrarPorCategoria(category) {
    fetch(`https://dummyjson.com/products/category/${encodeURIComponent(category)}`)
        .then((res) => res.json())
        .then((dados) => {
            console.log(`Produtos da categoria "${category}":`, dados.products);
            
        });
}
