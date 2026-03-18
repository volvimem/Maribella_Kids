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
let configLoja = { pix: "", telefone: "5581999999999", aviso: "Enviamos para todo o Brasil. Frete via WhatsApp!", instagram: "https://instagram.com/maribellakids", endereco: "Sua Cidade, Estado" };
let clienteLogadoCpf = null; let clienteLogadoDados = null;
let meusPedidosSalvos = []; let pedidoEmEdicao = null;
let carouselIntervals = [];

// --- FUNÇÕES GLOBAIS E MÁSCARAS ---
window.mascaraCPF = (i) => { let v = i.value.replace(/\D/g,""); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2"); i.value = v; };
window.mascaraTelefone = (i) => { let v = i.value.replace(/\D/g,""); v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); v = v.replace(/(\d)(\d{4})$/,"$1-$2"); i.value = v; };
window.removerAcentos = (str) => { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; };

// NOTIFICAÇÕES (COM X PARA FECHAR E TEMPO ALEATÓRIO DE 1 A 5 MIN)
window.mostrarNotificacao = (msg, t = 'sucesso', fechavel = false) => { 
    const toast = document.getElementById('toast-notificacao'); 
    let fecharBtn = fechavel ? `<span onclick="window.fecharToast()" style="margin-left:15px; cursor:pointer; font-size:1.5rem; color:#666;">&times;</span>` : '';
    toast.innerHTML = `<span style="flex:1;">${t==='erro'?"❌":t==='info'?"🛍️":"✅"} ${msg}</span> ${fecharBtn}`; 
    toast.className = `toast show ${t}`; 
    if(!fechavel) setTimeout(window.fecharToast, 3500); 
};
window.fecharToast = () => { document.getElementById('toast-notificacao').className = 'toast hidden'; };

const nomesFakes = ["Ana", "Maria", "Juliana", "Camila", "Fernanda", "Beatriz", "Amanda", "Letícia", "Carla", "Vanessa"];
const cidadesFakes = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Recife, PE", "Salvador, BA", "Fortaleza, CE", "Curitiba, PR", "Manaus, AM", "Brasília, DF", "Goiânia, GO", "Belém, PA", "Porto Alegre, RS", "Campinas, SP", "São Luís, MA", "Maceió, AL", "Natal, RN", "Teresina, PI", "Florianópolis, SC", "Surubim, PE", "Caruaru, PE", "Campina Grande, PB", "Feira de Santana, BA"];

function dispararVendaFalsa() {
    let n = nomesFakes[Math.floor(Math.random()*nomesFakes.length)];
    let c = cidadesFakes[Math.floor(Math.random()*cidadesFakes.length)];
    let v = (Math.random() * (250 - 50) + 50).toFixed(2);
    mostrarNotificacao(`${n} de ${c} comprou R$ ${v}!`, 'info', true);
    
    setTimeout(window.fecharToast, 10000); // Some sozinho depois de 10s se não fechar no X
    
    // Dispara a próxima notificação entre 1 min e 5 min
    let tempoAleatorio = Math.floor(Math.random() * (300000 - 60000 + 1)) + 60000;
    setTimeout(dispararVendaFalsa, tempoAleatorio);
}
// Começa a primeira notificação após uns 30 segundos
setTimeout(dispararVendaFalsa, Math.random() * 30000 + 30000);

// CONTADOR DE PESSOAS ONLINE FAKE (1280 a 8630)
function atualizarPessoasOnline() {
    let el = document.getElementById('online-count');
    if(!el) return;
    let current = parseInt(el.innerText.replace('.', ''));
    let variacao = Math.floor(Math.random() * 50) - 20; // Sobe e desce
    let novoValor = current + variacao;
    if(novoValor < 1280) novoValor = 1280 + Math.floor(Math.random()*100);
    if(novoValor > 8630) novoValor = 8630 - Math.floor(Math.random()*100);
    
    el.innerText = novoValor.toLocaleString('pt-BR');
    setTimeout(atualizarPessoasOnline, Math.random() * 5000 + 3000); // Muda a cada 3 a 8 segundos
}
setTimeout(atualizarPessoasOnline, 3000);


// --- LUPA DE BUSCA, MENU E LIGHTBOX ---
window.toggleBusca = () => { 
    let b = document.getElementById('busca-container'); b.classList.toggle('hidden'); 
    if(!b.classList.contains('hidden')) document.getElementById('busca-input').focus(); 
};
window.abrirLightbox = (src) => { document.getElementById('lightbox-img').src = src; document.getElementById('lightbox-modal').classList.remove('hidden'); };
window.fecharLightbox = () => { document.getElementById('lightbox-modal').classList.add('hidden'); };
window.toggleZoom = () => { document.getElementById('lightbox-img').classList.toggle('zoomed'); };

// MENU LATERAL 100% BLINDADO (Usando Event Listener Direto)
document.getElementById('btn-abrir-menu').addEventListener('click', () => {
    document.getElementById('sidebar-menu').classList.add('open');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
});
document.getElementById('btn-fechar-menu').addEventListener('click', fecharMenu);
document.getElementById('sidebar-overlay').addEventListener('click', fecharMenu);

function fecharMenu() {
    document.getElementById('sidebar-menu').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}
window.filtrarCategoria = (cat) => {
    fecharMenu(); 
    const termo = removerAcentos(document.getElementById('busca-input').value);
    let filtrados = listaDeProdutos.filter(p => (cat === 'Todas' || p.categoria === cat) && (removerAcentos(p.nome).includes(termo) || removerAcentos(p.material).includes(termo)));
    renderizarVitrinesCategorias(filtrados, cat !== 'Todas' ? cat : null);
};

// --- CONFIGURAÇÕES DA LOJA ---
async function carregarConfiguracoes() { 
    const snap = await getDoc(doc(db, "config", "loja")); 
    if(snap.exists()) { 
        configLoja = snap.data(); 
        document.getElementById('pix-display').innerText = configLoja.pix; document.getElementById('config-pix').value = configLoja.pix; 
        document.getElementById('config-telefone').value = configLoja.telefone; document.getElementById('config-aviso').value = configLoja.aviso || "";
        document.getElementById('config-instagram').value = configLoja.instagram || ""; document.getElementById('config-endereco').value = configLoja.endereco || "";
    } 
    document.getElementById('texto-aviso-loja').innerText = configLoja.aviso || "Enviamos para todo o Brasil.";
    document.getElementById('footer-instagram-link').href = configLoja.instagram || "#";
    document.getElementById('footer-endereco-texto').innerText = configLoja.endereco || "Nossa Loja";
    document.getElementById('menu-endereco-info').innerText = configLoja.endereco || "Nossa Loja";
}
window.salvarConfiguracoes = async (e) => { 
    e.preventDefault(); const btn = document.getElementById('btn-salvar-config'); btn.innerText = "⏳..."; 
    try { 
        configLoja.pix = document.getElementById('config-pix').value; configLoja.telefone = document.getElementById('config-telefone').value; configLoja.aviso = document.getElementById('config-aviso').value; configLoja.instagram = document.getElementById('config-instagram').value; configLoja.endereco = document.getElementById('config-endereco').value;
        await setDoc(doc(db, "config", "loja"), configLoja); 
        document.getElementById('pix-display').innerText = configLoja.pix; document.getElementById('texto-aviso-loja').innerText = configLoja.aviso; document.getElementById('footer-instagram-link').href = configLoja.instagram; document.getElementById('footer-endereco-texto').innerText = configLoja.endereco;
        mostrarNotificacao("Salvo!", "sucesso"); 
    } catch(err) {} btn.innerText = "💾 Atualizar Dados"; 
};

// --- STORIES & VITRINE ---
window.carregarProdutosDoBanco = async () => {
    try {
        const snap = await getDocs(collection(db, "produtos")); listaDeProdutos = [];
        if (snap.empty) { document.getElementById('vitrine-estacoes').innerHTML = '<p style="text-align:center;color:#aaa;">Nenhuma peça.</p>'; return; }
        snap.forEach(d => { let p = d.data(); p.id = d.id; listaDeProdutos.push(p); });
        renderizarStories(); renderizarVitrinesCategorias(listaDeProdutos);
    } catch (e) {}
}

function renderizarStories() {
    const track = document.getElementById('stories-track'); track.innerHTML = '';
    let storyList = [...listaDeProdutos, ...listaDeProdutos, ...listaDeProdutos]; 
    storyList.forEach(p => { track.innerHTML += `<img src="${p.imagem}" class="story-circle" onclick="abrirLightbox('${p.imagem}')" title="${p.nome}">`; });
}

function renderizarVitrinesCategorias(lista, tituloUnico = null) {
    const container = document.getElementById('vitrine-estacoes'); container.innerHTML = '';
    carouselIntervals.forEach(clearInterval); carouselIntervals = [];

    if(lista.length === 0) { container.innerHTML = '<p style="text-align:center;">Nenhum produto encontrado.</p>'; return; }

    let indexFila = 0; 
    if(tituloUnico) { criarSecaoCarrossel(tituloUnico, lista, container, indexFila); } 
    else {
        let lancamentos = lista.filter(p => p.categoria === 'Lançamento'); let vestidos = lista.filter(p => p.categoria === 'Vestido'); let shorts = lista.filter(p => p.categoria === 'Short/Calça/Saia'); let blusas = lista.filter(p => p.categoria === 'Blusa/Cropped/Body'); let conjuntos = lista.filter(p => p.categoria === 'Conjunto');
        if(lancamentos.length > 0) criarSecaoCarrossel('Lançamentos 🌟', lancamentos, container, indexFila++);
        if(shorts.length > 0) criarSecaoCarrossel('Shorts e Saias 👖', shorts, container, indexFila++);
        if(blusas.length > 0) criarSecaoCarrossel('Blusas e Bodies 👚', blusas, container, indexFila++);
        if(vestidos.length > 0) criarSecaoCarrossel('Vestidos 👗', vestidos, container, indexFila++);
        if(conjuntos.length > 0) criarSecaoCarrossel('Conjuntos 👯‍♀️', conjuntos, container, indexFila++);
    }
}

function criarSecaoCarrossel(titulo, produtos, containerMaster, indexFila) {
    let section = document.createElement('div'); section.className = 'estacao-section';
    section.innerHTML = `<h2 class="estacao-titulo">${titulo}</h2><div class="carousel-container"></div>`;
    let carrossel = section.querySelector('.carousel-container');
    
    produtos.forEach(p => {
        let btnStatus = p.estoque > 0 ? `<button class="btn-add" onclick="adicionarAoCarrinho('${p.id}')">🛒 Quero</button>` : `<button class="btn-add esgotado">Esgotado</button>`;
        carrossel.innerHTML += `<div class="card"><img src="${p.imagem}" onclick="abrirLightbox('${p.imagem}')"><div class="card-info"><div><h3>${p.nome}</h3><p style="font-size:0.75rem;">Tam: ${p.tamanho}</p><p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p></div>${btnStatus}</div></div>`;
    });
    containerMaster.appendChild(section);

    let direcao = (indexFila % 2 === 0) ? 1 : -1;
    if(direcao === -1) setTimeout(() => carrossel.scrollLeft = carrossel.scrollWidth, 300);

    let autoScroll = setInterval(() => {
        if(!carrossel.querySelector('.card')) return;
        let cardWidth = carrossel.querySelector('.card').clientWidth + 10;
        if(direcao === 1) { 
            if(carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - 10) carrossel.scrollTo({left:0, behavior:'smooth'});
            else carrossel.scrollBy({left: cardWidth, behavior:'smooth'});
        } else { 
            if(carrossel.scrollLeft <= 10) carrossel.scrollTo({left:carrossel.scrollWidth, behavior:'smooth'});
            else carrossel.scrollBy({left: -cardWidth, behavior:'smooth'});
        }
    }, 4500); 
    carouselIntervals.push(autoScroll);
}
window.filtrarProdutos = () => { let t = document.getElementById('busca-input').value; if(t) renderizarVitrinesCategorias(listaDeProdutos.filter(p => removerAcentos(p.nome).includes(removerAcentos(t))), "Resultados da Busca"); else renderizarVitrinesCategorias(listaDeProdutos); };

// --- CARRINHO BÁSICO E CHECKOUT ---
window.adicionarAoCarrinho = (id) => { let prod = listaDeProdutos.find(p => p.id === id); let itemEx = carrinho.find(p => p.id === id); let qtdAtual = itemEx ? itemEx.qtd : 0; if(qtdAtual + 1 > prod.estoque) return mostrarNotificacao("Sem estoque suficiente!", 'erro'); if(itemEx) itemEx.qtd++; else carrinho.push({...prod, qtd: 1}); salvarCarrinhoNoLocal(); mostrarNotificacao("Adicionado!", 'sucesso'); };
window.alterarQtdCarrinho = (index, delta) => { let novoQtd = (carrinho[index].qtd || 1) + delta; if(novoQtd > carrinho[index].estoque) return mostrarNotificacao("Estoque insuficiente!", 'erro'); carrinho[index].qtd = novoQtd; if(carrinho[index].qtd <= 0) carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
window.removerDoCarrinho = (index) => { carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
function salvarCarrinhoNoLocal() { localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho)); atualizarCarrinho(); }
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = () => { if(carrinho.length===0) return mostrarNotificacao("Carrinho vazio!",'erro'); document.getElementById('etapa-carrinho').classList.add('hidden'); document.getElementById('etapa-cadastro').classList.remove('hidden'); prepararCheckoutLogado(); };
window.voltarParaCarrinho = () => { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };

function atualizarCarrinho() {
    let totalQtd = 0; carrinho.forEach(i => totalQtd += (i.qtd||1)); document.getElementById('cart-count').innerText = totalQtd;
    const cartItems = document.getElementById('cart-items'); cartItems.innerHTML = ''; let total = 0;
    carrinho.forEach((item, index) => { let qtd = item.qtd || 1; total += parseFloat(item.preco) * qtd; cartItems.innerHTML += `<div class="cart-item" style="display:flex; justify-content:space-between; align-items:center;"><div style="flex:1;"><span style="font-weight:bold; color:#555;">${item.nome}</span><br><span style="font-size:0.85rem; color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span></div><div style="display:flex; align-items:center; gap:8px;"><button onclick="alterarQtdCarrinho(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">-</button><span>${qtd}</span><button onclick="alterarQtdCarrinho(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">+</button><button onclick="removerDoCarrinho(${index})" style="color:red;background:none;border:none;font-weight:bold;font-size:1.2rem;margin-left:5px;">&times;</button></div></div>`; });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

function validaCamposCheckout() { const cpf = document.getElementById('cliente-cpf').value; const nome = document.getElementById('cliente-nome').value; if(cpf.length < 14 || !nome) return false; return true; }
window.tentarCopiarPix = () => { if(!clienteLogadoCpf && !validaCamposCheckout()) return mostrarNotificacao("Preencha seu cadastro!", "erro"); navigator.clipboard.writeText(configLoja.pix).then(() => mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };
window.tentarFinalizar = (e) => { if(!clienteLogadoCpf && !validaCamposCheckout()) { e.preventDefault(); mostrarNotificacao("Preencha seus dados!", "erro"); } };
window.salvarFormulario = () => { localStorage.setItem('maribella_form', JSON.stringify({ nome: document.getElementById('cliente-nome').value, cpf: document.getElementById('cliente-cpf').value, tel: document.getElementById('cliente-telefone').value, cep: document.getElementById('cliente-cep').value, uf: document.getElementById('cliente-estado').value, rua: document.getElementById('cliente-rua').value, num: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, ref: document.getElementById('cliente-ref').value })); };
function carregarForm() { const s = JSON.parse(localStorage.getItem('maribella_form')); if(s && !clienteLogadoCpf) { document.getElementById('cliente-nome').value=s.nome||''; document.getElementById('cliente-cpf').value=s.cpf||''; document.getElementById('cliente-telefone').value=s.tel||''; document.getElementById('cliente-cep').value=s.cep||''; document.getElementById('cliente-estado').value=s.uf||''; document.getElementById('cliente-rua').value=s.rua||''; document.getElementById('cliente-numero').value=s.num||''; document.getElementById('cliente-bairro').value=s.bairro||''; document.getElementById('cliente-ref').value=s.ref||''; } }
window.buscarCep = async (cepV, pref) => { let cep = cepV.replace(/\D/g, ''); if (cep.length === 8) { try { let data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json(); if (!data.erro) { document.getElementById(`${pref}-rua`).value = data.logradouro; document.getElementById(`${pref}-bairro`).value = data.bairro; document.getElementById(`${pref}-estado`).value = data.uf; if(pref==='cliente') salvarFormulario(); } } catch(err) {} } };

window.finalizarCheckout = async (e) => {
    e.preventDefault(); const btn = document.getElementById('btn-finalizar-checkout'); btn.disabled=true; btn.innerText="⏳...";
    const cpf = document.getElementById('cliente-cpf').value.replace(/\D/g,''); const nome = document.getElementById('cliente-nome').value; const tel = document.getElementById('cliente-telefone').value; const bairroCidade = document.getElementById('cliente-bairro').value; const endereco = `${document.getElementById('cliente-rua').value}, ${document.getElementById('cliente-numero').value} - ${bairroCidade}`; const total = document.getElementById('total-price').innerText;

    try {
        let dadosC = { nome, cpf, telefone: tel, cep: document.getElementById('cliente-cep').value, rua: document.getElementById('cliente-rua').value, numero: document.getElementById('cliente-numero').value, bairro: bairroCidade, estado: document.getElementById('cliente-estado').value, ref: document.getElementById('cliente-ref').value };
        if(!clienteLogadoCpf) dadosC.senha = document.getElementById('cliente-senha').value;
        await setDoc(doc(db, "clientes", cpf), dadosC, { merge: true });
        
        let strItens = carrinho.map(i=> `${i.qtd||1}x ${i.nome}`).join(", "); const dataH = new Date();
        await addDoc(collection(db, "pedidos"), { cliente: nome, cpf, cidade: bairroCidade, telefone: tel, endereco, observacao: document.getElementById('cliente-obs').value, itens: strItens, detalhes_itens: carrinho, total, data: dataH.toLocaleDateString('pt-BR'), hora: dataH.toLocaleTimeString('pt-BR'), timestamp: dataH.toISOString(), status: "Pendente" });
        
        for(let item of carrinho) { let novaQtd = (item.estoque || 0) - (item.qtd || 1); await updateDoc(doc(db, "produtos", item.id), { estoque: novaQtd >= 0 ? novaQtd : 0 }); }
    } catch (e) {}

    let msg = `Olá! Sou ${nome} e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`; carrinho.forEach(i => msg += `- ${i.qtd||1}x ${i.nome} (R$ ${parseFloat(i.preco).toFixed(2)})\n`); msg += `\n💰 *TOTAL:* R$ ${total}\n📦 *ENTREGA:* ${endereco}\n`;
    let zapGestora = configLoja.telefone.replace(/\D/g,''); window.open(`https://wa.me/${zapGestora}?text=${encodeURIComponent(msg)}`, '_blank');
    carrinho = []; localStorage.removeItem('maribella_carrinho'); localStorage.removeItem('maribella_form'); toggleCart(); btn.disabled=false; btn.innerText="💾 Enviar Pedido"; carregarProdutosDoBanco();
};

function prepararCheckoutLogado() { if(clienteLogadoCpf && clienteLogadoDados) { document.getElementById('checkout-login-box').style.display = 'none'; document.getElementById('area-senha-nova').style.display = 'none'; document.getElementById('cliente-senha').required = false; document.getElementById('cliente-nome').value = clienteLogadoDados.nome; document.getElementById('cliente-cpf').value = clienteLogadoDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); document.getElementById('cliente-telefone').value = clienteLogadoDados.telefone; document.getElementById('cliente-cep').value = clienteLogadoDados.cep; document.getElementById('cliente-estado').value = clienteLogadoDados.estado; document.getElementById('cliente-rua').value = clienteLogadoDados.rua; document.getElementById('cliente-numero').value = clienteLogadoDados.numero; document.getElementById('cliente-bairro').value = clienteLogadoDados.bairro; document.getElementById('cliente-ref').value = clienteLogadoDados.ref || ''; } else { document.getElementById('checkout-login-box').style.display = 'block'; document.getElementById('area-senha-nova').style.display = 'block'; document.getElementById('cliente-senha').required = true; } }
window.loginRapidoCheckout = async () => { const cpf = document.getElementById('checkout-cpf-rapido').value.replace(/\D/g,''); const senha = document.getElementById('checkout-senha-rapida').value; if(cpf.length !== 11 || !senha) return mostrarNotificacao("Preencha CPF e Senha.", "erro"); const d = await getDoc(doc(db, "clientes", cpf)); if (d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha})); atualizarHeaderLogado(); prepararCheckoutLogado(); mostrarNotificacao("Preenchido!", "sucesso"); } else { mostrarNotificacao("Incorretos.", "erro"); } };

// --- LOGIN DO CLIENTE E PERFIL ---
window.verificarLoginCliente = () => { const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.cpf, logado.senha); else document.getElementById('cliente-login-modal').classList.remove('hidden'); }
window.fecharLoginCliente = () => document.getElementById('cliente-login-modal').classList.add('hidden');
window.fecharPerfil = () => document.getElementById('perfil-cliente-modal').classList.add('hidden');
async function autoLogin(cpf, senha) { const d = await getDoc(doc(db, "clientes", cpf)); if(d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); atualizarHeaderLogado(); abrirPainelCliente(d.data()); } else { localStorage.removeItem('maribella_auth_cliente'); document.getElementById('cliente-login-modal').classList.remove('hidden'); } }
function atualizarHeaderLogado() { document.getElementById('btn-header-pedidos').innerText = clienteLogadoDados ? `📦 ${clienteLogadoDados.nome.split(' ')[0]}` : `📦 Entrar`; }
window.realizarLoginCliente = async (e) => { e.preventDefault(); const cpf = document.getElementById('login-cpf-cliente').value.replace(/\D/g,''); const senha = document.getElementById('login-senha-cliente').value; const manter = document.getElementById('lembrar-senha').checked; mostrarNotificacao("Verificando...", "info"); const d = await getDoc(doc(db, "clientes", cpf)); if(d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); if(manter) localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha})); atualizarHeaderLogado(); fecharLoginCliente(); abrirPainelCliente(d.data()); e.target.reset(); } else mostrarNotificacao("CPF/Senha incorretos.", "erro"); };
window.abrirRecuperacaoSenha = () => { fecharLoginCliente(); document.getElementById('recuperacao-modal').classList.remove('hidden'); };
window.fecharRecuperacao = () => document.getElementById('recuperacao-modal').classList.add('hidden');
window.recuperarSenhaCliente = async (e) => { e.preventDefault(); const cpf = document.getElementById('rec-cpf').value.replace(/\D/g,''); const tel = document.getElementById('rec-tel').value; const novaSenha = document.getElementById('rec-senha').value; const docRef = doc(db, "clientes", cpf); const d = await getDoc(docRef); if(d.exists() && d.data().telefone === tel) { await updateDoc(docRef, {senha: novaSenha}); mostrarNotificacao("Senha alterada!", "sucesso"); fecharRecuperacao(); document.getElementById('cliente-login-modal').classList.remove('hidden'); e.target.reset(); } else { mostrarNotificacao("Dados não conferem.", "erro"); } };
window.mudarAbaCliente = (idAba) => { document.getElementById('aba-historico').classList.add('hidden'); document.getElementById('aba-dados').classList.add('hidden'); document.getElementById('btn-aba-historico').classList.remove('ativa'); document.getElementById('btn-aba-historico').style.color='#aaa'; document.getElementById('btn-aba-dados').classList.remove('ativa'); document.getElementById('btn-aba-dados').style.color='#aaa'; document.getElementById(idAba).classList.remove('hidden'); document.getElementById('btn-'+idAba).classList.add('ativa'); document.getElementById('btn-'+idAba).style.color='var(--primary)'; }
async function abrirPainelCliente(dados) { document.getElementById('perfil-cliente-modal').classList.remove('hidden'); document.getElementById('titulo-painel-cliente').innerText = `👤 Oi, ${dados.nome.split(' ')[0]}`; document.getElementById('perfil-cpf').value = dados.cpf; document.getElementById('perfil-nome').value = dados.nome; document.getElementById('perfil-telefone').value = dados.telefone; document.getElementById('perfil-cep').value = dados.cep; document.getElementById('perfil-estado').value = dados.estado; document.getElementById('perfil-rua').value = dados.rua; document.getElementById('perfil-numero').value = dados.numero; document.getElementById('perfil-bairro').value = dados.bairro; carregarMeusPedidosPainel(dados.cpf); }
window.carregarMeusPedidosPainel = async (cpf) => { const lista = document.getElementById('lista-meus-pedidos'); lista.innerHTML = "⏳ Carregando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); meusPedidosSalvos = []; lista.innerHTML = ""; let tem = false; snap.forEach(d => { let p = d.data(); p.id = d.id; if(p.cpf === cpf) { tem = true; meusPedidosSalvos.push(p); let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; let botoesAcao = p.status === 'Pendente' ? `<div style="display:flex; gap:10px; margin-top:10px;"><button onclick="abrirEdicaoPedido('${p.id}')" style="background:var(--secondary); color:white; border:none; padding:5px 10px; border-radius:5px;">✏️ Editar Pedido</button> <button onclick="cancelarMeuPedido('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px;">🗑️ Cancelar</button></div>` : ''; lista.innerHTML += `<div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border-left: 5px solid ${cor};"><strong style="font-size:1.1rem;">📅 ${p.data} às ${p.hora}</strong><br><div style="margin:5px 0; color:#555; font-size:0.9rem;"><strong>Itens:</strong> ${p.itens}</div><strong style="color:var(--primary); font-size:1.1rem;">💰 R$ ${p.total}</strong><br><span style="font-size:0.9rem; font-weight:bold; color:${cor};">● Status: ${p.status}</span>${botoesAcao}</div>`; } }); if(!tem) lista.innerHTML = "<p>Nenhuma compra.</p>"; }
window.cancelarMeuPedido = async (id) => { if(confirm("Deseja cancelar este pedido?")) { await updateDoc(doc(db, "pedidos", id), { status: "Cancelado" }); carregarMeusPedidosPainel(clienteLogadoCpf); } };
window.abrirEdicaoPedido = (id) => { pedidoEmEdicao = JSON.parse(JSON.stringify(meusPedidosSalvos.find(p => p.id === id))); pedidoEmEdicao.detalhes_itens.forEach(i => i.qtd = i.qtd || 1); renderizarEdicaoPedido(); document.getElementById('modal-editar-pedido').classList.remove('hidden'); };
window.fecharEdicaoPedido = () => document.getElementById('modal-editar-pedido').classList.add('hidden');
function renderizarEdicaoPedido() { const lista = document.getElementById('lista-editar-itens'); lista.innerHTML = ""; let total = 0; if(pedidoEmEdicao.detalhes_itens.length === 0) lista.innerHTML = "<p style='color:red;'>O pedido será cancelado ao salvar.</p>"; pedidoEmEdicao.detalhes_itens.forEach((item, index) => { total += parseFloat(item.preco) * item.qtd; lista.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;"><div style="flex:1;"><strong>${item.nome}</strong><br><span style="color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span></div><div style="display:flex; align-items:center; gap:8px;"><button onclick="alterarQtdEdicao(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">-</button><span>${item.qtd}</span><button onclick="alterarQtdEdicao(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">+</button></div></div>`; }); document.getElementById('novo-total-edicao').innerText = total.toFixed(2); }
window.alterarQtdEdicao = (index, delta) => { pedidoEmEdicao.detalhes_itens[index].qtd += delta; if(pedidoEmEdicao.detalhes_itens[index].qtd <= 0) pedidoEmEdicao.detalhes_itens.splice(index, 1); renderizarEdicaoPedido(); };
window.salvarEdicaoPedido = async () => { if(pedidoEmEdicao.detalhes_itens.length === 0) { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { status: "Cancelado" }); fecharEdicaoPedido(); return carregarMeusPedidosPainel(clienteLogadoCpf); } let total = 0; pedidoEmEdicao.detalhes_itens.forEach(i => total += parseFloat(i.preco) * i.qtd); let strItens = pedidoEmEdicao.detalhes_itens.map(i => `${i.qtd}x ${i.nome}`).join(", "); try { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { detalhes_itens: pedidoEmEdicao.detalhes_itens, itens: strItens, total: total.toFixed(2) }); mostrarNotificacao("Atualizado!", "sucesso"); fecharEdicaoPedido(); carregarMeusPedidosPainel(clienteLogadoCpf); } catch(e) {} };
window.atualizarPerfilCliente = async (e) => { e.preventDefault(); const cpf = document.getElementById('perfil-cpf').value; try { await updateDoc(doc(db, "clientes", cpf), { nome: document.getElementById('perfil-nome').value, telefone: document.getElementById('perfil-telefone').value, cep: document.getElementById('perfil-cep').value, rua: document.getElementById('perfil-rua').value, numero: document.getElementById('perfil-numero').value, bairro: document.getElementById('perfil-bairro').value, estado: document.getElementById('perfil-estado').value }); clienteLogadoDados.nome = document.getElementById('perfil-nome').value; atualizarHeaderLogado(); mostrarNotificacao("Atualizado!", "sucesso"); } catch (e) { } };
window.sairCliente = () => { localStorage.removeItem('maribella_auth_cliente'); clienteLogadoCpf = null; clienteLogadoDados = null; atualizarHeaderLogado(); fecharPerfil(); mostrarNotificacao("Sessão encerrada.", "info"); };

// --- ADMINISTRAÇÃO ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');
window.realizarLoginAdmin = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value); mostrarNotificacao("Liberado!", "sucesso"); fecharLoginAdmin(); document.getElementById('admin-dashboard').classList.remove('hidden'); carregarListaAdminPedidos(); e.target.reset(); } catch(e) { mostrarNotificacao("Erro!", "erro"); } };
window.sairDoAdmin = async () => { await signOut(auth); document.getElementById('admin-dashboard').classList.add('hidden'); carregarProdutosDoBanco(); };
window.mudarAbaAdmin = (abaId) => { document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden')); document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa')); document.getElementById(abaId).classList.remove('hidden'); document.getElementById(`tab-${abaId}`).classList.add('ativa'); if(abaId==='admin-pedidos') carregarListaAdminPedidos(); if(abaId==='admin-produtos') carregarListaAdminProdutosEditar(); if(abaId==='admin-clientes') carregarListaAdminClientes(); };

async function carregarListaAdminPedidos() { const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "⏳ Puxando vendas..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); todosPedidosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosPedidosAdmin.push(p); }); filtrarPedidosAdmin(); }
window.filtrarPedidosAdmin = () => {
    const termo = removerAcentos(document.getElementById('busca-pedido').value); const filtro = document.getElementById('filtro-status').value; const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "";
    let res = todosPedidosAdmin.filter(p => { let matchTermo = removerAcentos(p.cliente).includes(termo) || (p.cidade && removerAcentos(p.cidade).includes(termo)) || p.cpf.includes(termo); let matchStatus = filtro === 'Todos' || p.status === filtro; return matchTermo && matchStatus; });
    if(res.length === 0) lista.innerHTML = "<p>Nenhum pedido.</p>";
    res.forEach(p => { 
        let btnAprovar = p.status === 'Pendente' ? `<button onclick="aprovarPedido('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">✅ Aprovar</button>` : '';
        let btnVoltar = p.status !== 'Pendente' ? `<button onclick="voltarPendentePedido('${p.id}')" style="background:#f39c12; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">↩️ Pendente</button>` : '';
        let btnExcluir = `<button onclick="excluirPedidoAdmin('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🗑️ Excluir</button>`;
        lista.innerHTML += `<div class="admin-card"><strong style="color:var(--primary);">Data: ${p.data} às ${p.hora}</strong><br><strong>Cliente:</strong> ${p.cliente}<br><strong>Total:</strong> R$ ${p.total} (${p.itens})<br><span style="font-weight:bold;">Status: ${p.status}</span><div style="display:flex; gap:10px; margin-top:10px;">${btnAprovar}${btnVoltar}${btnExcluir}</div></div>`; 
    });
}
window.aprovarPedido = async (id) => { await updateDoc(doc(db, "pedidos", id), { status: "Aprovado" }); carregarListaAdminPedidos(); };
window.voltarPendentePedido = async (id) => { if(confirm("Voltar para Pendente?")) { await updateDoc(doc(db, "pedidos", id), { status: "Pendente" }); carregarListaAdminPedidos(); } };
window.excluirPedidoAdmin = async (id) => { if(confirm("Deseja APAGAR este pedido?")) { await deleteDoc(doc(db, "pedidos", id)); carregarListaAdminPedidos(); } };

window.salvarProdutoAdmin = async (e) => { e.preventDefault(); const btn = document.getElementById('btn-salvar-produto'); const img = document.getElementById('add-imagem-file').files[0]; const id = document.getElementById('edit-produto-id').value; btn.innerText = "⏳..."; btn.disabled = true; try { let urlFoto = null; if (img) { const sRef = ref(storage, 'produtos/' + Date.now() + '_' + img.name); await uploadBytes(sRef, img); urlFoto = await getDownloadURL(sRef); } const pData = { nome: document.getElementById('add-nome').value, preco: parseFloat(document.getElementById('add-preco').value), estoque: parseInt(document.getElementById('add-estoque').value), categoria: document.getElementById('add-categoria').value, tamanho: document.getElementById('add-tamanho').value, cores: document.getElementById('add-cores').value, material: document.getElementById('add-material').value }; if(urlFoto) pData.imagem = urlFoto; if (id) { await updateDoc(doc(db, "produtos", id), pData); } else { if(!urlFoto) return mostrarNotificacao("Foto obrigatória!","erro"); await addDoc(collection(db, "produtos"), pData); } limparFormProduto(); carregarListaAdminProdutosEditar(); mostrarNotificacao("Sucesso!","sucesso"); } catch(e) {} btn.innerText = "💾 Salvar Produto"; btn.disabled = false; };
window.limparFormProduto = () => { document.getElementById('form-add-produto').reset(); document.getElementById('edit-produto-id').value=''; };
async function carregarListaAdminProdutosEditar() { const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "produtos")); todosProdutosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosProdutosAdmin.push(p); }); filtrarProdutosAdmin(); }
window.filtrarProdutosAdmin = () => { const termo = removerAcentos(document.getElementById('busca-produto-admin').value); const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = ""; let res = todosProdutosAdmin.filter(p => removerAcentos(p.nome).includes(termo)); if(res.length === 0) lista.innerHTML = "<p>Nenhum produto.</p>"; res.forEach(p => { lista.innerHTML += `<div class="admin-card" style="display:flex; align-items:center; gap:15px; padding:10px;"><img src="${p.imagem}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div style="flex:1;"><strong>${p.nome}</strong><br>Estq: ${p.estoque||0} | R$ ${p.preco}</div><div style="display:flex; gap:5px;"><button onclick="editarProdutoAdmin('${p.id}', '${p.nome}', ${p.preco}, '${p.tamanho}', '${p.material}', ${p.estoque||0}, '${p.cores||''}', '${p.categoria||'Vestido'}')" class="btn-icon" style="background:var(--secondary); color:white;">✏️</button> <button onclick="excluirProdutoAdmin('${p.id}')" class="btn-icon" style="background:#e74c3c; color:white;">🗑️</button></div></div>`; }); }
window.editarProdutoAdmin = (id, n, p, t, m, estq, cor, cat) => { document.getElementById('edit-produto-id').value=id; document.getElementById('add-nome').value=n; document.getElementById('add-preco').value=p; document.getElementById('add-estoque').value=estq; document.getElementById('add-categoria').value=cat; document.getElementById('add-tamanho').value=t; document.getElementById('add-cores').value=cor; document.getElementById('add-material').value=m; document.querySelector('.admin-content').scrollTo(0,0); };
window.excluirProdutoAdmin = async (id) => { if(confirm("🗑️ ATENÇÃO: Tem certeza que deseja apagar essa peça do sistema?")) { await deleteDoc(doc(db, "produtos", id)); mostrarNotificacao("Peça apagada!", "info"); carregarListaAdminProdutosEditar(); carregarProdutosDoBanco(); } };

async function carregarListaAdminClientes() { const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "clientes")); todosClientesAdmin = []; snap.forEach(d => todosClientesAdmin.push(d.data())); filtrarClientesAdmin(); }
window.filtrarClientesAdmin = () => { const termo = removerAcentos(document.getElementById('busca-cliente-admin').value); const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = ""; let res = todosClientesAdmin.filter(c => removerAcentos(c.nome).includes(termo) || c.telefone.includes(termo) || (c.cpf && c.cpf.includes(termo))); if(res.length === 0) lista.innerHTML = "<p>Nenhum cliente.</p>"; res.forEach(c => { let telLimpo = c.telefone.replace(/\D/g, ''); lista.innerHTML += `<div class="admin-card" style="border-left-color: #2ecc71; display:flex; justify-content:space-between; align-items:center;"><div><strong>${c.nome}</strong><br><span>${c.telefone}</span></div><div style="display:flex; gap:10px;"><button onclick="verHistoricoClienteAdmin('${c.cpf}', '${c.nome}')" style="background:var(--secondary); color:white; border:none; padding:8px 10px; border-radius:8px; font-weight:bold;">🛍️ Histórico</button><a href="https://wa.me/55${telLimpo}" target="_blank" style="background:#25D366; color:white; padding:8px 10px; border-radius:8px; text-decoration:none;">💬</a></div></div>`; }); }
window.fecharHistoricoClienteAdmin = () => document.getElementById('admin-historico-cliente-modal').classList.add('hidden');
window.verHistoricoClienteAdmin = async (cpf, nome) => { document.getElementById('admin-historico-cliente-modal').classList.remove('hidden'); document.getElementById('nome-historico-admin').innerText = `🛍️ Histórico: ${nome.split(' ')[0]}`; const lista = document.getElementById('lista-historico-cliente-admin'); lista.innerHTML = "⏳ Buscando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); lista.innerHTML = ""; let tem = false; snap.forEach(d => { const p = d.data(); if(p.cpf === cpf) { tem = true; let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; lista.innerHTML += `<div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:10px; border-left: 4px solid ${cor};"><strong>Data: ${p.data}</strong><br><span style="font-size:0.85rem;">Itens: ${p.itens}</span><br><strong>R$ ${p.total}</strong> - <span style="font-weight:bold; color:${cor};">${p.status}</span></div>`; } }); if(!tem) lista.innerHTML = "<p>Sem compras.</p>"; };

window.gerarDadosDeExemplo = async () => {
    mostrarNotificacao("Gerando Lançamentos, Vestidos, Shorts e Blusas...", "info");
    const prods = [
        {nome: "Vestido Floral Princesa", preco: 89.90, estoque: 10, categoria: "Vestido", tamanho: "2, 4, 6", material: "Algodão", imagem: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500"},
        {nome: "Blusa Babado Luxo", preco: 45.00, estoque: 20, categoria: "Blusa/Cropped/Body", tamanho: "2, 4, 6", material: "Algodão", imagem: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=500"},
        {nome: "Short Jeans Premium", preco: 65.50, estoque: 15, categoria: "Short/Calça/Saia", tamanho: "6, 8, 10", material: "Jeans", imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500"},
        {nome: "Lançamento Conjunto", preco: 119.90, estoque: 15, categoria: "Lançamento", tamanho: "4, 6, 8", material: "Viscose", imagem: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500"}
    ];
    for(let p of prods) await addDoc(collection(db, "produtos"), p);
    await setDoc(doc(db, "clientes", "11111111111"), {nome: "Carla Mendes (Ex)", cpf: "111.111.111-11", telefone: "(81) 99999-9999", senha: "123", cep: "50000-000", rua: "Av Principal", numero: "10", bairro: "Boa Viagem", estado: "PE"});
    await addDoc(collection(db, "pedidos"), {cliente: "Carla Mendes (Ex)", cpf: "11111111111", cidade: "Boa Viagem", telefone: "(81) 99999-9999", endereco: "Av Principal, 10 - Boa Viagem", observacao: "Deixar na portaria", itens: "1x Vestido", detalhes_itens: [], total: "89.90", data: new Date().toLocaleDateString('pt-BR'), hora: new Date().toLocaleTimeString('pt-BR'), timestamp: new Date().toISOString(), status: "Pendente"});
    mostrarNotificacao("Pronto! Recarregando...", "sucesso"); setTimeout(()=>window.location.reload(), 2000);
};

// Inicialização
const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.cpf, logado.senha);
carregarConfiguracoes(); carregarForm(); atualizarCarrinho(); carregarProdutosDoBanco();
