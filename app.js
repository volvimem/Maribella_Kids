import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, setDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// --- PERSISTÊNCIA (CARRINHO E FORMULÁRIO NÃO APAGAM) ---
let carrinho = JSON.parse(localStorage.getItem('maribella_carrinho')) || [];
let listaDeProdutos = []; 
let clienteLogadoCpf = null;

// Máscara Automática de CPF
window.mascaraCPF = function(input) {
    let v = input.value.replace(/\D/g,"");
    v = v.replace(/(\d{3})(\d)/,"$1.$2");
    v = v.replace(/(\d{3})(\d)/,"$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
    input.value = v;
};

// Salvar form ao digitar
window.salvarFormulario = function() {
    const formDados = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value,
        telefone: document.getElementById('cliente-telefone').value,
        cep: document.getElementById('cliente-cep').value,
        estado: document.getElementById('cliente-estado').value,
        rua: document.getElementById('cliente-rua').value,
        numero: document.getElementById('cliente-numero').value,
        bairro: document.getElementById('cliente-bairro').value,
        ref: document.getElementById('cliente-ref').value,
        obs: document.getElementById('cliente-obs').value
    };
    localStorage.setItem('maribella_form_checkout', JSON.stringify(formDados));
};

function carregarFormularioSalvo() {
    const salvo = JSON.parse(localStorage.getItem('maribella_form_checkout'));
    if(salvo) {
        document.getElementById('cliente-nome').value = salvo.nome || '';
        document.getElementById('cliente-cpf').value = salvo.cpf || '';
        document.getElementById('cliente-telefone').value = salvo.telefone || '';
        document.getElementById('cliente-cep').value = salvo.cep || '';
        document.getElementById('cliente-estado').value = salvo.estado || '';
        document.getElementById('cliente-rua').value = salvo.rua || '';
        document.getElementById('cliente-numero').value = salvo.numero || '';
        document.getElementById('cliente-bairro').value = salvo.bairro || '';
        document.getElementById('cliente-ref').value = salvo.ref || '';
        document.getElementById('cliente-obs').value = salvo.obs || '';
    }
}

window.mostrarNotificacao = function(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast-notificacao');
    let icone = tipo === 'erro' ? "❌" : tipo === 'info' ? "ℹ️" : "✅";
    toast.innerHTML = `${icone} ${mensagem}`;
    toast.className = `toast show ${tipo}`;
    setTimeout(() => toast.className = `toast hidden`, 3500);
};

// --- CARREGAR VITRINE (FEED TIKTOK) ---
window.carregarProdutosDoBanco = async function() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<p style="text-align:center; width: 100%; color: #aaa; margin-top: 50px;">✨ Preparando o desfile...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        listaDeProdutos = [];
        grid.innerHTML = '';
        if (querySnapshot.empty) {
            grid.innerHTML = '<p style="text-align:center; color:white; margin-top: 50px;">Nenhuma peça no momento. Volte mais tarde! 💕</p>';
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
                <div class="card-info">
                    <div>
                        <h3>${produto.nome}</h3>
                        <p><strong>Tam:</strong> ${produto.tamanho} | <strong>Tecido:</strong> ${produto.material}</p>
                        <p class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                    </div>
                    <button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}')">🛒 Colocar no Carrinho</button>
                </div>
            `;
            grid.appendChild(div);
        });
    } catch (error) { grid.innerHTML = '<p style="color:red; text-align:center; margin-top:50px;">Ops, erro ao carregar.</p>'; }
}

// --- CARRINHO ---
window.adicionarAoCarrinho = function(id) {
    const produto = listaDeProdutos.find(p => p.id === id);
    carrinho.push(produto);
    salvarCarrinhoNoLocal();
    mostrarNotificacao(`${produto.nome} adicionado!`, 'sucesso');
};
window.removerDoCarrinho = function(index) { 
    carrinho.splice(index, 1); 
    salvarCarrinhoNoLocal(); 
    mostrarNotificacao("Item removido.", 'info');
};
function salvarCarrinhoNoLocal() {
    localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = function() { 
    if(carrinho.length === 0) return mostrarNotificacao("Carrinho vazio!", 'erro'); 
    document.getElementById('etapa-carrinho').classList.add('hidden'); 
    document.getElementById('etapa-cadastro').classList.remove('hidden'); 
};
window.voltarParaCarrinho = function() { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };
window.copiarPix = function() { navigator.clipboard.writeText("81999999999").then(() => mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };

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

// Busca CEP
window.buscarCep = async function(cepValor, prefixo) {
    let cep = cepValor.replace(/\D/g, '');
    if (cep.length === 8) {
        try {
            mostrarNotificacao("Buscando endereço...", 'info');
            let res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            let data = await res.json();
            if (!data.erro) {
                document.getElementById(`${prefixo}-rua`).value = data.logradouro;
                document.getElementById(`${prefixo}-bairro`).value = data.bairro;
                document.getElementById(`${prefixo}-estado`).value = data.uf;
                if(prefixo === 'cliente') salvarFormulario();
                mostrarNotificacao("Endereço encontrado!", 'sucesso');
            }
        } catch(err) { mostrarNotificacao("Erro ao buscar CEP.", 'erro'); }
    }
};

// --- AUTENTICAÇÃO DO CLIENTE (CPF + SENHA) ---
window.abrirLoginCliente = () => document.getElementById('cliente-login-modal').classList.remove('hidden');
window.fecharLoginCliente = () => document.getElementById('cliente-login-modal').classList.add('hidden');
window.fecharPerfil = () => document.getElementById('perfil-cliente-modal').classList.add('hidden');

document.getElementById('form-login-cliente').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cpfFormatado = document.getElementById('login-cpf-cliente').value;
    const cpf = cpfFormatado.replace(/\D/g,'');
    const senha = document.getElementById('login-senha-cliente').value;

    mostrarNotificacao("Verificando acesso...", "info");
    const docRef = doc(db, "clientes", cpf);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().senha === senha) {
        clienteLogadoCpf = cpf;
        fecharLoginCliente();
        abrirPainelCliente(docSnap.data());
        mostrarNotificacao("Bem-vinda de volta!", "sucesso");
        this.reset();
    } else {
        mostrarNotificacao("CPF ou Senha incorretos.", "erro");
    }
});

async function abrirPainelCliente(dados) {
    document.getElementById('perfil-cliente-modal').classList.remove('hidden');
    
    // Preenche Form de Atualização
    document.getElementById('perfil-cpf').value = dados.cpf;
    document.getElementById('perfil-nome').value = dados.nome;
    document.getElementById('perfil-telefone').value = dados.telefone;
    document.getElementById('perfil-cep').value = dados.cep;
    document.getElementById('perfil-estado').value = dados.estado;
    document.getElementById('perfil-rua').value = dados.rua;
    document.getElementById('perfil-numero').value = dados.numero;
    document.getElementById('perfil-bairro').value = dados.bairro;
    document.getElementById('perfil-ref').value = dados.ref || '';

    // Puxa Pedidos do Cliente
    const lista = document.getElementById('lista-meus-pedidos');
    lista.innerHTML = "⏳ Carregando...";
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    lista.innerHTML = "";
    let temPedido = false;
    snap.forEach(doc => {
        const p = doc.data();
        if(p.cpf === dados.cpf) {
            temPedido = true;
            let corStatus = p.status === 'Aprovado' ? 'var(--success)' : '#f39c12';
            lista.innerHTML += `
            <div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:10px; border-left: 4px solid ${corStatus};">
                <strong>Data: ${p.data}</strong> - R$ ${p.total}<br>
                <span style="font-size:0.85rem; color:#666;">Itens: ${p.itens}</span><br>
                <span style="font-size:0.85rem; font-weight:bold; color:${corStatus};">Status: ${p.status || 'Aguardando Pagamento'}</span>
            </div>`;
        }
    });
    if(!temPedido) lista.innerHTML = "<p>Você ainda não fez pedidos.</p>";
}

document.getElementById('form-atualizar-perfil').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cpf = document.getElementById('perfil-cpf').value;
    try {
        await updateDoc(doc(db, "clientes", cpf), {
            nome: document.getElementById('perfil-nome').value,
            telefone: document.getElementById('perfil-telefone').value,
            cep: document.getElementById('perfil-cep').value,
            rua: document.getElementById('perfil-rua').value,
            numero: document.getElementById('perfil-numero').value,
            bairro: document.getElementById('perfil-bairro').value,
            estado: document.getElementById('perfil-estado').value,
            ref: document.getElementById('perfil-ref').value
        });
        mostrarNotificacao("Endereço atualizado!", "sucesso");
    } catch (e) { mostrarNotificacao("Erro ao salvar.", "erro"); }
});

window.sairCliente = function() {
    clienteLogadoCpf = null;
    fecharPerfil();
    mostrarNotificacao("Sessão encerrada.", "info");
};

// --- FINALIZAR PEDIDO E CRIAR SENHA ---
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btnFinalizar = document.getElementById('btn-finalizar');
    btnFinalizar.disabled = true;
    btnFinalizar.innerText = "⏳ Processando...";

    const dadosCliente = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value.replace(/\D/g,''),
        telefone: document.getElementById('cliente-telefone').value,
        senha: document.getElementById('cliente-senha').value, // Salva a senha
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

    try {
        await setDoc(doc(db, "clientes", dadosCliente.cpf), dadosCliente);
        await addDoc(collection(db, "pedidos"), {
            cliente: dadosCliente.nome,
            cpf: dadosCliente.cpf,
            telefone: dadosCliente.telefone, // Para o Admin chamar no zap
            endereco: `${dadosCliente.rua}, ${dadosCliente.numero} - ${dadosCliente.bairro}, ${dadosCliente.estado}`,
            observacao: obs,
            itens: carrinho.map(i => i.nome).join(", "),
            total: total,
            data: dataFormatada,
            timestamp: dataIso,
            status: "Aguardando Pagamento" // Status Inicial
        });
    } catch (erro) { console.error(erro); }

    let mensagem = `Olá! Sou ${dadosCliente.nome} e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`;
    carrinho.forEach(item => mensagem += `- ${item.nome} (R$ ${parseFloat(item.preco).toFixed(2)})\n`);
    mensagem += `\n💰 *TOTAL:* R$ ${total}\n\n📦 *ENTREGA:*\n${dadosCliente.rua}, ${dadosCliente.numero} - ${dadosCliente.bairro}\n`;
    
    window.open(`https://wa.me/5581999999999?text=${encodeURIComponent(mensagem)}`, '_blank');
    
    carrinho = [];
    salvarCarrinhoNoLocal();
    localStorage.removeItem('maribella_form_checkout'); // Limpa form local
    toggleCart();
    this.reset();
    btnFinalizar.disabled = false;
    btnFinalizar.innerText = "📲 Enviar Pedido";
});


// --- ADMINISTRAÇÃO ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');

document.getElementById('form-login-admin').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value);
        mostrarNotificacao("Acesso Liberado!", "sucesso");
        fecharLoginAdmin();
        document.getElementById('admin-dashboard').classList.remove('hidden');
        carregarListaAdminPedidos();
    } catch (error) { mostrarNotificacao("Credenciais incorretas!", "erro"); }
});

window.sairDoAdmin = async function() {
    await signOut(auth);
    document.getElementById('admin-dashboard').classList.add('hidden');
    carregarProdutosDoBanco(); 
};

window.mudarAbaAdmin = function(abaId) {
    document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa'));
    document.getElementById(abaId).classList.remove('hidden');
    document.getElementById(`tab-${abaId}`).classList.add('ativa');
    
    if(abaId === 'admin-pedidos') carregarListaAdminPedidos();
    if(abaId === 'admin-clientes') carregarListaAdminClientes();
    if(abaId === 'admin-produtos') carregarListaAdminProdutosEditar();
};

// Adicionar / Editar Produto
document.getElementById('form-add-produto').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-produto');
    const arquivoImagem = document.getElementById('add-imagem-file').files[0];
    const idEdicao = document.getElementById('edit-produto-id').value;
    
    btn.innerText = "⏳ Salvando...";
    btn.disabled = true;

    try {
        let urlFoto = null;
        if (arquivoImagem) {
            const storageRef = ref(storage, 'produtos/' + Date.now() + '_' + arquivoImagem.name);
            await uploadBytes(storageRef, arquivoImagem);
            urlFoto = await getDownloadURL(storageRef);
        }

        const produtoData = {
            nome: document.getElementById('add-nome').value,
            preco: parseFloat(document.getElementById('add-preco').value),
            tamanho: document.getElementById('add-tamanho').value,
            material: document.getElementById('add-material').value
        };

        if(urlFoto) produtoData.imagem = urlFoto;

        if (idEdicao) {
            await updateDoc(doc(db, "produtos", idEdicao), produtoData);
            mostrarNotificacao("Produto atualizado!", "sucesso");
        } else {
            if(!urlFoto) return mostrarNotificacao("Foto obrigatória para novos produtos!", "erro");
            await addDoc(collection(db, "produtos"), produtoData);
            mostrarNotificacao("Produto criado!", "sucesso");
        }

        limparFormProduto();
        carregarListaAdminProdutosEditar();
    } catch (erro) { mostrarNotificacao("Erro ao salvar.", "erro"); }
    
    btn.innerText = "💾 Salvar Produto";
    btn.disabled = false;
});

window.limparFormProduto = function() {
    document.getElementById('form-add-produto').reset();
    document.getElementById('edit-produto-id').value = '';
    document.getElementById('btn-salvar-produto').innerText = "➕ Adicionar Produto";
};

// Admin: Lista de Produtos para Editar
async function carregarListaAdminProdutosEditar() {
    const lista = document.getElementById('lista-admin-produtos-cadastrados');
    lista.innerHTML = "⏳ Carregando...";
    const snap = await getDocs(collection(db, "produtos"));
    lista.innerHTML = "";
    snap.forEach(d => {
        const p = d.data();
        lista.innerHTML += `
        <div class="admin-card" style="display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${p.nome}</strong> - R$ ${p.preco}</div>
            <button onclick="editarProdutoAdmin('${d.id}', '${p.nome}', ${p.preco}, '${p.tamanho}', '${p.material}')" class="btn-icon" style="background:var(--secondary); color:white;">✏️ Editar</button>
        </div>`;
    });
}

window.editarProdutoAdmin = function(id, nome, preco, tamanho, material) {
    document.getElementById('edit-produto-id').value = id;
    document.getElementById('add-nome').value = nome;
    document.getElementById('add-preco').value = preco;
    document.getElementById('add-tamanho').value = tamanho;
    document.getElementById('add-material').value = material;
    document.getElementById('btn-salvar-produto').innerText = "💾 Atualizar Produto";
    window.scrollTo(0,0);
};

// Admin: Pedidos e Aprovação
window.aprovarPedido = async function(idPedido) {
    try {
        await updateDoc(doc(db, "pedidos", idPedido), { status: "Aprovado" });
        mostrarNotificacao("Pagamento Aprovado!", "sucesso");
        carregarListaAdminPedidos();
    } catch(e) { mostrarNotificacao("Erro ao aprovar.", "erro"); }
};

async function carregarListaAdminPedidos() {
    const lista = document.getElementById('lista-admin-pedidos');
    lista.innerHTML = "⏳ Puxando vendas...";
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    lista.innerHTML = "";
    snap.forEach(d => {
        const p = d.data();
        const btnAprovar = p.status !== 'Aprovado' ? `<button onclick="aprovarPedido('${d.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; margin-top:10px; cursor:pointer;">✅ Aprovar Pagamento</button>` : `<span class="status-badge status-aprovado">Pagamento Aprovado</span>`;
        
        lista.innerHTML += `
        <div class="admin-card">
            <strong style="color:var(--primary);">Data: ${p.data}</strong><br>
            <strong>Cliente:</strong> ${p.cliente}<br>
            <strong>Total Pago:</strong> R$ ${p.total} (${p.itens})<br>
            <div style="margin-top:10px;">${btnAprovar}</div>
        </div>`;
    });
}

// Admin: Clientes (WhatsApp e Transmissão)
window.gerarListaTransmissao = async function() {
    try {
        const snap = await getDocs(collection(db, "clientes"));
        let numeros = [];
        snap.forEach(d => {
            let tel = d.data().telefone.replace(/\D/g, ''); // Pega só os números
            if(tel) numeros.push(tel);
        });
        navigator.clipboard.writeText(numeros.join(", ")).then(() => {
            mostrarNotificacao("Números copiados! Cole no seu WhatsApp.", "sucesso");
        });
    } catch(e) { mostrarNotificacao("Erro ao gerar lista.", "erro"); }
};

async function carregarListaAdminClientes() {
    const lista = document.getElementById('lista-admin-clientes');
    lista.innerHTML = "⏳ Puxando clientes...";
    const snap = await getDocs(collection(db, "clientes"));
    lista.innerHTML = "";
    snap.forEach(d => {
        const c = d.data();
        let telLimpo = c.telefone.replace(/\D/g, '');
        lista.innerHTML += `
        <div class="admin-card" style="border-left-color: #2ecc71; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${c.nome}</strong><br>
                <span>${c.telefone}</span>
            </div>
            <a href="https://wa.me/55${telLimpo}" target="_blank" style="background:#25D366; color:white; padding:10px; border-radius:50%; text-decoration:none;">💬</a>
        </div>`;
    });
}

// Iniciar app
carregarFormularioSalvo();
atualizarCarrinho();
carregarProdutosDoBanco();
