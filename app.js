// Importações Oficiais do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// SUAS CHAVES DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBSSDixkWzEaP3pbncJ5NhTf_0ZDNgzUtA",
  authDomain: "maribella-kids.firebaseapp.com",
  databaseURL: "https://maribella-kids-default-rtdb.firebaseio.com",
  projectId: "maribella-kids",
  storageBucket: "maribella-kids.firebasestorage.app",
  messagingSenderId: "874601019258",
  appId: "1:874601019258:web:ec1a308aa526de5a1088c3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); 
const auth = getAuth(app);       

let carrinho = [];
let listaDeProdutos = []; 

// --- NOTIFICAÇÕES TOAST ---
window.mostrarNotificacao = function(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast-notificacao');
    let icone = tipo === 'erro' ? "❌" : tipo === 'info' ? "ℹ️" : "✅";
    toast.innerHTML = `${icone} ${mensagem}`;
    toast.className = `toast show ${tipo}`;
    setTimeout(() => toast.className = `toast hidden`, 3500);
};

// --- CARREGAR VITRINE DA LOJA ---
window.carregarProdutosDoBanco = async function() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<p style="text-align:center; width: 100%; color: #aaa;">✨ Buscando a coleção perfeita para você...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        listaDeProdutos = [];
        grid.innerHTML = '';
        if (querySnapshot.empty) {
            grid.innerHTML = '<p style="text-align:center; width: 100%;">Nenhuma peça disponível no momento. Volte mais tarde! 💕</p>';
            return;
        }
        querySnapshot.forEach((doc) => {
            let produto = doc.data();
            produto.id = doc.id;
            listaDeProdutos.push(produto);
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <div>
                    <h3>${produto.nome}</h3>
                    <p><strong>Tamanho:</strong> ${produto.tamanho}</p>
                    <p><strong>Tecido:</strong> ${produto.material}</p>
                    <p class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                    <button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}')">🛒 Eu Quero!</button>
                </div>
            `;
            grid.appendChild(div);
        });
    } catch (error) { grid.innerHTML = '<p style="color:red; text-align:center; width: 100%;">Ops, erro ao carregar o sistema.</p>'; }
}
carregarProdutosDoBanco();

// --- LÓGICA DO CARRINHO ---
window.adicionarAoCarrinho = function(id) {
    const produto = listaDeProdutos.find(p => p.id === id);
    carrinho.push(produto);
    atualizarCarrinho();
    mostrarNotificacao(`${produto.nome} foi para o carrinho!`, 'sucesso');
};
window.removerDoCarrinho = function(index) { carrinho.splice(index, 1); atualizarCarrinho(); mostrarNotificacao("Item removido.", 'info');};
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = function() { if(carrinho.length === 0) return mostrarNotificacao("Adicione uma roupinha ao carrinho primeiro!", 'erro'); document.getElementById('etapa-carrinho').classList.add('hidden'); document.getElementById('etapa-cadastro').classList.remove('hidden'); };
window.voltarParaCarrinho = function() { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };
window.copiarPix = function() { navigator.clipboard.writeText("81999999999").then(() => mostrarNotificacao("Chave PIX copiada! Abra o seu banco.", 'sucesso')); };

function atualizarCarrinho() {
    document.getElementById('cart-count').innerText = carrinho.length;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, index) => {
        total += parseFloat(item.preco);
        cartItems.innerHTML += `<div class="cart-item"><span style="font-weight: bold; color: #555;">${item.nome}</span><span>R$ ${parseFloat(item.preco).toFixed(2)} <button onclick="removerDoCarrinho(${index})" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-weight:bold; font-size:1.2rem; margin-left:10px;">&times;</button></span></div>`;
    });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

// --- VALIDAÇÃO DE CPF E CEP ---
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if(cpf == '' || cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let add = 0;
    for (let i=0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    return true;
}

document.getElementById('cliente-cpf').addEventListener('input', function(e) {
    let cpf = e.target.value;
    const msg = document.getElementById('cpf-msg');
    const btn = document.getElementById('btn-finalizar');
    if(cpf.length === 11) {
        if(validarCPF(cpf)) { e.target.classList.add('cpf-valido'); msg.style.display = 'none'; btn.disabled = false; btn.style.opacity = '1';
        } else { e.target.classList.remove('cpf-valido'); msg.style.display = 'block'; btn.disabled = true; btn.style.opacity = '0.5'; }
    } else { e.target.classList.remove('cpf-valido'); msg.style.display = 'none'; btn.disabled = true; btn.style.opacity = '0.5'; }
});

document.getElementById('cliente-cep').addEventListener('blur', async function(e) {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        try {
            mostrarNotificacao("Buscando endereço...", 'info');
            let res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            let data = await res.json();
            if (!data.erro) {
                document.getElementById('cliente-rua').value = data.logradouro;
                document.getElementById('cliente-bairro').value = data.bairro;
                document.getElementById('cliente-estado').value = data.uf;
                document.getElementById('cliente-numero').focus();
                mostrarNotificacao("Endereço encontrado!", 'sucesso');
            } else { mostrarNotificacao("CEP não encontrado.", 'erro'); }
        } catch(err) { mostrarNotificacao("Erro ao buscar CEP.", 'erro'); }
    }
});

document.getElementById('perfil-cep').addEventListener('blur', async function(e) {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        let res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let data = await res.json();
        if (!data.erro) {
            document.getElementById('perfil-rua').value = data.logradouro;
            document.getElementById('perfil-bairro').value = data.bairro;
            document.getElementById('perfil-estado').value = data.uf;
        }
    }
});

// --- PAINEL DO USUÁRIO (PERFIL) ---
window.abrirPerfil = () => document.getElementById('perfil-cliente-modal').classList.remove('hidden');
window.fecharPerfil = () => {
    document.getElementById('perfil-cliente-modal').classList.add('hidden');
    document.getElementById('form-atualizar-perfil').classList.add('hidden');
    document.getElementById('busca-perfil-area').classList.remove('hidden');
    document.getElementById('busca-cpf').value = '';
};

window.buscarMeuCadastro = async function() {
    const cpf = document.getElementById('busca-cpf').value.replace(/[^\d]+/g,'');
    if(cpf.length !== 11 || !validarCPF(cpf)) return mostrarNotificacao("Digite um CPF válido!", "erro");
    
    mostrarNotificacao("Buscando dados...", "info");
    const docRef = doc(db, "clientes", cpf);
    const docSnap = await getDoc(docRef);

    document.getElementById('busca-perfil-area').classList.add('hidden');
    document.getElementById('form-atualizar-perfil').classList.remove('hidden');
    document.getElementById('perfil-cpf').value = cpf;

    if (docSnap.exists()) {
        const c = docSnap.data();
        document.getElementById('perfil-nome').value = c.nome;
        document.getElementById('perfil-telefone').value = c.telefone;
        document.getElementById('perfil-cep').value = c.cep;
        document.getElementById('perfil-estado').value = c.estado;
        document.getElementById('perfil-rua').value = c.rua;
        document.getElementById('perfil-numero').value = c.numero;
        document.getElementById('perfil-bairro').value = c.bairro;
        document.getElementById('perfil-ref').value = c.ref || '';
        mostrarNotificacao("Dados carregados com sucesso!", "sucesso");
    } else {
        mostrarNotificacao("Primeiro acesso! Preencha para salvar seu cadastro.", "info");
    }
};

document.getElementById('form-atualizar-perfil').addEventListener('submit', async function(e) {
    e.preventDefault();
    const dadosCliente = {
        nome: document.getElementById('perfil-nome').value,
        cpf: document.getElementById('perfil-cpf').value,
        telefone: document.getElementById('perfil-telefone').value,
        cep: document.getElementById('perfil-cep').value,
        rua: document.getElementById('perfil-rua').value,
        numero: document.getElementById('perfil-numero').value,
        bairro: document.getElementById('perfil-bairro').value,
        estado: document.getElementById('perfil-estado').value,
        ref: document.getElementById('perfil-ref').value
    };
    try {
        await setDoc(doc(db, "clientes", dadosCliente.cpf), dadosCliente);
        mostrarNotificacao("Seu endereço foi atualizado e salvo!", "sucesso");
        window.fecharPerfil();
    } catch (e) { mostrarNotificacao("Erro ao salvar.", "erro"); }
});

// --- FINALIZAR PEDIDO (CHECKOUT) ---
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dadosCliente = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value,
        telefone: document.getElementById('cliente-telefone').value,
        cep: document.getElementById('cliente-cep').value,
        rua: document.getElementById('cliente-rua').value,
        numero: document.getElementById('cliente-numero').value,
        bairro: document.getElementById('cliente-bairro').value,
        estado: document.getElementById('cliente-estado').value,
        ref: document.getElementById('cliente-ref').value
    };
    
    const obs = document.getElementById('cliente-obs').value;
    const total = document.getElementById('total-price').innerText;
    const dataIso = new Date().toISOString(); 
    const dataFormatada = new Date().toLocaleDateString('pt-BR');

    mostrarNotificacao("Processando seu pedido...", 'info');

    try {
        await setDoc(doc(db, "clientes", dadosCliente.cpf), dadosCliente);
        await addDoc(collection(db, "pedidos"), {
            cliente: dadosCliente.nome,
            cpf: dadosCliente.cpf,
            endereco: `${dadosCliente.rua}, ${dadosCliente.numero} - ${dadosCliente.bairro}, ${dadosCliente.estado}`,
            observacao: obs,
            itens: carrinho.map(i => i.nome).join(", "),
            total: total,
            data: dataFormatada,
            timestamp: dataIso 
        });
    } catch (erro) { console.error(erro); }

    let mensagem = `Olá! Sou ${dadosCliente.nome} (CPF: ${dadosCliente.cpf}) e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`;
    carrinho.forEach(item => mensagem += `- ${item.nome} (R$ ${parseFloat(item.preco).toFixed(2)})\n`);
    mensagem += `\n💰 *TOTAL:* R$ ${total}\n\n📦 *ENTREGA:*\n${dadosCliente.rua}, ${dadosCliente.numero} - ${dadosCliente.bairro}, ${dadosCliente.estado}\nCEP: ${dadosCliente.cep}\nRef: ${dadosCliente.ref}\n`;
    if (obs) mensagem += `📌 *OBS:* ${obs}\n`;

    const telefoneVendedora = "5581999999999"; 
    window.open(`https://wa.me/${telefoneVendedora}?text=${encodeURIComponent(mensagem)}`, '_blank');
    
    carrinho = [];
    atualizarCarrinho();
    toggleCart();
    this.reset();
    document.getElementById('cliente-cpf').classList.remove('cpf-valido');
});


// --- ÁREA RESTRITA DO ADMIN (LOGIN SEGURO) ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');

document.getElementById('form-login-admin').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-senha').value;
    const btn = document.getElementById('btn-entrar-admin');
    
    btn.innerText = "⏳ Autenticando...";
    btn.disabled = true;
    
    try {
        await signInWithEmailAndPassword(auth, email, senha);
        mostrarNotificacao("Acesso Liberado com sucesso!", "sucesso");
        fecharLoginAdmin();
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('main-header').classList.add('hidden');
        document.getElementById('loja-main').classList.add('hidden');
        carregarListaAdminPedidos();
    } catch (error) {
        mostrarNotificacao("E-mail ou Senha incorretos!", "erro");
    }
    btn.innerText = "Entrar no Painel";
    btn.disabled = false;
    this.reset();
});

window.sairDoAdmin = async function() {
    await signOut(auth);
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('loja-main').classList.remove('hidden');
    carregarProdutosDoBanco(); 
};

window.mudarAbaAdmin = function(abaId) {
    document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa'));
    document.getElementById(abaId).classList.remove('hidden');
    document.getElementById(`tab-${abaId}`).classList.add('ativa');
    if(abaId === 'admin-pedidos') carregarListaAdminPedidos();
    if(abaId === 'admin-clientes') carregarListaAdminClientes();
};

// --- ADICIONAR PRODUTO (FAZENDO UPLOAD DA FOTO PRO STORAGE) ---
document.getElementById('form-add-produto').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-produto');
    const arquivoImagem = document.getElementById('add-imagem-file').files[0];
    
    if (!arquivoImagem) return mostrarNotificacao("Você precisa selecionar uma foto!", "erro");

    btn.innerText = "⏳ Enviando Foto e Salvando...";
    btn.disabled = true;

    try {
        // 1. Envia a foto para a pasta 'produtos' no Storage
        const storageRef = ref(storage, 'produtos/' + Date.now() + '_' + arquivoImagem.name);
        await uploadBytes(storageRef, arquivoImagem);
        
        // 2. Pega o link definitivo da foto que foi gerado
        const urlFoto = await getDownloadURL(storageRef);

        // 3. Salva os dados completos no Banco de Dados
        const novoProduto = {
            nome: document.getElementById('add-nome').value,
            preco: parseFloat(document.getElementById('add-preco').value),
            tamanho: document.getElementById('add-tamanho').value,
            material: document.getElementById('add-material').value,
            imagem: urlFoto 
        };

        await addDoc(collection(db, "produtos"), novoProduto);
        mostrarNotificacao("Roupinha adicionada com sucesso!", "sucesso");
        this.reset();
    } catch (erro) {
        mostrarNotificacao("Erro ao enviar. Verifique sua conexão.", "erro");
        console.error(erro);
    }
    btn.innerText = "➕ Salvar Produto";
    btn.disabled = false;
});

// Admin: Puxar Pedidos
async function carregarListaAdminPedidos() {
    const lista = document.getElementById('lista-admin-pedidos');
    lista.innerHTML = "<p style='color:#777;'>⏳ Puxando vendas da nuvem...</p>";
    try {
        const q = query(collection(db, "pedidos"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        lista.innerHTML = snap.empty ? "<p>Nenhuma venda registrada ainda.</p>" : "";
        snap.forEach(doc => {
            const p = doc.data();
            lista.innerHTML += `
            <div class="admin-card">
                <strong style="color:var(--primary); font-size:1.1rem;">Data: ${p.data}</strong><br>
                <strong>Cliente:</strong> ${p.cliente} (CPF: ${p.cpf})<br>
                <strong>Total Pago:</strong> R$ ${p.total} (${p.itens})<br>
                <small style="color:#666;">📍 ${p.endereco}</small>
            </div>`;
        });
    } catch (e) { lista.innerHTML = "<p style='color:red;'>Erro ao carregar do banco.</p>"; }
}

// Admin: Puxar Clientes
async function carregarListaAdminClientes() {
    const lista = document.getElementById('lista-admin-clientes');
    lista.innerHTML = "<p style='color:#777;'>⏳ Puxando clientes...</p>";
    try {
        const snap = await getDocs(collection(db, "clientes"));
        lista.innerHTML = snap.empty ? "<p>Nenhum cliente cadastrado.</p>" : "";
        snap.forEach(doc => {
            const c = doc.data();
            lista.innerHTML += `
            <div class="admin-card" style="border-left-color: #2ecc71;">
                <strong style="font-size:1.1rem; color:#333;">👤 ${c.nome}</strong><br>
                <strong>CPF:</strong> ${c.cpf} | <strong>WhatsApp:</strong> ${c.telefone}<br>
                <small style="color:#666;">📍 ${c.rua}, ${c.numero} - ${c.bairro}, ${c.estado}</small>
            </div>`;
        });
    } catch (e) { lista.innerHTML = "<p style='color:red;'>Erro ao carregar clientes.</p>"; }
}
