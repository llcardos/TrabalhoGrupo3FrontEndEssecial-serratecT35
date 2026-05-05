const AUTH_URL = 'https://dummyjson.com/auth/login';

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const senhaInput = document.getElementById('senha');
const eyeIcon = document.getElementById('eye-icon');
const toggleSenha = document.querySelector('.toggle-senha');
const btnTexto = document.getElementById('btn-texto');
const btnLoading = document.getElementById('btn-loading');
const btnEntrar = document.querySelector('.btn-entrar');
const mensagemErro = document.getElementById('mensagem-erro');

// Alternar visibilidade da senha
toggleSenha.addEventListener('click', () => {
    const isPassword = senhaInput.type === 'password';
    senhaInput.type = isPassword ? 'text' : 'password';
    eyeIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
});

// Esconder mensagem de erro ao digitar
[usernameInput, senhaInput].forEach(input => {
    input.addEventListener('input', () => {
        mensagemErro.hidden = true;
    });
});

function mostrarErro(msg) {
    mensagemErro.textContent = msg;
    mensagemErro.hidden = false;
}

function setCarregando(carregando) {
    btnEntrar.disabled = carregando;
    btnTexto.hidden = carregando;
    btnLoading.hidden = !carregando;
}

// A DummyJSON usa username, não e-mail. Mapeamos o campo e-mail como username.
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = senhaInput.value;

    if (!username || !password) {
        mostrarErro('Preencha todos os campos.');
        return;
    }

    setCarregando(true);
    mensagemErro.hidden = true;

    try {
        const resposta = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, expiresInMins: 60 }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(dados.message || 'Credenciais inválidas. Tente novamente.');
            return;
        }

        // Salva o token na sessionStorage (ou localStorage se "lembrar-me" estiver marcado)
        const lembrar = document.getElementById('lembrar').checked;
        const storage = lembrar ? localStorage : sessionStorage;
        storage.setItem('cs_token', dados.accessToken);
        storage.setItem('cs_user', JSON.stringify({
            id: dados.id,
            username: dados.username,
            nome: `${dados.firstName} ${dados.lastName}`,
            imagem: dados.image,
        }));

        // Redireciona para a página principal
        window.location.href = '../index.html';
    } catch (erro) {
        mostrarErro('Erro de conexão. Verifique sua internet.');
    } finally {
        setCarregando(false);
    }
});
