import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, setDoc, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSSDixkWzEaP3pbncJ5NhTf_0ZDNgzUtA", authDomain: "maribella-kids.firebaseapp.com",
  databaseURL: "https://maribella-kids-default-rtdb.firebaseio.com", projectId: "maribella-kids",
  storageBucket: "maribella-kids.firebasestorage.app", messagingSenderId: "874601019258", appId: "1:874601019258:web:ec1a308aa526de5a1088c3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); const storage = getStorage(app); const auth = getAuth(app);       

let carrinho = JSON.parse(localStorage.getItem('maribella_carrinho')) || [];
let listaDeProdutos = []; let todosPedidosAdmin = []; let todosProdutosAdmin = []; let todosClientesAdmin = [];
let configLoja = { pix: "Não configurada", telefone: "5581999999999" };
let clienteLogadoCpf = null; let clienteLogadoDados = null;
let carouselIntervals = []; // Para o auto-scroll

// --- MÁSCARAS & UTILIDADES ---
window.mascaraCPF = function(i) { let v = i.value.replace(/\D/g,""); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2"); i.value = v; };
window.mascaraTelefone = function(i) { let v = i.value.replace(/\D/g,""); v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); v = v.replace(/(\d)(\d{4})$/,"$1-$2"); i.value = v; };
window.mostrarNotificacao = function(msg, t = 'sucesso') { const toast = document.getElementById('toast-notificacao'); toast.innerHTML = `${t==='erro'?"❌":t==='info'?"ℹ️":"✅"} ${msg}`; toast.className = `toast show ${t}`; setTimeout(() => toast.className = `toast hidden`, 3500); };
window.removerAcentos = function(str) { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; };
window.abrirLightbox = function(src) { const m = document.getElementById('lightbox-modal'); document.getElementById('lightbox-img').src = src; m.classList.remove('hidden'); };
window.fecharLightbox = function() { document.getElementById('lightbox-modal').classList.add('hidden'); };
window.toggleZoom = function() { document.getElementById('lightbox-img').classList.toggle('zoomed'); };

// --- SIDEBAR MENU E COMPRAS FICTÍCIAS ---
window.toggleMenu = function() { document.getElementById('sidebar-menu').classList.toggle('open'); document.getElementById('sidebar-overlay').classList.toggle('hidden'); };
window.filtrarCategoria = function(categoria) {
    toggleMenu(); const termo = removerAcentos(document.getElementById('busca-input').value);
    let filtrados = listaDeProdutos.filter(p => (categoria === 'Todas' || p.categoria === categoria) && (removerAcentos(p.nome).includes(termo) || removerAcentos(p.material).includes(termo)));
    renderizarVitrinesEstacoes(filtrados, categoria !== 'Todas' ? categoria : null);
};

// GATILHO VENDAS FALSAS
const nomesFakes = ["Ana", "Maria", "Juliana", "Camila", "Fernanda", "Beatriz", "Amanda", "Letícia", "Carla", "Vanessa"];
const cidadesFakes = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Recife, PE", "Salvador, BA", "Fortaleza, CE", "Curitiba, PR", "Manaus, AM", "João Pessoa, PB"];
setInterval(() => {
    let n = nomesFakes[Math.floor(Math.random()*nomesFakes.length)];
    let c = cidadesFakes[Math.floor(Math.random()*cidadesFakes.length)];
    let v = (Math.random() * 100 + 50).toFixed(2);
    mostrarNotificacao(`🛍️ ${n} de ${c} acabou de comprar R$ ${v}!`, 'info');
}, 25000); // A cada 25 segundos sobe uma notificação

// --- CONFIGURAÇÕES DA LOJA ---
async function carregarConfiguracoes() { const snap = await getDoc(doc(db, "config", "loja")); if(snap.exists()) { configLoja = snap.data(); document.getElementById('pix-display').innerText = configLoja.pix; document.getElementById('config-pix').value = configLoja.pix; document.getElementById('config-telefone').value = configLoja.telefone; } }
window.salvarConfiguracoes = async function(e) { e.preventDefault(); const btn = document.getElementById('btn-salvar-config'); btn.innerText = "⏳..."; try { configLoja.pix = document.getElementById('config-pix').value; configLoja.telefone = document.getElementById('config-telefone').value; await setDoc(doc(db, "config", "loja"), configLoja); document.getElementById('pix-display').innerText = configLoja.pix; mostrarNotificacao("Salvo!", "sucesso"); } catch(err) { } btn.innerText = "💾 Atualizar Dados"; };

// --- VITRINE COM CARROSSEL POR ESTAÇÃO ---
window.carregarProdutosDoBanco = async function() {
    try {
        const snap = await getDocs(collection(db, "produtos")); listaDeProdutos = [];
        if (snap.empty) { document.getElementById('vitrine-estacoes').innerHTML = '<p style="text-align:center;color:#aaa;">Nenhuma peça.</p>'; return; }
        snap.forEach(d => { let p = d.data(); p.id = d.id; listaDeProdutos.push(p); });
        renderizarVitrinesEstacoes(listaDeProdutos);
    } catch (e) {}
}

function renderizarVitrinesEstacoes(lista, tituloUnico = null) {
    const container = document.getElementById('vitrine-estacoes'); container.innerHTML = '';
    carouselIntervals.forEach(clearInterval); carouselIntervals = []; // Limpa rolagem

    if(lista.length === 0) { container.innerHTML = '<p style="text-align:center;">Nenhum produto encontrado.</p>'; return; }

    // Se filtrou por categoria específica, mostra tudo junto. Senão, divide por estação.
    if(tituloUnico) { criarSecaoCarrossel(tituloUnico, lista, container); }
    else {
        let verao = lista.filter(p => p.estacao === 'Verão');
        let inverno = lista.filter(p => p.estacao === 'Inverno');
        let outono = lista.filter(p => p.estacao === 'Outono');
        let outros = lista.filter(p => !p.estacao || !['Verão','Inverno','Outono'].includes(p.estacao));

        if(verao.length > 0) criarSecaoCarrossel('Coleção Verão ☀️', verao, container);
        if(inverno.length > 0) criarSecaoCarrossel('Coleção Inverno ❄️', inverno, container);
        if(outono.length > 0) criarSecaoCarrossel('Coleção Outono 🍂', outono, container);
        if(outros.length > 0) criarSecaoCarrossel('Lançamentos 🎀', outros, container);
    }
}

function criarSecaoCarrossel(titulo, produtos, containerMaster) {
    let section = document.createElement('div'); section.className = 'estacao-section';
    section.innerHTML = `<h2 class="estacao-titulo">${titulo}</h2><div class="carousel-container"></div>`;
    let carrossel = section.querySelector('.carousel-container');
    
    produtos.forEach(p => {
        let estoqueTxt = p.estoque > 0 ? `${p.estoque} em estoque` : `<span style="color:red;">Esgotado</span>`;
        let corTxt = p.cores ? ` | <strong>Cor:</strong> ${p.cores}` : '';
        let btnStatus = p.estoque > 0 ? `<button class="btn-add" onclick="adicionarAoCarrinho('${p.id}')">🛒 Quero!</button>` : `<button class="btn-add esgotado">Esgotado</button>`;
        
        carrossel.innerHTML += `<div class="card"><img src="${p.imagem}" onclick="abrirLightbox('${p.imagem}')"><div class="card-info"><div><h3>${p.nome}</h3><p><strong>Tam:</strong> ${p.tamanho}${corTxt}</p><p style="font-size:0.8rem;">${estoqueTxt}</p><p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p></div>${btnStatus}</div></div>`;
    });
    containerMaster.appendChild(section);

    // Auto Scroll a cada 4 segundos
    let autoScroll = setInterval(() => {
        if(carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - 10) carrossel.scrollTo({left:0, behavior:'smooth'});
        else carrossel.scrollBy({left: 280, behavior:'smooth'});
    }, 4000);
    carouselIntervals.push(autoScroll);
}

window.filtrarProdutos = function() { filtrarCategoria('Todas'); };

// --- CARRINHO ---
window.adicionarAoCarrinho = function(id) { 
    let prod = listaDeProdutos.find(p => p.id === id);
    let itemEx = carrinho.find(p => p.id === id);
    let qtdAtual = itemEx ? itemEx.qtd : 0;

    if(qtdAtual + 1 > prod.estoque) return mostrarNotificacao(`Só temos ${prod.estoque} no estoque!`, 'erro');
    if(itemEx) itemEx.qtd++; else carrinho.push({...prod, qtd: 1});
    salvarCarrinhoNoLocal(); mostrarNotificacao("Adicionado!", 'sucesso'); 
};
window.alterarQtdCarrinho = function(index, delta) { 
    let novoQtd = (carrinho[index].qtd || 1) + delta;
    if(novoQtd > carrinho[index].estoque) return mostrarNotificacao("Estoque insuficiente!", 'erro');
    carrinho[index].qtd = novoQtd; if(carrinho[index].qtd <= 0) carrinho.splice(index, 1); salvarCarrinhoNoLocal(); 
};
window.removerDoCarrinho = function(index) { carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
function salvarCarrinhoNoLocal() { localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho)); atualizarCarrinho(); }
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = function() { if(carrinho.length===0) return mostrarNotificacao("Carrinho vazio!",'erro'); document.getElementById('etapa-carrinho').classList.add('hidden'); document.getElementById('etapa-cadastro').classList.remove('hidden'); prepararCheckoutLogado(); };
window.voltarParaCarrinho = function() { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };

function atualizarCarrinho() {
    let totalQtd = 0; carrinho.forEach(i => totalQtd += (i.qtd||1)); document.getElementById('cart-count').innerText = totalQtd;
    const cartItems = document.getElementById('cart-items'); cartItems.innerHTML = ''; let total = 0;
    carrinho.forEach((item, index) => { let qtd = item.qtd || 1; total += parseFloat(item.preco) * qtd; cartItems.innerHTML += `<div class="cart-item" style="display:flex; justify-content:space-between; align-items:center;"><div style="flex:1;"><span style="font-weight:bold; color:#555;">${item.nome}</span><br><span style="font-size:0.85rem; color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span></div><div style="display:flex; align-items:center; gap:8px;"><button onclick="alterarQtdCarrinho(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">-</button><span>${qtd}</span><button onclick="alterarQtdCarrinho(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">+</button><button onclick="removerDoCarrinho(${index})" style="color:red;background:none;border:none;font-weight:bold;font-size:1.2rem;margin-left:5px;">&times;</button></div></div>`; });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

// --- CHECKOUT ---
function validaCamposCheckout() { const cpf = document.getElementById('cliente-cpf').value; const nome = document.getElementById('cliente-nome').value; if(cpf.length < 14 || !nome) return false; return true; }
window.tentarCopiarPix = function() { if(!clienteLogadoCpf && !validaCamposCheckout()) return mostrarNotificacao("Preencha seu cadastro!", "erro"); navigator.clipboard.writeText(configLoja.pix).then(() => mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };
window.tentarFinalizar = function(e) { if(!clienteLogadoCpf && !validaCamposCheckout()) { e.preventDefault(); mostrarNotificacao("Preencha seus dados!", "erro"); } };
window.salvarFormulario = function() { localStorage.setItem('maribella_form', JSON.stringify({ nome: document.getElementById('cliente-nome').value, cpf: document.getElementById('cliente-cpf').value, tel: document.getElementById('cliente-telefone').value, cep: document.getElementById('cliente-cep').value, uf: document.getElementById('cliente-estado').value, rua: document.getElementById('cliente-rua').value, num: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, ref: document.getElementById('cliente-ref').value })); };
function carregarForm() { const s = JSON.parse(localStorage.getItem('maribella_form')); if(s && !clienteLogadoCpf) { document.getElementById('cliente-nome').value=s.nome||''; document.getElementById('cliente-cpf').value=s.cpf||''; document.getElementById('cliente-telefone').value=s.tel||''; document.getElementById('cliente-cep').value=s.cep||''; document.getElementById('cliente-estado').value=s.uf||''; document.getElementById('cliente-rua').value=s.rua||''; document.getElementById('cliente-numero').value=s.num||''; document.getElementById('cliente-bairro').value=s.bairro||''; document.getElementById('cliente-ref').value=s.ref||''; } }
window.buscarCep = async function(cepV, pref) { let cep = cepV.replace(/\D/g, ''); if (cep.length === 8) { try { let data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json(); if (!data.erro) { document.getElementById(`${pref}-rua`).value = data.logradouro; document.getElementById(`${pref}-bairro`).value = data.bairro; document.getElementById(`${pref}-estado`).value = data.uf; if(pref==='cliente') salvarFormulario(); } } catch(err) {} } };

window.finalizarCheckout = async function(e) {
    e.preventDefault(); const btn = document.getElementById('btn-finalizar-checkout'); btn.disabled=true; btn.innerText="⏳...";
    const cpf = document.getElementById('cliente-cpf').value.replace(/\D/g,''); const nome = document.getElementById('cliente-nome').value; const tel = document.getElementById('cliente-telefone').value; const bairroCidade = document.getElementById('cliente-bairro').value; const endereco = `${document.getElementById('cliente-rua').value}, ${document.getElementById('cliente-numero').value} - ${bairroCidade}`; const total = document.getElementById('total-price').innerText;

    try {
        let dadosC = { nome, cpf, telefone: tel, cep: document.getElementById('cliente-cep').value, rua: document.getElementById('cliente-rua').value, numero: document.getElementById('cliente-numero').value, bairro: bairroCidade, estado: document.getElementById('cliente-estado').value, ref: document.getElementById('cliente-ref').value };
        if(!clienteLogadoCpf) dadosC.senha = document.getElementById('cliente-senha').value;
        await setDoc(doc(db, "clientes", cpf), dadosC, { merge: true });
        
        let strItens = carrinho.map(i=> `${i.qtd||1}x ${i.nome}`).join(", "); const dataH = new Date();
        await addDoc(collection(db, "pedidos"), { cliente: nome, cpf, cidade: bairroCidade, telefone: tel, endereco, observacao: document.getElementById('cliente-obs').value, itens: strItens, detalhes_itens: carrinho, total, data: dataH.toLocaleDateString('pt-BR'), hora: dataH.toLocaleTimeString('pt-BR'), timestamp: dataH.toISOString(), status: "Pendente" });
        
        // Desconta do estoque
        for(let item of carrinho) {
            let novaQtd = (item.estoque || 0) - (item.qtd || 1);
            await updateDoc(doc(db, "produtos", item.id), { estoque: novaQtd >= 0 ? novaQtd : 0 });
        }
    } catch (e) { console.error(e); }

    let msg = `Olá! Sou ${nome} e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`; carrinho.forEach(i => msg += `- ${i.qtd||1}x ${i.nome} (R$ ${parseFloat(i.preco).toFixed(2)})\n`); msg += `\n💰 *TOTAL:* R$ ${total}\n📦 *ENTREGA:* ${endereco}\n`;
    let zapGestora = configLoja.telefone.replace(/\D/g,''); window.open(`https://wa.me/${zapGestora}?text=${encodeURIComponent(msg)}`, '_blank');
    carrinho = []; salvarCarrinhoNoLocal(); localStorage.removeItem('maribella_form'); toggleCart();
    btn.disabled=false; btn.innerText="💾 Enviar Pedido"; carregarProdutosDoBanco(); // Recarrega vitrine para atualizar estoque visual
};

function prepararCheckoutLogado() {
    if(clienteLogadoCpf && clienteLogadoDados) {
        document.getElementById('checkout-login-box').style.display = 'none'; document.getElementById('area-senha-nova').style.display = 'none'; document.getElementById('cliente-senha').required = false;
        document.getElementById('cliente-nome').value = clienteLogadoDados.nome; document.getElementById('cliente-cpf').value = clienteLogadoDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); document.getElementById('cliente-telefone').value = clienteLogadoDados.telefone; document.getElementById('cliente-cep').value = clienteLogadoDados.cep; document.getElementById('cliente-estado').value = clienteLogadoDados.estado; document.getElementById('cliente-rua').value = clienteLogadoDados.rua; document.getElementById('cliente-numero').value = clienteLogadoDados.numero; document.getElementById('cliente-bairro').value = clienteLogadoDados.bairro; document.getElementById('cliente-ref').value = clienteLogadoDados.ref || '';
    } else { document.getElementById('checkout-login-box').style.display = 'block'; document.getElementById('area-senha-nova').style.display = 'block'; document.getElementById('cliente-senha').required = true; }
}
window.loginRapidoCheckout = async function() {
    const cpf = document.getElementById('checkout-cpf-rapido').value.replace(/\D/g,''); const senha = document.getElementById('checkout-senha-rapida').value;
    if(cpf.length !== 11 || !senha) return mostrarNotificacao("Preencha CPF e Senha.", "erro");
    const d = await getDoc(doc(db, "clientes", cpf));
    if (d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha})); atualizarHeaderLogado(); prepararCheckoutLogado(); mostrarNotificacao("Preenchido!", "sucesso"); } else { mostrarNotificacao("Incorretos.", "erro"); }
};

// --- ADMINISTRAÇÃO ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');
window.realizarLoginAdmin = async function(e) { e.preventDefault(); try { await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value); mostrarNotificacao("Acesso Liberado!", "sucesso"); fecharLoginAdmin(); document.getElementById('admin-dashboard').classList.remove('hidden'); carregarListaAdminPedidos(); e.target.reset(); } catch(e) { mostrarNotificacao("Erro!", "erro"); } };
window.sairDoAdmin = async function() { await signOut(auth); document.getElementById('admin-dashboard').classList.add('hidden'); carregarProdutosDoBanco(); };
window.mudarAbaAdmin = function(abaId) { document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden')); document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa')); document.getElementById(abaId).classList.remove('hidden'); document.getElementById(`tab-${abaId}`).classList.add('ativa'); if(abaId==='admin-pedidos') carregarListaAdminPedidos(); if(abaId==='admin-produtos') carregarListaAdminProdutosEditar(); if(abaId==='admin-clientes') carregarListaAdminClientes(); };

// Pedidos Admin (Voltar Pendente e Lixeira)
async function carregarListaAdminPedidos() {
    const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "⏳...";
    const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc")));
    todosPedidosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosPedidosAdmin.push(p); }); filtrarPedidosAdmin();
}
window.filtrarPedidosAdmin = function() {
    const termo = removerAcentos(document.getElementById('busca-pedido').value); const filtro = document.getElementById('filtro-status').value; const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "";
    let res = todosPedidosAdmin.filter(p => { let matchTermo = removerAcentos(p.cliente).includes(termo) || (p.cidade && removerAcentos(p.cidade).includes(termo)) || p.cpf.includes(termo); let matchStatus = filtro === 'Todos' || p.status === filtro; return matchTermo && matchStatus; });
    if(res.length === 0) lista.innerHTML = "<p>Nenhum pedido.</p>";
    res.forEach(p => { 
        let btnAprovar = p.status === 'Pendente' ? `<button onclick="aprovarPedido('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">✅ Aprovar Pagamento</button>` : '';
        let btnVoltar = p.status !== 'Pendente' ? `<button onclick="voltarPendentePedido('${p.id}')" style="background:#f39c12; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">↩️ Voltar para Pendente</button>` : '';
        let btnExcluir = `<button onclick="excluirPedidoAdmin('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🗑️ Excluir</button>`;
        
        lista.innerHTML += `<div class="admin-card"><strong style="color:var(--primary);">Data: ${p.data} às ${p.hora}</strong><br><strong>Cliente:</strong> ${p.cliente}<br><strong>Total:</strong> R$ ${p.total} (${p.itens})<br><span style="font-weight:bold;">Status: ${p.status}</span><div style="display:flex; gap:10px; margin-top:10px;">${btnAprovar}${btnVoltar}${btnExcluir}</div></div>`; 
    });
}
window.aprovarPedido = async function(id) { await updateDoc(doc(db, "pedidos", id), { status: "Aprovado" }); carregarListaAdminPedidos(); };
window.voltarPendentePedido = async function(id) { if(confirm("Deseja voltar este pedido para Pendente?")) { await updateDoc(doc(db, "pedidos", id), { status: "Pendente" }); mostrarNotificacao("Atualizado!", "info"); carregarListaAdminPedidos(); } };
window.excluirPedidoAdmin = async function(id) { if(confirm("Tem certeza que deseja APAGAR este pedido do sistema para sempre?")) { await deleteDoc(doc(db, "pedidos", id)); mostrarNotificacao("Excluído!", "erro"); carregarListaAdminPedidos(); } };

// Produtos Admin (Com Categoria e Estoque)
window.salvarProdutoAdmin = async function(e) { e.preventDefault(); const btn = document.getElementById('btn-salvar-produto'); const img = document.getElementById('add-imagem-file').files[0]; const id = document.getElementById('edit-produto-id').value; btn.innerText = "⏳..."; btn.disabled = true; try { let urlFoto = null; if (img) { const sRef = ref(storage, 'produtos/' + Date.now() + '_' + img.name); await uploadBytes(sRef, img); urlFoto = await getDownloadURL(sRef); } 
    const pData = { nome: document.getElementById('add-nome').value, preco: parseFloat(document.getElementById('add-preco').value), estoque: parseInt(document.getElementById('add-estoque').value), categoria: document.getElementById('add-categoria').value, estacao: document.getElementById('add-estacao').value, tamanho: document.getElementById('add-tamanho').value, cores: document.getElementById('add-cores').value, material: document.getElementById('add-material').value }; 
    if(urlFoto) pData.imagem = urlFoto; 
    if (id) { await updateDoc(doc(db, "produtos", id), pData); } else { if(!urlFoto) return mostrarNotificacao("Foto obrigatória!","erro"); await addDoc(collection(db, "produtos"), pData); } 
    limparFormProduto(); carregarListaAdminProdutosEditar(); mostrarNotificacao("Sucesso!","sucesso"); } catch(e) { mostrarNotificacao("Erro","erro"); } btn.innerText = "💾 Salvar Produto"; btn.disabled = false; };
window.limparFormProduto = function() { document.getElementById('form-add-produto').reset(); document.getElementById('edit-produto-id').value=''; };
async function carregarListaAdminProdutosEditar() { const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "produtos")); todosProdutosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosProdutosAdmin.push(p); }); filtrarProdutosAdmin(); }
window.filtrarProdutosAdmin = function() { const termo = removerAcentos(document.getElementById('busca-produto-admin').value); const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = ""; let res = todosProdutosAdmin.filter(p => removerAcentos(p.nome).includes(termo)); if(res.length === 0) lista.innerHTML = "<p>Nenhum produto.</p>"; res.forEach(p => { lista.innerHTML += `<div class="admin-card" style="display:flex; align-items:center; gap:15px; padding:10px;"><img src="${p.imagem}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div style="flex:1;"><strong>${p.nome}</strong><br>Estoque: ${p.estoque||0} | R$ ${p.preco}</div><button onclick="editarProdutoAdmin('${p.id}', '${p.nome}', ${p.preco}, '${p.tamanho}', '${p.material}', ${p.estoque||0}, '${p.cores||''}', '${p.categoria||'Vestido'}', '${p.estacao||'Verão'}')" class="btn-icon" style="background:var(--secondary); color:white;">✏️</button></div>`; }); }
window.editarProdutoAdmin = function(id, n, p, t, m, estq, cor, cat, estc) { document.getElementById('edit-produto-id').value=id; document.getElementById('add-nome').value=n; document.getElementById('add-preco').value=p; document.getElementById('add-estoque').value=estq; document.getElementById('add-categoria').value=cat; document.getElementById('add-estacao').value=estc; document.getElementById('add-tamanho').value=t; document.getElementById('add-cores').value=cor; document.getElementById('add-material').value=m; document.querySelector('.admin-content').scrollTo(0,0); };

// Clientes Admin
async function carregarListaAdminClientes() { const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "clientes")); todosClientesAdmin = []; snap.forEach(d => todosClientesAdmin.push(d.data())); filtrarClientesAdmin(); }
window.filtrarClientesAdmin = function() { const termo = removerAcentos(document.getElementById('busca-cliente-admin').value); const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = ""; let res = todosClientesAdmin.filter(c => removerAcentos(c.nome).includes(termo) || c.telefone.includes(termo) || (c.cpf && c.cpf.includes(termo))); if(res.length === 0) lista.innerHTML = "<p>Nenhum cliente.</p>"; res.forEach(c => { let telLimpo = c.telefone.replace(/\D/g, ''); lista.innerHTML += `<div class="admin-card" style="display:flex; justify-content:space-between; align-items:center;"><div><strong>${c.nome}</strong><br><span>${c.telefone}</span></div><a href="https://wa.me/55${telLimpo}" target="_blank" style="background:#25D366; color:white; padding:10px; border-radius:50%; text-decoration:none;">💬</a></div>`; }); }

// Inicialização
const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.cpf, logado.senha);
carregarConfiguracoes(); carregarForm(); atualizarCarrinho(); carregarProdutosDoBanco();
