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
const db = getFirestore(app); const storage = getStorage(app); const auth = getAuth(app);       

let carrinho = JSON.parse(localStorage.getItem('maribella_carrinho')) || [];
let listaDeProdutos = []; 
let todosPedidosAdmin = []; 
let todosProdutosAdmin = [];
let todosClientesAdmin = [];
let configLoja = { pix: "Chave não configurada", telefone: "5581999999999" };

// --- UTILIDADES ---
window.mascaraCPF = function(i) { let v = i.value.replace(/\D/g,""); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2"); i.value = v; };
window.mostrarNotificacao = function(msg, t = 'sucesso') { const toast = document.getElementById('toast-notificacao'); toast.innerHTML = `${t==='erro'?"❌":t==='info'?"ℹ️":"✅"} ${msg}`; toast.className = `toast show ${t}`; setTimeout(() => toast.className = `toast hidden`, 3500); };
window.abrirLightbox = function(src) { const m = document.getElementById('lightbox-modal'); const img = document.getElementById('lightbox-img'); img.src = src; img.classList.remove('zoomed'); m.classList.remove('hidden'); };
window.fecharLightbox = function() { document.getElementById('lightbox-modal').classList.add('hidden'); };
window.toggleZoom = function() { document.getElementById('lightbox-img').classList.toggle('zoomed'); };

// --- CONFIGURAÇÕES DA LOJA ---
async function carregarConfiguracoes() {
    const snap = await getDoc(doc(db, "config", "loja"));
    if(snap.exists()) {
        configLoja = snap.data();
        document.getElementById('pix-display').innerText = configLoja.pix;
        document.getElementById('config-pix').value = configLoja.pix;
        document.getElementById('config-telefone').value = configLoja.telefone;
    }
}

// Previne o reload na hora de salvar a Configuração do Admin (Problema 5 resolvido)
window.salvarConfiguracoes = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-config');
    btn.innerText = "⏳ Salvando...";
    try {
        configLoja.pix = document.getElementById('config-pix').value;
        configLoja.telefone = document.getElementById('config-telefone').value;
        await setDoc(doc(db, "config", "loja"), configLoja);
        document.getElementById('pix-display').innerText = configLoja.pix;
        mostrarNotificacao("Ajustes salvos com sucesso!", "sucesso");
    } catch(err) { mostrarNotificacao("Erro ao salvar config.", "erro"); }
    btn.innerText = "💾 Atualizar Dados";
};

// --- VITRINE ---
window.carregarProdutosDoBanco = async function() {
    const grid = document.getElementById('product-grid'); grid.innerHTML = '<p style="text-align:center;color:#aaa;margin-top:50px;">✨ Carregando...</p>';
    try {
        const snap = await getDocs(collection(db, "produtos")); listaDeProdutos = [];
        if (snap.empty) { grid.innerHTML = '<p style="text-align:center;color:white;margin-top:50px;">Nenhuma peça no momento.</p>'; return; }
        snap.forEach(d => { let p = d.data(); p.id = d.id; listaDeProdutos.push(p); });
        renderizarFeed(listaDeProdutos);
    } catch (e) { grid.innerHTML = '<p style="color:red;text-align:center;">Erro ao carregar.</p>'; }
}

function renderizarFeed(lista) {
    const grid = document.getElementById('product-grid'); grid.innerHTML = '';
    if(lista.length === 0) grid.innerHTML = '<p style="text-align:center;color:white;margin-top:50px;">Nenhum produto encontrado.</p>';
    lista.forEach(p => {
        grid.innerHTML += `<div class="card"><img src="${p.imagem}" onclick="abrirLightbox('${p.imagem}')"><div class="card-info"><div><h3>${p.nome}</h3><p><strong>Tam:</strong> ${p.tamanho} | <strong>Tec:</strong> ${p.material}</p><p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p></div><button class="btn-add" onclick="adicionarAoCarrinho('${p.id}')">🛒 Colocar no Carrinho</button></div></div>`;
    });
}
window.filtrarProdutos = function() {
    const termo = document.getElementById('busca-input').value.toLowerCase();
    renderizarFeed(listaDeProdutos.filter(p => p.nome.toLowerCase().includes(termo) || p.material.toLowerCase().includes(termo)));
};

// --- CARRINHO E CHECKOUT ---
window.adicionarAoCarrinho = function(id) { carrinho.push(listaDeProdutos.find(p => p.id === id)); salvarCarrinhoNoLocal(); mostrarNotificacao("Adicionado!", 'sucesso'); };
window.removerDoCarrinho = function(index) { carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
function salvarCarrinhoNoLocal() { localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho)); atualizarCarrinho(); }
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = function() { if(carrinho.length===0) return mostrarNotificacao("Carrinho vazio!",'erro'); document.getElementById('etapa-carrinho').classList.add('hidden'); document.getElementById('etapa-cadastro').classList.remove('hidden'); };
window.voltarParaCarrinho = function() { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };
window.copiarPix = function() { navigator.clipboard.writeText(configLoja.pix).then(() => mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };

function atualizarCarrinho() {
    document.getElementById('cart-count').innerText = carrinho.length;
    const cartItems = document.getElementById('cart-items'); cartItems.innerHTML = ''; let total = 0;
    carrinho.forEach((item, index) => { total += parseFloat(item.preco); cartItems.innerHTML += `<div class="cart-item"><span>${item.nome}</span><span>R$ ${parseFloat(item.preco).toFixed(2)} <button onclick="removerDoCarrinho(${index})" style="color:red;background:none;border:none;font-weight:bold;">X</button></span></div>`; });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

window.salvarFormulario = function() {
    localStorage.setItem('maribella_form', JSON.stringify({ nome: document.getElementById('cliente-nome').value, cpf: document.getElementById('cliente-cpf').value, tel: document.getElementById('cliente-telefone').value, cep: document.getElementById('cliente-cep').value, uf: document.getElementById('cliente-estado').value, rua: document.getElementById('cliente-rua').value, num: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, ref: document.getElementById('cliente-ref').value }));
};
function carregarForm() {
    const s = JSON.parse(localStorage.getItem('maribella_form'));
    if(s) { document.getElementById('cliente-nome').value=s.nome||''; document.getElementById('cliente-cpf').value=s.cpf||''; document.getElementById('cliente-telefone').value=s.tel||''; document.getElementById('cliente-cep').value=s.cep||''; document.getElementById('cliente-estado').value=s.uf||''; document.getElementById('cliente-rua').value=s.rua||''; document.getElementById('cliente-numero').value=s.num||''; document.getElementById('cliente-bairro').value=s.bairro||''; document.getElementById('cliente-ref').value=s.ref||''; }
}

window.buscarCep = async function(cepValor, prefixo) {
    let cep = cepValor.replace(/\D/g, '');
    if (cep.length === 8) {
        try { let data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
            if (!data.erro) { document.getElementById(`${prefixo}-rua`).value = data.logradouro; document.getElementById(`${prefixo}-bairro`).value = data.bairro; document.getElementById(`${prefixo}-estado`).value = data.uf; if(prefixo==='cliente') salvarFormulario(); }
        } catch(err) {}
    }
};

document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-finalizar-checkout'); btn.disabled=true; btn.innerText="⏳ Processando...";
    const cpf = document.getElementById('cliente-cpf').value.replace(/\D/g,'');
    const nome = document.getElementById('cliente-nome').value;
    const tel = document.getElementById('cliente-telefone').value;
    const endereco = `${document.getElementById('cliente-rua').value}, ${document.getElementById('cliente-numero').value} - ${document.getElementById('cliente-bairro').value}`;
    const total = document.getElementById('total-price').innerText;

    try {
        await setDoc(doc(db, "clientes", cpf), { nome, cpf, telefone: tel, senha: document.getElementById('cliente-senha').value, cep: document.getElementById('cliente-cep').value, rua: document.getElementById('cliente-rua').value, numero: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, estado: document.getElementById('cliente-estado').value, ref: document.getElementById('cliente-ref').value });
        const dataH = new Date();
        // Problema 3 Resolvido: O pedido é salvo como "Pendente" (e não "Aguardando Pagamento")
        await addDoc(collection(db, "pedidos"), { cliente: nome, cpf, cidade: document.getElementById('cliente-bairro').value, telefone: tel, endereco, observacao: document.getElementById('cliente-obs').value, itens: carrinho.map(i=>i.nome).join(", "), detalhes_itens: carrinho, total, data: dataH.toLocaleDateString('pt-BR'), hora: dataH.toLocaleTimeString('pt-BR'), timestamp: dataH.toISOString(), status: "Pendente" });
    } catch (e) { console.error(e); }

    let msg = `Olá! Sou ${nome} e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome} (R$ ${parseFloat(i.preco).toFixed(2)})\n`);
    msg += `\n💰 *TOTAL:* R$ ${total}\n📦 *ENTREGA:* ${endereco}\n`;
    
    let zapGestora = configLoja.telefone.replace(/\D/g,'');
    window.open(`https://wa.me/${zapGestora}?text=${encodeURIComponent(msg)}`, '_blank');
    
    carrinho = []; salvarCarrinhoNoLocal(); localStorage.removeItem('maribella_form'); toggleCart(); this.reset();
    btn.disabled=false; btn.innerText="💾 Salvar e Enviar Pedido";
});

// --- PAINEL DO CLIENTE (AUTO LOGIN) ---
window.verificarLoginCliente = function() {
    const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente'));
    if(logado) autoLogin(logado.cpf, logado.senha);
    else document.getElementById('cliente-login-modal').classList.remove('hidden');
}
window.fecharLoginCliente = () => document.getElementById('cliente-login-modal').classList.add('hidden');
window.fecharPerfil = () => document.getElementById('perfil-cliente-modal').classList.add('hidden');

async function autoLogin(cpf, senha) {
    const d = await getDoc(doc(db, "clientes", cpf));
    if(d.exists() && d.data().senha === senha) abrirPainelCliente(d.data());
    else { localStorage.removeItem('maribella_auth_cliente'); document.getElementById('cliente-login-modal').classList.remove('hidden'); }
}

document.getElementById('form-login-cliente').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cpf = document.getElementById('login-cpf-cliente').value.replace(/\D/g,'');
    const senha = document.getElementById('login-senha-cliente').value;
    const manter = document.getElementById('lembrar-senha').checked;
    
    mostrarNotificacao("Verificando...", "info");
    const d = await getDoc(doc(db, "clientes", cpf));
    if(d.exists() && d.data().senha === senha) {
        if(manter) localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha}));
        fecharLoginCliente(); abrirPainelCliente(d.data()); this.reset();
    } else mostrarNotificacao("CPF ou Senha incorretos.", "erro");
});

window.mudarAbaCliente = function(idAba) {
    document.getElementById('aba-historico').classList.add('hidden'); document.getElementById('aba-dados').classList.add('hidden');
    document.getElementById('btn-aba-historico').classList.remove('ativa'); document.getElementById('btn-aba-historico').style.color='#aaa';
    document.getElementById('btn-aba-dados').classList.remove('ativa'); document.getElementById('btn-aba-dados').style.color='#aaa';
    document.getElementById(idAba).classList.remove('hidden'); document.getElementById('btn-'+idAba).classList.add('ativa'); document.getElementById('btn-'+idAba).style.color='var(--primary)';
}

async function abrirPainelCliente(dados) {
    document.getElementById('perfil-cliente-modal').classList.remove('hidden');
    document.getElementById('perfil-cpf').value = dados.cpf; document.getElementById('perfil-nome').value = dados.nome; document.getElementById('perfil-telefone').value = dados.telefone; document.getElementById('perfil-cep').value = dados.cep; document.getElementById('perfil-estado').value = dados.estado; document.getElementById('perfil-rua').value = dados.rua; document.getElementById('perfil-numero').value = dados.numero; document.getElementById('perfil-bairro').value = dados.bairro;
    
    const lista = document.getElementById('lista-meus-pedidos'); lista.innerHTML = "⏳ Carregando histórico...";
    const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc")));
    lista.innerHTML = ""; let tem = false;
    snap.forEach(doc => {
        const p = doc.data();
        if(p.cpf === dados.cpf) {
            tem = true; let cor = p.status === 'Aprovado' ? 'var(--success)' : '#f39c12';
            lista.innerHTML += `<div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border-left: 5px solid ${cor};"><strong style="font-size:1.1rem;">📅 ${p.data} às ${p.hora}</strong><br><div style="margin:5px 0; color:#555; font-size:0.9rem;"><strong>Itens:</strong> ${p.itens}</div><strong style="color:var(--primary); font-size:1.1rem;">💰 R$ ${p.total}</strong><br><span style="font-size:0.9rem; font-weight:bold; color:${cor};">● Status: ${p.status}</span></div>`;
        }
    });
    if(!tem) lista.innerHTML = "<p>Nenhuma compra encontrada.</p>";
}

document.getElementById('form-atualizar-perfil').addEventListener('submit', async function(e) {
    e.preventDefault(); const cpf = document.getElementById('perfil-cpf').value;
    try {
        await updateDoc(doc(db, "clientes", cpf), { nome: document.getElementById('perfil-nome').value, telefone: document.getElementById('perfil-telefone').value, cep: document.getElementById('perfil-cep').value, rua: document.getElementById('perfil-rua').value, numero: document.getElementById('perfil-numero').value, bairro: document.getElementById('perfil-bairro').value, estado: document.getElementById('perfil-estado').value });
        mostrarNotificacao("Endereço atualizado!", "sucesso");
    } catch (e) { mostrarNotificacao("Erro ao salvar.", "erro"); }
});

window.sairCliente = function() { localStorage.removeItem('maribella_auth_cliente'); fecharPerfil(); mostrarNotificacao("Você saiu.", "info"); };

// --- ADMINISTRAÇÃO COMPLETA ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');

document.getElementById('form-login-admin').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value);
        mostrarNotificacao("Acesso Liberado!", "sucesso"); fecharLoginAdmin();
        document.getElementById('admin-dashboard').classList.remove('hidden'); carregarListaAdminPedidos();
    } catch(e) { mostrarNotificacao("Erro!", "erro"); }
});
window.sairDoAdmin = async function() { await signOut(auth); document.getElementById('admin-dashboard').classList.add('hidden'); carregarProdutosDoBanco(); };

window.mudarAbaAdmin = function(abaId) {
    document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa'));
    document.getElementById(abaId).classList.remove('hidden'); document.getElementById(`tab-${abaId}`).classList.add('ativa');
    if(abaId==='admin-pedidos') carregarListaAdminPedidos();
    if(abaId==='admin-produtos') carregarListaAdminProdutosEditar();
    if(abaId==='admin-clientes') carregarListaAdminClientes();
    if(abaId==='admin-ranking'){ document.getElementById('rank-ano').value = new Date().getFullYear(); gerarRankings(); }
};

// Pedidos Admin (Busca Realtime & Filtro Pendente arrumado)
async function carregarListaAdminPedidos() {
    const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "⏳ Puxando vendas...";
    const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc")));
    todosPedidosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosPedidosAdmin.push(p); });
    filtrarPedidosAdmin();
}
window.filtrarPedidosAdmin = function() {
    const termo = document.getElementById('busca-pedido').value.toLowerCase();
    const filtro = document.getElementById('filtro-status').value;
    const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "";
    
    let resultados = todosPedidosAdmin.filter(p => {
        let matchTermo = p.cliente.toLowerCase().includes(termo) || p.cpf.includes(termo);
        let matchStatus = filtro === 'Todos' || p.status === filtro;
        return matchTermo && matchStatus;
    });

    if(resultados.length === 0) lista.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    resultados.forEach(p => {
        const btnAprovar = p.status !== 'Aprovado' ? `<button onclick="aprovarPedido('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; margin-top:10px; cursor:pointer;">✅ Aprovar Pagamento</button>` : `<span class="status-badge status-aprovado" style="margin-top:10px; display:inline-block;">Pagamento Aprovado</span>`;
        lista.innerHTML += `<div class="admin-card"><strong style="color:var(--primary);">Data: ${p.data} às ${p.hora}</strong><br><strong>Cliente:</strong> ${p.cliente} | <strong>Local:</strong> ${p.cidade||'Não info'}<br><strong>Total:</strong> R$ ${p.total} (${p.itens})<br>${btnAprovar}</div>`;
    });
}
window.aprovarPedido = async function(id) { await updateDoc(doc(db, "pedidos", id), { status: "Aprovado" }); carregarListaAdminPedidos(); };

// Produtos Admin (Com Imagem Bonita e Busca Realtime)
document.getElementById('form-add-produto').addEventListener('submit', async function(e) {
    e.preventDefault(); const btn = document.getElementById('btn-salvar-produto'); const img = document.getElementById('add-imagem-file').files[0]; const id = document.getElementById('edit-produto-id').value;
    btn.innerText = "⏳ Salvando..."; btn.disabled = true;
    try {
        let urlFoto = null;
        if (img) { const sRef = ref(storage, 'produtos/' + Date.now() + '_' + img.name); await uploadBytes(sRef, img); urlFoto = await getDownloadURL(sRef); }
        const pData = { nome: document.getElementById('add-nome').value, preco: parseFloat(document.getElementById('add-preco').value), tamanho: document.getElementById('add-tamanho').value, material: document.getElementById('add-material').value };
        if(urlFoto) pData.imagem = urlFoto;
        if (id) { await updateDoc(doc(db, "produtos", id), pData); } 
        else { if(!urlFoto) return mostrarNotificacao("Foto obrigatória!","erro"); await addDoc(collection(db, "produtos"), pData); }
        limparFormProduto(); carregarListaAdminProdutosEditar(); mostrarNotificacao("Sucesso!","sucesso");
    } catch(e) { mostrarNotificacao("Erro","erro"); }
    btn.innerText = "💾 Salvar"; btn.disabled = false;
});
window.limparFormProduto = function() { document.getElementById('form-add-produto').reset(); document.getElementById('edit-produto-id').value=''; };

async function carregarListaAdminProdutosEditar() {
    const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "⏳...";
    const snap = await getDocs(collection(db, "produtos")); 
    todosProdutosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosProdutosAdmin.push(p); });
    filtrarProdutosAdmin();
}

window.filtrarProdutosAdmin = function() {
    const termo = document.getElementById('busca-produto-admin').value.toLowerCase();
    const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "";
    let filtrados = todosProdutosAdmin.filter(p => p.nome.toLowerCase().includes(termo));
    if(filtrados.length === 0) lista.innerHTML = "<p>Nenhum produto encontrado.</p>";
    
    // Problema 2 Resolvido: Imagem inserida com estilo para ficar perfeita ao lado do nome!
    filtrados.forEach(p => {
        lista.innerHTML += `<div class="admin-card" style="display:flex; align-items:center; gap:15px; padding:10px; border-bottom:1px solid #eee;">
            <img src="${p.imagem}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; border: 1px solid #ccc;">
            <div style="flex:1;"><strong>${p.nome}</strong><br><span style="color:var(--secondary); font-weight:bold;">R$ ${p.preco}</span></div>
            <button onclick="editarProdutoAdmin('${p.id}', '${p.nome}', ${p.preco}, '${p.tamanho}', '${p.material}')" class="btn-icon" style="background:var(--secondary); color:white;">✏️ Editar</button>
        </div>`;
    });
}

window.editarProdutoAdmin = function(id, n, p, t, m) { document.getElementById('edit-produto-id').value=id; document.getElementById('add-nome').value=n; document.getElementById('add-preco').value=p; document.getElementById('add-tamanho').value=t; document.getElementById('add-material').value=m; document.querySelector('.admin-content').scrollTo(0,0); };

// Clientes Admin (Sem Lista de Transmissão e com Busca Realtime)
async function carregarListaAdminClientes() {
    const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "⏳...";
    const snap = await getDocs(collection(db, "clientes"));
    todosClientesAdmin = []; snap.forEach(d => todosClientesAdmin.push(d.data()));
    filtrarClientesAdmin();
}

window.filtrarClientesAdmin = function() {
    const termo = document.getElementById('busca-cliente-admin').value.toLowerCase();
    const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "";
    let filtrados = todosClientesAdmin.filter(c => c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo));
    if(filtrados.length === 0) lista.innerHTML = "<p>Nenhum cliente encontrado.</p>";
    
    filtrados.forEach(c => {
        let telLimpo = c.telefone.replace(/\D/g, '');
        lista.innerHTML += `<div class="admin-card" style="border-left-color: #2ecc71; display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${c.nome}</strong><br><span>${c.telefone}</span></div>
            <a href="https://wa.me/55${telLimpo}" target="_blank" style="background:#25D366; color:white; padding:10px; border-radius:50%; text-decoration:none;">💬</a>
        </div>`;
    });
}

// Rankings (Mês e Ano)
window.gerarRankings = async function() {
    const mes = document.getElementById('rank-mes').value; const ano = document.getElementById('rank-ano').value;
    const listaProd = document.getElementById('rank-produtos-lista'); const listaCli = document.getElementById('rank-clientes-lista');
    listaProd.innerHTML="⏳..."; listaCli.innerHTML="⏳...";
    const snap = await getDocs(collection(db, "pedidos"));
    let prodCount = {}; let cliGasto = {};
    
    snap.forEach(d => {
        let p = d.data(); let [dDia, dMes, dAno] = p.data.split('/');
        if(dMes === mes && dAno === ano && p.status === 'Aprovado') {
            if(p.detalhes_itens) { p.detalhes_itens.forEach(item => { prodCount[item.nome] = (prodCount[item.nome]||0) + 1; }); }
            cliGasto[p.cliente] = (cliGasto[p.cliente]||0) + parseFloat(p.total);
        }
    });

    let arrProd = Object.keys(prodCount).map(k => ({nome:k, qtd:prodCount[k]})).sort((a,b)=>b.qtd - a.qtd);
    listaProd.innerHTML = arrProd.length===0?"<p>Sem vendas aprovadas neste período.</p>":"";
    arrProd.forEach((p,i) => listaProd.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee;"><strong>#${i+1}</strong> ${p.nome} (${p.qtd} un)</div>`);

    let arrCli = Object.keys(cliGasto).map(k => ({nome:k, valor:cliGasto[k]})).sort((a,b)=>b.valor - a.valor);
    listaCli.innerHTML = arrCli.length===0?"<p>Sem clientes neste período.</p>":"";
    arrCli.forEach((c,i) => listaCli.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee;"><strong>#${i+1}</strong> ${c.nome} (R$ ${c.valor.toFixed(2)})</div>`);
}

// Inicialização
carregarConfiguracoes();
carregarForm();
atualizarCarrinho();
carregarProdutosDoBanco();
