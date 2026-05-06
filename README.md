# 🛍️ Cleber Store

> Projeto desenvolvido para o curso de Front-End Essencial do Serratec (Turma T35).

🔗 **Deploy:** [https://eclectic-figolla-050850.netlify.app](https://eclectic-figolla-050850.netlify.app)

Uma loja virtual de moda completa, com navegação entre páginas, integração com API externa, carrinho de compras, checkout e confirmação de pedido.

---

## 💻 Trabalho Grupo 3 | Front-End Essencial - Serratec (T35)

### 👥 Equipe 03
* **Elisa Barbosa Kappaun** - [@elisakappaun-netizen](https://github.com/elisakappaun-netizen)
* **Lucas Lopes Cardoso** - [@llcardos](https://github.com/llcardos)
* **Marcelo da Silva Oliveira** - [@MarceloMdx](https://github.com/MarceloMdx)
* **Nathália de Queiroz Antunes** - [@nathaliaa-qa](https://github.com/nathaliaa-qa)
* **Pedro Lucas da Costa Teixeira** - [@pedroteixeira5](https://github.com/pedroteixeira5)

---

## 🗂️ Estrutura do Projeto

```
📁 TrabalhoGrupo3FrontEndEssecial-serratecT35/
├── index.html              # Página inicial (landing page)
├── assets/                 # Imagens e logos
├── pages/
│   ├── login.html          # Autenticação do usuário
│   ├── produto.html        # Catálogo de produtos
│   ├── carrinho.html       # Carrinho de compras
│   ├── checkout.html       # Finalização do pedido
│   └── confirmacao.html    # Confirmação do pedido
├── scripts/
│   ├── carrinho.js         # Lógica do carrinho (localStorage + API)
│   ├── checkout.js         # Resumo do pedido, CEP, pagamento
│   ├── confirmacao.js      # Exibição do pedido confirmado
│   ├── login.js            # Autenticação via API
│   ├── produto.js          # Listagem e filtragem de produtos
│   └── script.js           # Scripts gerais
└── styles/
    ├── global.css          # Estilos globais e variáveis
    ├── view.css            # Estilos da landing page
    ├── login.css
    ├── produto.css
    ├── carrinho.css
    ├── checkout.css
    └── confirmacao.css
```

---

## 🔌 API Utilizada — DummyJSON

O projeto consome a API pública [DummyJSON](https://dummyjson.com), que simula um backend completo com autenticação, produtos e carrinho.

**Base URL:** `https://dummyjson.com`

### Endpoints utilizados

| Funcionalidade | Método | Endpoint |
|---|---|---|
| Autenticação | `POST` | `/auth/login` |
| Listar produtos por categoria | `GET` | `/products/category/{categoria}` |
| Criar carrinho | `POST` | `/carts/add` |
| Atualizar carrinho | `PUT` | `/carts/{id}` |
| Deletar carrinho | `DELETE` | `/carts/{id}` |

### Categorias de produtos disponíveis

| Slug da API | Nome exibido |
|---|---|
| `tops` | Camisetas |
| `womens-dresses` | Vestidos Femininos |
| `mens-shirts` | Camisas Masculinas |
| `womens-shoes` | Sapatos Femininos |

> Os preços são convertidos de USD para BRL com uma taxa de multiplicação de `× 5,5`.

### CEP (endereço no checkout)

O preenchimento automático de endereço utiliza a API pública **ViaCEP**:

```
GET https://viacep.com.br/ws/{cep}/json/
```

---

## 🔐 Autenticação

O login é feito via `POST` para `https://dummyjson.com/auth/login` com `username` e `password` no corpo da requisição.

Após o login bem-sucedido, o token de acesso (`accessToken`) é salvo em `sessionStorage` (ou `localStorage` caso "Lembrar-me" esteja marcado), junto com os dados básicos do usuário.

### Exemplo de requisição de login

```http
POST https://dummyjson.com/auth/login
Content-Type: application/json

{
  "username": "emilys",
  "password": "emilyspass",
  "expiresInMins": 60
}
```

### Exemplo de resposta

```json
{
  "id": 1,
  "username": "emilys",
  "firstName": "Emily",
  "lastName": "Johnson",
  "email": "emily.johnson@x.dummyjson.com",
  "image": "https://dummyjson.com/icon/emilys/128",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Credencial de teste:**
> - **Usuário:** `emilys`
> - **Senha:** `emilyspass`

---

## 🛒 Fluxo da Aplicação

```
Página Inicial (index.html)
        ↓
    Login (login.html)
        ↓
  Catálogo de Produtos (produto.html)
        ↓
  Carrinho de Compras (carrinho.html)
        ↓
     Checkout (checkout.html)
        ↓
  Confirmação do Pedido (confirmacao.html)
```

---

## ▶️ Como executar

O projeto é composto apenas por arquivos estáticos (HTML, CSS e JavaScript puro), sem necessidade de instalação ou build.

1. Clone o repositório:
   ```bash
   git clone https://github.com/llcardos/TrabalhoGrupo3FrontEndEssecial-serratecT35.git
   ```
2. Abra o arquivo `index.html` diretamente no navegador, **ou** utilize uma extensão como [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code para evitar problemas com caminhos absolutos.

---

## 🛠️ Tecnologias

* HTML5
* CSS3
* JavaScript (ES6+)
* [Bootstrap Icons](https://icons.getbootstrap.com/)
* [DummyJSON API](https://dummyjson.com)
* [ViaCEP API](https://viacep.com.br)

