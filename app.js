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

let variacoesAdminTemp = [];
let produtoParaAdicionarTamanho = null;

window.mascaraCPF = (i) => { let v = i.value.replace(/\D/g,""); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d)/,"$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2"); i.value = v; };
window.mascaraTelefone = (i) => { let v = i.value.replace(/\D/g,""); v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); v = v.replace(/(\d)(\d{4})$/,"$1-$2"); i.value = v; };
window.removerAcentos = (str) => { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; };

window.mostrarNotificacao = (msg, t = 'sucesso', fechavel = false) => { 
    const toast = document.getElementById('toast-notificacao'); 
    let fecharBtn = fechavel ? `<span onclick="window.fecharToast()" style="margin-left:10px; cursor:pointer; font-size:1.2rem; color:#666;">&times;</span>` : '';
    toast.innerHTML = `<span style="flex:1;">${t==='erro'?"❌":t==='info'?"🎀":"✅"} ${msg}</span> ${fecharBtn}`; 
    toast.className = `toast show ${t}`; 
    if(!fechavel) setTimeout(window.fecharToast, 3500); 
};
window.fecharToast = () => { document.getElementById('toast-notificacao').className = 'toast hidden'; };

window.confirmarAcao = function(titulo, mensagem) {
    return new Promise((resolve) => {
        document.getElementById('confirm-title').innerText = titulo; document.getElementById('confirm-msg').innerText = mensagem; document.getElementById('modal-confirmacao').classList.remove('hidden');
        document.getElementById('btn-confirm-yes').onclick = () => { document.getElementById('modal-confirmacao').classList.add('hidden'); resolve(true); };
        document.getElementById('btn-confirm-no').onclick = () => { document.getElementById('modal-confirmacao').classList.add('hidden'); resolve(false); };
    });
};

function gerarLinkWhatsApp(telefoneBruto, mensagem) {
    let telLimpo = telefoneBruto.replace(/\D/g, ''); if(!telLimpo.startsWith('55')) telLimpo = '55' + telLimpo;
    return `https://wa.me/${telLimpo}?text=${encodeURIComponent(mensagem)}`;
}

// --- VENDAS FAKES E PESSOAS ONLINE ---
function dispararVendaFalsa() {
    const nomesFakes = ["Ana", "Maria", "Juliana", "Camila", "Fernanda", "Beatriz", "Amanda", "Letícia"];
    const cidadesFakes = ["Recife, PE", "Caruaru, PE", "Surubim, PE", "São Paulo, SP", "Belo Horizonte, MG"];
    let n = nomesFakes[Math.floor(Math.random()*nomesFakes.length)]; let c = cidadesFakes[Math.floor(Math.random()*cidadesFakes.length)]; let v = (Math.random() * (250 - 50) + 50).toFixed(2);
    mostrarNotificacao(`${n} de ${c} comprou R$ ${v}!`, 'info', true);
    setTimeout(window.fecharToast, 10000); setTimeout(dispararVendaFalsa, Math.floor(Math.random() * (300000 - 60000 + 1)) + 60000);
}
setTimeout(dispararVendaFalsa, Math.random() * 30000 + 30000); 

function atualizarPessoasOnline() {
    let el = document.getElementById('online-count'); if(!el) return;
    let agora = new Date(); let minutosAtuais = agora.getHours() * 60 + agora.getMinutes();
    let minBase, maxBase;
    if (minutosAtuais >= 1066 && minutosAtuais <= 1349) {
        minBase = 1367; maxBase = 4621;
    } else {
        minBase = 426; maxBase = 1367;
    }
    let atual = parseInt(el.innerText.replace('.', '')); 
    if(isNaN(atual) || atual < minBase || atual > maxBase) atual = Math.floor(Math.random() * (maxBase - minBase)) + minBase;
    let variacao = Math.floor(Math.random() * 60) - 25; let novoValor = atual + variacao;
    if(novoValor < minBase) novoValor = minBase + Math.floor(Math.random()*50); 
    if(novoValor > maxBase) novoValor = maxBase - Math.floor(Math.random()*50);
    el.innerText = novoValor.toLocaleString('pt-BR'); 
    setTimeout(atualizarPessoasOnline, Math.random() * 4000 + 4000);
}
setTimeout(atualizarPessoasOnline, 2000);

// --- AVALIAÇÕES REALISTAS ---
let avaliacoesGeradas = []; let indexAvaliacaoAtual = 0;
function gerarAvaliacoes() {
    const totalReviews = 160;
    const nomesF = ["Mariana", "Carla", "Ana", "Beatriz", "Juliana", "Camila", "Fernanda", "Amanda", "Letícia", "Vanessa", "Bruna", "Aline"];
    const nomesM = ["Carlos", "Marcos", "João", "Pedro", "Lucas", "Mateus", "Rafael", "Felipe", "Bruno", "Thiago", "Eduardo"];
    const sobrenomes = ["Silva", "Mendes", "Costa", "Souza", "Oliveira", "Pereira", "Lima", "Gomes", "Ribeiro", "Martins"];
    const dddBR = ["81", "87", "81", "87", "81", "87", "11", "21", "31", "41"]; 
    const comentarios = ["Qualidade incrível, amei!", "Chegou super rápido, recomendo.", "Perfeito, tamanho certinho.", "Comprei para revender e já acabou tudo!", "Lindas peças, ótimo acabamento.", "As cores são vivas, idêntico à foto.", "Minhas clientes adoraram.", "Superou minhas expectativas.", "Comprarei novamente.", "Tudo perfeito, recomendo!"];

    for(let i=0; i < totalReviews; i++) {
        let isMulher = Math.random() > 0.2; 
        let nomeBase = isMulher ? nomesF[(i * 13) % nomesF.length] : nomesM[(i * 11) % nomesM.length];
        let nomeCompleto = `${nomeBase} ${sobrenomes[(i * 7) % sobrenomes.length]}`;
        let ddd = dddBR[Math.floor(Math.random()*dddBR.length)];
        let telefone = `(${ddd}) 9${Math.floor(Math.random()*9)}***-**${Math.floor(Math.random()*90)+10}`;
        let generoFoto = isMulher ? "women" : "men";
        
        avaliacoesGeradas.push({
            nome: `${nomeCompleto} 🇧🇷`,
            telefone: `${telefone} | ⭐⭐⭐⭐⭐`,
            texto: comentarios[(i * 23) % comentarios.length],
            estrelas: "⭐⭐⭐⭐⭐",
            foto: `https://randomuser.me/api/portraits/${generoFoto}/${(i % 99) + 1}.jpg`
        });
    }
    avaliacoesGeradas.sort(() => Math.random() - 0.5);
}

function renderizarReviewSidebar() {
    if(avaliacoesGeradas.length === 0) return;
    const container = document.getElementById('review-destaque'); if(!container) return;
    let r = avaliacoesGeradas[indexAvaliacaoAtual];
    container.innerHTML = `<div class="review-card" style="box-shadow: 0 2px 10px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; transition: 0.5s ease-in-out;"><img src="${r.foto}" alt="Cliente"><div style="flex:1;"><strong style="color:var(--primary); font-size:0.9rem;">${r.nome}</strong><br><span style="font-size:0.75rem; color:#888;">${r.telefone}</span><p style="font-size:0.85rem; margin-top:3px; font-style:italic;">"${r.texto}"</p><p style="font-size:0.75rem; color:var(--secondary); margin-top:5px; text-align:right; font-weight:bold;">Ver todas (${avaliacoesGeradas.length}) ➔</p></div></div>`;
    indexAvaliacaoAtual = (indexAvaliacaoAtual + 1) % avaliacoesGeradas.length;
}

window.abrirModalAvaliacoes = () => {
    const modal = document.getElementById('modal-avaliacoes'); 
    const lista = document.getElementById('lista-avaliacoes-modal');
    document.getElementById('total-avaliacoes-count').innerText = avaliacoesGeradas.length; 
    let htmlContent = "";
    avaliacoesGeradas.forEach(r => { 
        htmlContent += `<div class="review-card" style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px; box-shadow:none;"><img src="${r.foto}" alt="Cliente"><div><strong>${r.nome}</strong><br><span style="font-size:0.75rem; color:#888;">${r.telefone}</span><p style="font-size:0.9rem; margin-top:3px;">"${r.texto}"</p></div></div>`; 
    });
    lista.innerHTML = htmlContent;
    window.fecharMenuLateral(); modal.classList.remove('hidden');
};
window.fecharModalAvaliacoes = () => { document.getElementById('modal-avaliacoes').classList.add('hidden'); };


// --- LUPA, MENU E LIGHTBOX C/ NAVEGAÇÃO ---
window.toggleBusca = () => { let b = document.getElementById('busca-container'); b.classList.toggle('hidden'); if(!b.classList.contains('hidden')) document.getElementById('busca-input').focus(); };

let lightboxCurrentProdId = null;
let lightboxImgsArray = [];
let lightboxCurrentIndex = 0;

window.abrirLightbox = (src, id = null, arrayFotosStr = null) => { 
    lightboxCurrentProdId = id; 
    document.getElementById('lightbox-img').src = src; 
    document.getElementById('lightbox-modal').classList.remove('hidden'); 
    
    if(arrayFotosStr) {
        lightboxImgsArray = JSON.parse(arrayFotosStr.replace(/&quot;/g, '"'));
        lightboxCurrentIndex = lightboxImgsArray.indexOf(src);
        if(lightboxCurrentIndex === -1) lightboxCurrentIndex = 0;
        document.getElementById('lightbox-prev').classList.remove('hidden');
        document.getElementById('lightbox-next').classList.remove('hidden');
    } else {
        lightboxImgsArray = [];
        document.getElementById('lightbox-prev').classList.add('hidden');
        document.getElementById('lightbox-next').classList.add('hidden');
    }

    let ctrl = document.getElementById('lightbox-controls'); 
    if(id && ctrl) ctrl.style.display = 'block'; else if(ctrl) ctrl.style.display = 'none';
};

window.navegarLightbox = (dir) => {
    if(lightboxImgsArray.length <= 1) return;
    lightboxCurrentIndex += dir;
    if(lightboxCurrentIndex < 0) lightboxCurrentIndex = lightboxImgsArray.length - 1;
    if(lightboxCurrentIndex >= lightboxImgsArray.length) lightboxCurrentIndex = 0;
    document.getElementById('lightbox-img').src = lightboxImgsArray[lightboxCurrentIndex];
};

window.fecharLightbox = () => { document.getElementById('lightbox-modal').classList.add('hidden'); lightboxCurrentProdId = null; };
window.toggleZoom = () => { document.getElementById('lightbox-img').classList.toggle('zoomed'); };
window.abrirOpcoesLightbox = () => { if(lightboxCurrentProdId) { window.abrirEscolherTamanho(lightboxCurrentProdId); window.fecharLightbox(); } };

window.abrirMenuLateral = () => { document.getElementById('sidebar-menu').classList.remove('hidden'); document.getElementById('sidebar-menu').classList.add('open'); document.getElementById('sidebar-overlay').classList.remove('hidden'); };
window.fecharMenuLateral = () => { document.getElementById('sidebar-menu').classList.remove('open'); setTimeout(() => { document.getElementById('sidebar-menu').classList.add('hidden'); }, 300); document.getElementById('sidebar-overlay').classList.add('hidden'); };

window.filtrarCategoria = (cat) => { 
    window.fecharMenuLateral(); 
    const termo = removerAcentos(document.getElementById('busca-input').value); 
    let filtrados = listaDeProdutos.filter(p => { 
        let matchCat = (cat === 'Todas') || (p.categoria === cat) || (p.categoria === 'Short/Calça/Saia' && cat === 'Short/Saia') || (cat === 'Lançamento' && p.lancamento === true); 
        let matchTermo = removerAcentos(p.nome).includes(termo) || removerAcentos(p.material).includes(termo); 
        return matchCat && matchTermo; 
    }); 
    renderizarVitrinesCategorias(filtrados, cat !== 'Todas' ? cat : null); 
};

// --- CONFIGURAÇÕES ---
async function carregarConfiguracoes() { 
    const snap = await getDoc(doc(db, "config", "loja")); 
    if(snap.exists()) { 
        configLoja = snap.data(); 
        document.getElementById('pix-display').innerText = configLoja.pix; document.getElementById('config-pix').value = configLoja.pix; 
        document.getElementById('config-telefone').value = configLoja.telefone; document.getElementById('config-aviso').value = configLoja.aviso || ""; document.getElementById('config-instagram').value = configLoja.instagram || ""; document.getElementById('config-endereco').value = configLoja.endereco || "";
    } 
    document.getElementById('texto-aviso-loja').innerText = configLoja.aviso || "Enviamos para todo o Brasil."; document.getElementById('footer-instagram-link').href = configLoja.instagram || "#"; document.getElementById('footer-endereco-texto').innerText = configLoja.endereco || "Nossa Loja"; document.getElementById('menu-endereco-info').innerText = configLoja.endereco || "Nossa Loja";
}
window.salvarConfiguracoes = async (e) => { 
    e.preventDefault(); const sim = await window.confirmarAcao("Ajustes", "Salvar novas informações da loja?"); if(!sim) return;
    const btn = document.getElementById('btn-salvar-config'); btn.innerText = "⏳..."; 
    try { 
        configLoja.pix = document.getElementById('config-pix').value; configLoja.telefone = document.getElementById('config-telefone').value; configLoja.aviso = document.getElementById('config-aviso').value; configLoja.instagram = document.getElementById('config-instagram').value; configLoja.endereco = document.getElementById('config-endereco').value;
        await setDoc(doc(db, "config", "loja"), configLoja); 
        document.getElementById('pix-display').innerText = configLoja.pix; document.getElementById('texto-aviso-loja').innerText = configLoja.aviso; document.getElementById('footer-instagram-link').href = configLoja.instagram; document.getElementById('footer-endereco-texto').innerText = configLoja.endereco; mostrarNotificacao("Salvo!", "sucesso"); 
    } catch(err) {} btn.innerText = "💾 Atualizar Dados"; 
};

// --- VITRINE COM FOTOS EM LOOP ---
window.carregarProdutosDoBanco = async () => {
    try {
        const snap = await getDocs(collection(db, "produtos")); listaDeProdutos = [];
        if (snap.empty) { document.getElementById('vitrine-estacoes').innerHTML = '<p style="text-align:center;color:#aaa;">Nenhuma peça.</p>'; return; }
        snap.forEach(d => { let p = d.data(); p.id = d.id; 
            if(!p.variacoes) p.variacoes = [{nome: p.tamanho || 'Único', qtd: p.estoque || 0}];
            listaDeProdutos.push(p); 
        });
        renderizarStories(); renderizarVitrinesCategorias(listaDeProdutos);
    } catch (e) {}
}

function renderizarStories() {
    const track = document.getElementById('stories-track'); track.innerHTML = '';
    let storyList = [...listaDeProdutos, ...listaDeProdutos, ...listaDeProdutos]; 
    storyList.forEach(p => { 
        let foto = p.imagens ? p.imagens[0] : p.imagem;
        track.innerHTML += `<img src="${foto}" class="story-circle" onclick="window.abrirLightbox('${foto}', '${p.id}', null)" title="${p.nome}">`; 
    });
}

function renderizarVitrinesCategorias(lista, tituloUnico = null) {
    const container = document.getElementById('vitrine-estacoes'); container.innerHTML = '';
    carouselIntervals.forEach(clearInterval); carouselIntervals = [];

    if(lista.length === 0) { container.innerHTML = '<p style="text-align:center;">Nenhum produto encontrado.</p>'; return; }

    let indexFila = 0; 
    if(tituloUnico) { criarSecaoCarrossel(tituloUnico, lista, container, indexFila); } 
    else {
        let lancamentos = lista.filter(p => p.lancamento === true); 
        let vestidos = lista.filter(p => p.categoria === 'Vestido'); 
        let shorts = lista.filter(p => p.categoria === 'Short/Saia' || p.categoria === 'Short/Calça/Saia'); 
        let blusas = lista.filter(p => p.categoria === 'Blusa/Cropped/Body'); 
        let conjuntos = lista.filter(p => p.categoria === 'Conjunto');

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
        let estoqueTotal = p.variacoes.reduce((sum, v) => sum + parseInt(v.qtd||0), 0);
        let strTamanhos = p.variacoes.map(v => v.tamanho || v.nome.split('-')[0].trim()).join(', ');
        if(strTamanhos.length > 20) strTamanhos = strTamanhos.substring(0,20) + '...';

        let imgHtml = '';
        if(p.imagens && p.imagens.length > 1) {
            let fotosStr = JSON.stringify(p.imagens).replace(/"/g, '&quot;');
            imgHtml = `<img src="${p.imagens[0]}" data-fotos='${fotosStr}' data-idx="0" class="vitrine-multifoto" onclick="window.abrirLightbox('${p.imagens[0]}', '${p.id}', '${fotosStr}')">
                       <div style="text-align:center; font-size:0.75rem; color:#888; font-weight:bold; padding: 4px 0;">📸 ${p.imagens.map((_, i) => i+1).join(' - ')}</div>`;
        } else {
            let ft = p.imagens ? p.imagens[0] : p.imagem;
            imgHtml = `<img src="${ft}" onclick="window.abrirLightbox('${ft}', '${p.id}', null)">`;
        }

        let btnStatus = estoqueTotal > 0 ? `<button class="btn-add" onclick="window.abrirEscolherTamanho('${p.id}')">🛒 Quero</button>` : `<button class="btn-add esgotado">Esgotado</button>`;
        carrossel.innerHTML += `<div class="card">${imgHtml}<div class="card-info"><div><h3>${p.nome}</h3><p style="font-size:0.75rem;">Tam: ${strTamanhos}</p><p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p></div>${btnStatus}</div></div>`;
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

// Motor de Rotação de Fotos 
setInterval(() => {
    document.querySelectorAll('.vitrine-multifoto').forEach(img => {
        try {
            let fotos = JSON.parse(img.getAttribute('data-fotos').replace(/&quot;/g, '"'));
            let idx = parseInt(img.getAttribute('data-idx'));
            idx = (idx + 1) % fotos.length;
            img.style.opacity = 0.8;
            setTimeout(() => { img.src = fotos[idx]; img.style.opacity = 1; }, 150);
            img.setAttribute('data-idx', idx);
        } catch(e){}
    });
}, 3500);

// --- ESCOLHER MÚLTIPLAS QUANTIDADES ---
window.abrirEscolherTamanho = (id) => {
    produtoParaAdicionarTamanho = listaDeProdutos.find(p => p.id === id);
    if(!produtoParaAdicionarTamanho) return;
    let ft = produtoParaAdicionarTamanho.imagens ? produtoParaAdicionarTamanho.imagens[0] : produtoParaAdicionarTamanho.imagem;

    document.getElementById('info-produto-tamanho').innerHTML = `<img src="${ft}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div><strong style="font-size:1rem;">${produtoParaAdicionarTamanho.nome}</strong><br><span style="color:var(--secondary); font-weight:bold;">R$ ${parseFloat(produtoParaAdicionarTamanho.preco).toFixed(2)}</span></div>`;
    
    let htmlOpcoes = "";
    produtoParaAdicionarTamanho.variacoes.forEach((v, idx) => {
        let esgotado = v.qtd <= 0;
        let corSpan = esgotado ? 'color:#ccc; text-decoration:line-through;' : 'color:#333;';
        htmlOpcoes += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #eee; border-radius:8px; ${corSpan}">
            <div><strong>${v.nome}</strong><br><span style="font-size:0.75rem;">${esgotado ? 'Esgotado' : v.qtd + ' em estoque'}</span></div>
            <input type="number" id="qtd_var_${idx}" min="0" max="${v.qtd}" value="0" ${esgotado ? 'disabled' : ''} style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; font-weight:bold; text-align:center;">
        </div>`;
    });
    
    document.getElementById('lista-opcoes-tamanho').innerHTML = htmlOpcoes;
    document.getElementById('modal-escolher-tamanho').classList.remove('hidden');
};

window.fecharModalTamanho = () => document.getElementById('modal-escolher-tamanho').classList.add('hidden');

window.confirmarAdicaoCarrinho = () => {
    let adicionouAlgo = false;
    produtoParaAdicionarTamanho.variacoes.forEach((v, idx) => {
        let inputQtd = document.getElementById(`qtd_var_${idx}`);
        if(inputQtd && parseInt(inputQtd.value) > 0) {
            let qtdPedida = parseInt(inputQtd.value);
            let cartId = produtoParaAdicionarTamanho.id + "_" + idx;
            let itemEx = carrinho.find(p => p.cartId === cartId);
            
            if(itemEx) {
                if(itemEx.qtd + qtdPedida > v.qtd) return window.mostrarNotificacao(`Estoque max atingido em ${v.nome}!`, 'erro');
                itemEx.qtd += qtdPedida;
            } else {
                let imgCart = produtoParaAdicionarTamanho.imagens ? produtoParaAdicionarTamanho.imagens[0] : produtoParaAdicionarTamanho.imagem;
                carrinho.push({ ...produtoParaAdicionarTamanho, imagem: imgCart, cartId: cartId, tamanhoSelecionado: v.nome, idxVariacao: idx, estoqueDisponivel: v.qtd, qtd: qtdPedida });
            }
            adicionouAlgo = true;
        }
    });
    
    if(!adicionouAlgo) return window.mostrarNotificacao("Informe a quantidade em pelo menos um tamanho!", "erro");
    
    salvarCarrinhoNoLocal(); 
    window.fecharModalTamanho();
    window.mostrarNotificacao("Adicionado com sucesso!", 'sucesso'); 
};


// --- CARRINHO BÁSICO E CHECKOUT ---
window.alterarQtdCarrinho = (index, delta) => { let novoQtd = (carrinho[index].qtd || 1) + delta; if(novoQtd > carrinho[index].estoqueDisponivel) return window.mostrarNotificacao("Estoque máximo atingido para este tamanho!", 'erro'); carrinho[index].qtd = novoQtd; if(carrinho[index].qtd <= 0) carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
window.removerDoCarrinho = async (index) => { const sim = await window.confirmarAcao("Remover item", "Tirar do carrinho?"); if(sim) { carrinho.splice(index, 1); salvarCarrinhoNoLocal(); } };
function salvarCarrinhoNoLocal() { localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho)); atualizarCarrinho(); }
window.toggleCart = () => { document.getElementById('cart-modal').classList.toggle('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); document.getElementById('etapa-cadastro').classList.add('hidden'); };
window.irParaCadastro = () => { if(carrinho.length===0) return window.mostrarNotificacao("Carrinho vazio!",'erro'); document.getElementById('etapa-carrinho').classList.add('hidden'); document.getElementById('etapa-cadastro').classList.remove('hidden'); prepararCheckoutLogado(); };
window.voltarParaCarrinho = () => { document.getElementById('etapa-cadastro').classList.add('hidden'); document.getElementById('etapa-carrinho').classList.remove('hidden'); };

function atualizarCarrinho() {
    let totalQtd = 0; carrinho.forEach(i => totalQtd += (i.qtd||1)); document.getElementById('cart-count').innerText = totalQtd;
    const cartItems = document.getElementById('cart-items'); cartItems.innerHTML = ''; let total = 0;
    carrinho.forEach((item, index) => { 
        let qtd = item.qtd || 1; total += parseFloat(item.preco) * qtd; 
        let ft = item.imagens ? item.imagens[0] : item.imagem;
        cartItems.innerHTML += `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <img src="${ft}" onclick="window.abrirLightbox('${ft}', null)" style="width:50px; height:50px; border-radius:8px; object-fit:cover; cursor:pointer; border:1px solid #ddd;" title="Ampliar">
            <div style="flex:1;">
                <span style="font-weight:bold; color:#555;">${item.nome}</span><br>
                <span style="font-size:0.75rem; color:var(--primary); font-weight:bold;">${item.tamanhoSelecionado}</span><br>
                <span style="font-size:0.85rem; color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button onclick="window.alterarQtdCarrinho(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">-</button>
                <span>${qtd}</span>
                <button onclick="window.alterarQtdCarrinho(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px;">+</button>
                <button onclick="window.removerDoCarrinho(${index})" style="color:red;background:none;border:none;font-weight:bold;font-size:1.2rem;margin-left:5px;">&times;</button>
            </div>
        </div>`; 
    });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

function validaCamposCheckout() { const cpf = document.getElementById('cliente-cpf').value; const nome = document.getElementById('cliente-nome').value; if(cpf.length < 14 || !nome) return false; return true; }
window.tentarCopiarPix = () => { if(!clienteLogadoCpf && !validaCamposCheckout()) return window.mostrarNotificacao("Preencha seu cadastro!", "erro"); navigator.clipboard.writeText(configLoja.pix).then(() => window.mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };
window.tentarFinalizar = (e) => { if(!clienteLogadoCpf && !validaCamposCheckout()) { e.preventDefault(); window.mostrarNotificacao("Preencha seus dados!", "erro"); } };
window.salvarFormulario = () => { localStorage.setItem('maribella_form', JSON.stringify({ nome: document.getElementById('cliente-nome').value, cpf: document.getElementById('cliente-cpf').value, tel: document.getElementById('cliente-telefone').value, cep: document.getElementById('cliente-cep').value, uf: document.getElementById('cliente-estado').value, rua: document.getElementById('cliente-rua').value, num: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, cidade: document.getElementById('cliente-cidade').value, ref: document.getElementById('cliente-ref').value })); };
function carregarForm() { const s = JSON.parse(localStorage.getItem('maribella_form')); if(s && !clienteLogadoCpf) { document.getElementById('cliente-nome').value=s.nome||''; document.getElementById('cliente-cpf').value=s.cpf||''; document.getElementById('cliente-telefone').value=s.tel||''; document.getElementById('cliente-cep').value=s.cep||''; document.getElementById('cliente-estado').value=s.uf||''; document.getElementById('cliente-rua').value=s.rua||''; document.getElementById('cliente-numero').value=s.num||''; document.getElementById('cliente-bairro').value=s.bairro||''; document.getElementById('cliente-cidade').value=s.cidade||''; document.getElementById('cliente-ref').value=s.ref||''; } }
window.buscarCep = async (cepV, pref) => { let cep = cepV.replace(/\D/g, ''); if (cep.length === 8) { try { let data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json(); if (!data.erro) { document.getElementById(`${pref}-rua`).value = data.logradouro; document.getElementById(`${pref}-bairro`).value = data.bairro; document.getElementById(`${pref}-cidade`).value = data.localidade; document.getElementById(`${pref}-estado`).value = data.uf; if(pref==='cliente') window.salvarFormulario(); } } catch(err) {} } };

window.finalizarCheckout = async (e) => {
    e.preventDefault(); 
    const sim = await window.confirmarAcao("Finalizar", "Enviar pedido agora?"); if(!sim) return;
    
    const btn = document.getElementById('btn-finalizar-checkout'); btn.disabled=true; btn.innerText="⏳...";
    const cpf = document.getElementById('cliente-cpf').value.replace(/\D/g,''); const nome = document.getElementById('cliente-nome').value; const tel = document.getElementById('cliente-telefone').value; const cidade = document.getElementById('cliente-cidade').value; const endereco = `${document.getElementById('cliente-rua').value}, ${document.getElementById('cliente-numero').value} - ${document.getElementById('cliente-bairro').value} / ${cidade}`; const total = document.getElementById('total-price').innerText;

    try {
        let dadosC = { nome, cpf, telefone: tel, cep: document.getElementById('cliente-cep').value, rua: document.getElementById('cliente-rua').value, numero: document.getElementById('cliente-numero').value, bairro: document.getElementById('cliente-bairro').value, cidade: cidade, estado: document.getElementById('cliente-estado').value, ref: document.getElementById('cliente-ref').value };
        if(!clienteLogadoCpf) dadosC.senha = document.getElementById('cliente-senha').value;
        await setDoc(doc(db, "clientes", cpf), dadosC, { merge: true });
        
        let strItens = carrinho.map(i=> `${i.qtd||1}x ${i.nome} (${i.tamanhoSelecionado})`).join(", "); const dataH = new Date();
        await addDoc(collection(db, "pedidos"), { cliente: nome, cpf, cidade: cidade, bairro: document.getElementById('cliente-bairro').value, cep: document.getElementById('cliente-cep').value, estado: document.getElementById('cliente-estado').value, rua: document.getElementById('cliente-rua').value, numero: document.getElementById('cliente-numero').value, telefone: tel, endereco, itens: strItens, detalhes_itens: carrinho, total, data: dataH.toLocaleDateString('pt-BR'), hora: dataH.toLocaleTimeString('pt-BR'), timestamp: dataH.toISOString(), status: "Pendente" });
        
        for(let item of carrinho) { 
            let pDoc = await getDoc(doc(db, "produtos", item.id));
            if(pDoc.exists()) {
                let pd = pDoc.data();
                if(pd.variacoes && pd.variacoes[item.idxVariacao]) {
                    pd.variacoes[item.idxVariacao].qtd -= item.qtd;
                    if(pd.variacoes[item.idxVariacao].qtd < 0) pd.variacoes[item.idxVariacao].qtd = 0;
                    await updateDoc(doc(db, "produtos", item.id), { variacoes: pd.variacoes });
                }
            }
        }
    } catch (e) {}

    let msg = `Olá! Sou ${nome} e vim finalizar meu pedido:\n\n🛍️ *PRODUTOS:*\n`; carrinho.forEach(i => msg += `- ${i.qtd||1}x ${i.nome} - Tam: ${i.tamanhoSelecionado} (R$ ${parseFloat(i.preco).toFixed(2)})\n`); msg += `\n💰 *TOTAL:* R$ ${total}\n📦 *ENTREGA:* ${endereco}\n`;
    let linkZap = gerarLinkWhatsApp(configLoja.telefone, msg); window.open(linkZap, '_blank');
    carrinho = []; localStorage.removeItem('maribella_carrinho'); localStorage.removeItem('maribella_form'); window.toggleCart(); btn.disabled=false; btn.innerText="💾 Enviar Pedido"; window.carregarProdutosDoBanco();
};

function prepararCheckoutLogado() { if(clienteLogadoCpf && clienteLogadoDados) { document.getElementById('checkout-login-box').style.display = 'none'; document.getElementById('area-senha-nova').style.display = 'none'; document.getElementById('cliente-senha').required = false; document.getElementById('cliente-nome').value = clienteLogadoDados.nome; document.getElementById('cliente-cpf').value = clienteLogadoDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); document.getElementById('cliente-telefone').value = clienteLogadoDados.telefone; document.getElementById('cliente-cep').value = clienteLogadoDados.cep; document.getElementById('cliente-estado').value = clienteLogadoDados.estado; document.getElementById('cliente-rua').value = clienteLogadoDados.rua; document.getElementById('cliente-numero').value = clienteLogadoDados.numero; document.getElementById('cliente-bairro').value = clienteLogadoDados.bairro; document.getElementById('cliente-cidade').value = clienteLogadoDados.cidade || ''; document.getElementById('cliente-ref').value = clienteLogadoDados.ref || ''; } else { document.getElementById('checkout-login-box').style.display = 'block'; document.getElementById('area-senha-nova').style.display = 'block'; document.getElementById('cliente-senha').required = true; } }
window.loginRapidoCheckout = async () => { const cpf = document.getElementById('checkout-cpf-rapido').value.replace(/\D/g,''); const senha = document.getElementById('checkout-senha-rapida').value; if(cpf.length !== 11 || !senha) return window.mostrarNotificacao("Preencha CPF e Senha.", "erro"); const d = await getDoc(doc(db, "clientes", cpf)); if (d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha})); atualizarHeaderLogado(); prepararCheckoutLogado(); window.mostrarNotificacao("Preenchido!", "sucesso"); } else { window.mostrarNotificacao("Incorretos.", "erro"); } };

// --- LOGIN DO CLIENTE E PERFIL ---
window.verificarLoginCliente = () => { const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.cpf, logado.senha); else document.getElementById('cliente-login-modal').classList.remove('hidden'); }
window.fecharLoginCliente = () => document.getElementById('cliente-login-modal').classList.add('hidden');
window.fecharPerfil = () => document.getElementById('perfil-cliente-modal').classList.add('hidden');
async function autoLogin(cpf, senha) { const d = await getDoc(doc(db, "clientes", cpf)); if(d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); atualizarHeaderLogado(); abrirPainelCliente(d.data()); } else { localStorage.removeItem('maribella_auth_cliente'); document.getElementById('cliente-login-modal').classList.remove('hidden'); } }
function atualizarHeaderLogado() { document.getElementById('btn-header-pedidos').innerText = clienteLogadoDados ? `📦 ${clienteLogadoDados.nome.split(' ')[0]}` : `📦 Entrar`; }
window.realizarLoginCliente = async (e) => { e.preventDefault(); const cpf = document.getElementById('login-cpf-cliente').value.replace(/\D/g,''); const senha = document.getElementById('login-senha-cliente').value; const manter = document.getElementById('lembrar-senha').checked; window.mostrarNotificacao("Verificando...", "info"); const d = await getDoc(doc(db, "clientes", cpf)); if(d.exists() && d.data().senha === senha) { clienteLogadoCpf = cpf; clienteLogadoDados = d.data(); if(manter) localStorage.setItem('maribella_auth_cliente', JSON.stringify({cpf, senha})); atualizarHeaderLogado(); window.fecharLoginCliente(); abrirPainelCliente(d.data()); e.target.reset(); } else window.mostrarNotificacao("CPF/Senha incorretos.", "erro"); };
window.abrirRecuperacaoSenha = () => { window.fecharLoginCliente(); document.getElementById('recuperacao-modal').classList.remove('hidden'); };
window.fecharRecuperacao = () => document.getElementById('recuperacao-modal').classList.add('hidden');
window.recuperarSenhaCliente = async (e) => { e.preventDefault(); const cpf = document.getElementById('rec-cpf').value.replace(/\D/g,''); const tel = document.getElementById('rec-tel').value; const novaSenha = document.getElementById('rec-senha').value; const docRef = doc(db, "clientes", cpf); const d = await getDoc(docRef); if(d.exists() && d.data().telefone === tel) { await updateDoc(docRef, {senha: novaSenha}); window.mostrarNotificacao("Senha alterada!", "sucesso"); window.fecharRecuperacao(); document.getElementById('cliente-login-modal').classList.remove('hidden'); e.target.reset(); } else { window.mostrarNotificacao("Dados não conferem.", "erro"); } };
window.mudarAbaCliente = (idAba) => { document.getElementById('aba-historico').classList.add('hidden'); document.getElementById('aba-dados').classList.add('hidden'); document.getElementById('btn-aba-historico').classList.remove('ativa'); document.getElementById('btn-aba-historico').style.color='#aaa'; document.getElementById('btn-aba-dados').classList.remove('ativa'); document.getElementById('btn-aba-dados').style.color='#aaa'; document.getElementById(idAba).classList.remove('hidden'); document.getElementById('btn-'+idAba).classList.add('ativa'); document.getElementById('btn-'+idAba).style.color='var(--primary)'; }
async function abrirPainelCliente(dados) { document.getElementById('perfil-cliente-modal').classList.remove('hidden'); document.getElementById('titulo-painel-cliente').innerText = `👤 Oi, ${dados.nome.split(' ')[0]}`; document.getElementById('perfil-cpf').value = dados.cpf; document.getElementById('perfil-nome').value = dados.nome; document.getElementById('perfil-telefone').value = dados.telefone; document.getElementById('perfil-cep').value = dados.cep; document.getElementById('perfil-estado').value = dados.estado; document.getElementById('perfil-rua').value = dados.rua; document.getElementById('perfil-numero').value = dados.numero; document.getElementById('perfil-bairro').value = dados.bairro; document.getElementById('perfil-cidade').value = dados.cidade || ''; window.carregarMeusPedidosPainel(dados.cpf); }
window.carregarMeusPedidosPainel = async (cpf) => { const lista = document.getElementById('lista-meus-pedidos'); lista.innerHTML = "⏳ Carregando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); meusPedidosSalvos = []; lista.innerHTML = ""; let tem = false; snap.forEach(d => { let p = d.data(); p.id = d.id; if(p.cpf === cpf) { tem = true; meusPedidosSalvos.push(p); let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; let botoesAcao = p.status === 'Pendente' ? `<div style="display:flex; gap:10px; margin-top:10px;"><button onclick="window.abrirEdicaoPedido('${p.id}')" style="background:var(--secondary); color:white; border:none; padding:5px 10px; border-radius:5px;">✏️ Editar Pedido</button> <button onclick="window.cancelarMeuPedido('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px;">🗑️ Cancelar</button></div>` : ''; lista.innerHTML += `<div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border-left: 5px solid ${cor};"><strong style="font-size:1.1rem;">📅 ${p.data} às ${p.hora}</strong><br><div style="margin:5px 0; color:#555; font-size:0.9rem;"><strong>Itens:</strong> ${p.itens}</div><strong style="color:var(--primary); font-size:1.1rem;">💰 R$ ${p.total}</strong><br><span style="font-size:0.9rem; font-weight:bold; color:${cor};">● Status: ${p.status}</span>${botoesAcao}</div>`; } }); if(!tem) lista.innerHTML = "<p>Nenhuma compra.</p>"; }
window.cancelarMeuPedido = async (id) => { const sim = await window.confirmarAcao("Cancelar Pedido", "Tem certeza que não deseja mais esses produtos?"); if(sim) { await updateDoc(doc(db, "pedidos", id), { status: "Cancelado" }); window.carregarMeusPedidosPainel(clienteLogadoCpf); } };
window.abrirEdicaoPedido = (id) => { pedidoEmEdicao = JSON.parse(JSON.stringify(meusPedidosSalvos.find(p => p.id === id))); pedidoEmEdicao.detalhes_itens.forEach(i => i.qtd = i.qtd || 1); renderizarEdicaoPedido(); document.getElementById('modal-editar-pedido').classList.remove('hidden'); };
window.fecharEdicaoPedido = () => document.getElementById('modal-editar-pedido').classList.add('hidden');
function renderizarEdicaoPedido() { const lista = document.getElementById('lista-editar-itens'); lista.innerHTML = ""; let total = 0; if(pedidoEmEdicao.detalhes_itens.length === 0) lista.innerHTML = "<p style='color:red;'>O pedido será cancelado ao salvar.</p>"; pedidoEmEdicao.detalhes_itens.forEach((item, index) => { total += parseFloat(item.preco) * item.qtd; lista.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;"><div style="flex:1;"><strong>${item.nome}</strong><br><span style="color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span></div><div style="display:flex; align-items:center; gap:8px;"><button onclick="window.alterarQtdEdicao(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px; font-weight:bold;">-</button><span>${item.qtd}</span><button onclick="window.alterarQtdEdicao(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px; font-weight:bold;">+</button></div></div>`; }); document.getElementById('novo-total-edicao').innerText = total.toFixed(2); }
window.alterarQtdEdicao = (index, delta) => { pedidoEmEdicao.detalhes_itens[index].qtd += delta; if(pedidoEmEdicao.detalhes_itens[index].qtd <= 0) pedidoEmEdicao.detalhes_itens.splice(index, 1); renderizarEdicaoPedido(); };
window.salvarEdicaoPedido = async () => { if(pedidoEmEdicao.detalhes_itens.length === 0) { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { status: "Cancelado" }); window.fecharEdicaoPedido(); return window.carregarMeusPedidosPainel(clienteLogadoCpf); } let total = 0; pedidoEmEdicao.detalhes_itens.forEach(i => total += parseFloat(i.preco) * i.qtd); let strItens = pedidoEmEdicao.detalhes_itens.map(i => `${i.qtd}x ${i.nome}`).join(", "); try { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { detalhes_itens: pedidoEmEdicao.detalhes_itens, itens: strItens, total: total.toFixed(2) }); window.mostrarNotificacao("Atualizado!", "sucesso"); window.fecharEdicaoPedido(); window.carregarMeusPedidosPainel(clienteLogadoCpf); } catch(e) {} };
window.atualizarPerfilCliente = async (e) => { e.preventDefault(); const sim = await window.confirmarAcao("Salvar Dados", "Deseja atualizar seu endereço?"); if(!sim) return; const cpf = document.getElementById('perfil-cpf').value; try { await updateDoc(doc(db, "clientes", cpf), { nome: document.getElementById('perfil-nome').value, telefone: document.getElementById('perfil-telefone').value, cep: document.getElementById('perfil-cep').value, rua: document.getElementById('perfil-rua').value, numero: document.getElementById('perfil-numero').value, bairro: document.getElementById('perfil-bairro').value, cidade: document.getElementById('perfil-cidade').value, estado: document.getElementById('perfil-estado').value }); clienteLogadoDados.nome = document.getElementById('perfil-nome').value; atualizarHeaderLogado(); window.mostrarNotificacao("Atualizado!", "sucesso"); } catch (e) { } };
window.sairCliente = async () => { const sim = await window.confirmarAcao("Sair", "Deseja sair da conta?"); if(sim){ localStorage.removeItem('maribella_auth_cliente'); clienteLogadoCpf = null; clienteLogadoDados = null; atualizarHeaderLogado(); window.fecharPerfil(); window.mostrarNotificacao("Sessão encerrada.", "info"); } };

// --- ADMINISTRAÇÃO & CONTROLE ---
window.abrirLoginAdmin = () => document.getElementById('admin-login-modal').classList.remove('hidden');
window.fecharLoginAdmin = () => document.getElementById('admin-login-modal').classList.add('hidden');
window.realizarLoginAdmin = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value); window.mostrarNotificacao("Liberado!", "sucesso"); window.fecharLoginAdmin(); document.getElementById('admin-dashboard').classList.remove('hidden'); carregarListaAdminPedidos(); e.target.reset(); } catch(e) { window.mostrarNotificacao("Erro!", "erro"); } };
window.sairDoAdmin = async () => { await signOut(auth); document.getElementById('admin-dashboard').classList.add('hidden'); window.carregarProdutosDoBanco(); };

window.mudarAbaAdmin = (abaId) => { 
    document.querySelectorAll('.admin-aba').forEach(el => el.classList.add('hidden')); 
    document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('ativa')); 
    document.getElementById(abaId).classList.remove('hidden'); 
    document.getElementById(`tab-${abaId}`).classList.add('ativa'); 
    if(abaId==='admin-pedidos') carregarListaAdminPedidos(); 
    if(abaId==='admin-produtos') carregarListaAdminProdutosEditar(); 
    if(abaId==='admin-clientes') carregarListaAdminClientes(); 
    if(abaId==='admin-relatorios') window.gerarRelatoriosAdmin();
};

async function carregarListaAdminPedidos() { const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "⏳ Puxando vendas..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); todosPedidosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; todosPedidosAdmin.push(p); }); window.filtrarPedidosAdmin(); }
window.filtrarPedidosAdmin = () => {
    const termo = removerAcentos(document.getElementById('busca-pedido').value); const filtro = document.getElementById('filtro-status').value; const lista = document.getElementById('lista-admin-pedidos'); lista.innerHTML = "";
    let res = todosPedidosAdmin.filter(p => { let matchTermo = removerAcentos(p.cliente).includes(termo) || (p.cidade && removerAcentos(p.cidade).includes(termo)) || p.cpf.includes(termo); let matchStatus = filtro === 'Todos' || p.status === filtro; return matchTermo && matchStatus; });
    if(res.length === 0) lista.innerHTML = "<p>Nenhum pedido.</p>";
    res.forEach(p => { 
        let btnAprovar = p.status === 'Pendente' ? `<button onclick="window.aprovarPedido('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">✅ Aprovar</button>` : '';
        let btnVoltar = p.status !== 'Pendente' ? `<button onclick="window.voltarPendentePedido('${p.id}')" style="background:#f39c12; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">↩️ Pendente</button>` : '';
        let btnEtiqueta = p.status === 'Aprovado' ? `<button onclick="window.imprimirEtiqueta('${p.id}')" style="background:var(--secondary); color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🖨️ Etiqueta</button>` : '';
        let btnExcluir = `<button onclick="window.excluirPedidoAdmin('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🗑️ Excluir</button>`;
        lista.innerHTML += `<div class="admin-card"><strong style="color:var(--primary);">Data: ${p.data} às ${p.hora}</strong><br><strong>Cliente:</strong> ${p.cliente}<br><strong>Local:</strong> ${p.cidade||'Não info'} - ${p.estado||''}<br><strong>Total:</strong> R$ ${p.total} <br><span style="font-size:0.85rem;color:#666;">(${p.itens})</span><br><span style="font-weight:bold;">Status: ${p.status}</span><div style="display:flex; gap:5px; margin-top:10px; flex-wrap:wrap;">${btnAprovar}${btnVoltar}${btnEtiqueta}${btnExcluir}</div></div>`; 
    });
}
window.aprovarPedido = async (id) => { const sim = await window.confirmarAcao("Aprovar Pagamento", "O valor já caiu na conta?"); if(sim) { await updateDoc(doc(db, "pedidos", id), { status: "Aprovado" }); carregarListaAdminPedidos(); } };
window.voltarPendentePedido = async (id) => { const sim = await window.confirmarAcao("Reverter Status", "Voltar o pedido para Pendente?"); if(sim) { await updateDoc(doc(db, "pedidos", id), { status: "Pendente" }); carregarListaAdminPedidos(); } };
window.excluirPedidoAdmin = async (id) => { const sim = await window.confirmarAcao("Apagar Registro", "Deseja APAGAR este pedido definitivamente?"); if(sim) { await deleteDoc(doc(db, "pedidos", id)); carregarListaAdminPedidos(); } };
window.imprimirEtiqueta = (id) => { const pedido = todosPedidosAdmin.find(p => p.id === id); if(!pedido) return; const janela = window.open('', '_blank', 'width=600,height=600'); janela.document.write(`<html><head><title>Etiqueta - ${pedido.cliente}</title><style>body { font-family: sans-serif; padding: 20px; } .etiqueta { border: 2px dashed #333; padding: 20px; max-width: 400px; margin: auto; border-radius: 10px; } .remetente { font-size: 0.9rem; color: #555; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 15px; } .destinatario { font-size: 1.1rem; line-height: 1.5; } @media print { .btn-print { display: none; } }</style></head><body><div style="text-align:center; margin-bottom: 20px;"><button class="btn-print" onclick="window.print()" style="padding: 10px 20px; font-size: 1rem; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">🖨️ Imprimir Etiqueta</button></div><div class="etiqueta"><div class="remetente"><strong>REMETENTE:</strong><br>Maribella Kids<br>${configLoja.endereco || 'Seu Endereço Aqui'}<br>Cel: ${configLoja.telefone || ''}</div><div class="destinatario"><strong>DESTINATÁRIO:</strong><br>${pedido.cliente}<br>${pedido.endereco}<br><strong>CEP:</strong> ${pedido.cep || 'Não informado'}<br><strong>Tel:</strong> ${pedido.telefone}</div></div></body></html>`); janela.document.close(); };

// --- RELATÓRIOS INTELIGENTES (FILTROS E TOP 10) ---
window.gerarRelatoriosAdmin = () => {
    let mesFiltro = document.getElementById('filtro-mes-rel') ? document.getElementById('filtro-mes-rel').value : 'Todos';
    let anoFiltro = document.getElementById('filtro-ano-rel') ? document.getElementById('filtro-ano-rel').value : 'Todos';

    let prodsVenda = {}; let clientesTop = {}; let faturamento = 0; let totalVendas = 0;

    todosPedidosAdmin.forEach(p => {
        if(p.status !== 'Cancelado') {
            let mesPedido, anoPedido;
            if(p.timestamp) {
                anoPedido = p.timestamp.substring(0,4);
                mesPedido = p.timestamp.substring(5,7);
            } else {
                let partes = p.data.split('/');
                mesPedido = partes[1]; anoPedido = partes[2];
            }

            if (mesFiltro !== 'Todos' && mesPedido !== mesFiltro) return;
            if (anoFiltro !== 'Todos' && anoPedido !== anoFiltro) return;

            faturamento += parseFloat(p.total || 0);
            totalVendas++;
            
            clientesTop[p.cpf] = clientesTop[p.cpf] || {nome: p.cliente, gasto: 0, compras: 0};
            clientesTop[p.cpf].gasto += parseFloat(p.total || 0);
            clientesTop[p.cpf].compras += 1;
            
            if(p.detalhes_itens) {
                p.detalhes_itens.forEach(item => {
                    prodsVenda[item.id] = prodsVenda[item.id] || {nome: item.nome, qtd: 0};
                    prodsVenda[item.id].qtd += (item.qtd || 1);
                });
            }
        }
    });

    let html = `<div style="background:var(--success); color:white; padding:15px; border-radius:10px; text-align:center; margin-bottom:15px;"><h2>💰 R$ ${faturamento.toFixed(2)}</h2><p>Total de Vendas: ${totalVendas}</p></div>`;
    
    let rankProds = Object.values(prodsVenda).sort((a,b) => b.qtd - a.qtd).slice(0, 10);
    html += `<h4>🏆 Top 10 Produtos Mais Vendidos</h4><ul style="margin-bottom:20px; padding-left:20px; background:white; padding:15px; border-radius:8px; border:1px solid #ddd;">`;
    if(rankProds.length === 0) html += `<li>Nenhum dado no período.</li>`;
    rankProds.forEach((p, idx) => html += `<li style="margin-bottom:5px;"><strong>${idx+1}º</strong> ${p.nome} - <span style="color:var(--primary); font-weight:bold;">${p.qtd} un.</span></li>`);
    html += `</ul>`;

    let rankClientes = Object.values(clientesTop).sort((a,b) => b.gasto - a.gasto).slice(0, 10);
    html += `<h4>👑 Top 10 Clientes</h4><ul style="padding-left:20px; background:white; padding:15px; border-radius:8px; border:1px solid #ddd;">`;
    if(rankClientes.length === 0) html += `<li>Nenhum dado no período.</li>`;
    rankClientes.forEach((c, idx) => html += `<li style="margin-bottom:5px;"><strong>${idx+1}º</strong> ${c.nome} - <span style="color:var(--success); font-weight:bold;">R$ ${c.gasto.toFixed(2)}</span> (${c.compras} compras)</li>`);
    html += `</ul>`;

    document.getElementById('conteudo-relatorios').innerHTML = html;
};

// --- LÓGICA DE VARIAÇÕES E FOTOS NO ADMIN ---
window.adicionarVariacaoAdmin = (tamanho='P', cor='', qtd=0) => { variacoesAdminTemp.push({tamanho, cor, qtd}); renderizarVariacoesAdmin(); };
window.atualizarVariacaoAdmin = (idx, campo, valor) => { variacoesAdminTemp[idx][campo] = valor; renderizarVariacoesAdmin(); };
window.removerVariacaoAdmin = (idx) => { variacoesAdminTemp.splice(idx, 1); renderizarVariacoesAdmin(); };
function renderizarVariacoesAdmin() {
    const div = document.getElementById('lista-variacoes-admin'); let total = 0;
    div.innerHTML = variacoesAdminTemp.map((v, i) => {
        total += parseInt(v.qtd||0);
        return `<div style="display:flex; gap:5px; align-items:center;">
            <select onchange="window.atualizarVariacaoAdmin(${i}, 'tamanho', this.value)" style="padding:10px; border:1px solid #ccc; border-radius:5px;">
                <option value="P" ${v.tamanho==='P'?'selected':''}>P</option><option value="M" ${v.tamanho==='M'?'selected':''}>M</option><option value="G" ${v.tamanho==='G'?'selected':''}>G</option><option value="GG" ${v.tamanho==='GG'?'selected':''}>GG</option>
            </select>
            <input type="text" placeholder="Cor (Ex: Azul/Estampa)" value="${v.cor}" onchange="window.atualizarVariacaoAdmin(${i}, 'cor', this.value)" style="flex:1; padding:10px; border:1px solid #ccc; border-radius:5px;">
            <input type="number" placeholder="Qtd" value="${v.qtd}" onchange="window.atualizarVariacaoAdmin(${i}, 'qtd', parseInt(this.value)||0)" style="width:70px; padding:10px; border:1px solid #ccc; border-radius:5px;">
            <button type="button" onclick="window.removerVariacaoAdmin(${i})" style="background:#e74c3c; color:white; border:none; padding:10px 12px; border-radius:5px;">X</button>
        </div>`;
    }).join('');
    document.getElementById('total-pecas-admin').innerText = total;
}

window.salvarProdutoAdmin = async (e) => { 
    e.preventDefault(); 
    if(variacoesAdminTemp.length === 0) return window.mostrarNotificacao("Adicione pelo menos 1 variação (Tamanho/Qtd)!", "erro");
    let variacoesLimpas = variacoesAdminTemp.map(v => ({ nome: `${v.tamanho} - ${v.cor||'S/ Cor'}`, tamanho: v.tamanho, cor: v.cor, qtd: v.qtd }));

    const sim = await window.confirmarAcao("Salvar Peça", "Salvar no sistema?"); if(!sim) return;
    const btn = document.getElementById('btn-salvar-produto'); const imgs = document.getElementById('add-imagem-file').files; const id = document.getElementById('edit-produto-id').value; 
    btn.innerText = "⏳..."; btn.disabled = true; 
    
    try { 
        let urlsFotos = [];
        if (imgs && imgs.length > 0) {
            for(let i=0; i<imgs.length; i++){
                if(i > 3) break; // Máx 4 fotos
                const sRef = ref(storage, 'produtos/' + Date.now() + '_' + imgs[i].name); 
                await uploadBytes(sRef, imgs[i]); 
                urlsFotos.push(await getDownloadURL(sRef));
            }
        } 

        const pData = { nome: document.getElementById('add-nome').value, preco: parseFloat(document.getElementById('add-preco').value), variacoes: variacoesLimpas, categoria: document.getElementById('add-categoria').value, lancamento: document.getElementById('add-lancamento').checked, material: document.getElementById('add-material').value }; 
        if(urlsFotos.length > 0) { pData.imagens = urlsFotos; pData.imagem = urlsFotos[0]; } 
        
        if (id) { await updateDoc(doc(db, "produtos", id), pData); } else { if(!pData.imagem) { btn.disabled = false; btn.innerText = "💾 Salvar Produto"; return window.mostrarNotificacao("Foto obrigatória!","erro"); } await addDoc(collection(db, "produtos"), pData); } 
        window.limparFormProduto(); carregarListaAdminProdutosEditar(); window.mostrarNotificacao("Sucesso!","sucesso"); 
    } catch(e) {} 
    btn.innerText = "💾 Salvar Produto"; btn.disabled = false; 
};

window.limparFormProduto = () => { document.getElementById('form-add-produto').reset(); document.getElementById('edit-produto-id').value=''; variacoesAdminTemp=[]; renderizarVariacoesAdmin(); };

async function carregarListaAdminProdutosEditar() { const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "produtos")); todosProdutosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; if(!p.variacoes) p.variacoes = [{nome: p.tamanho || 'Único', qtd: p.estoque || 0}]; todosProdutosAdmin.push(p); }); window.filtrarProdutosAdmin(); }
window.filtrarProdutosAdmin = () => { 
    const termo = removerAcentos(document.getElementById('busca-produto-admin').value); const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = ""; let res = todosProdutosAdmin.filter(p => removerAcentos(p.nome).includes(termo)); if(res.length === 0) lista.innerHTML = "<p>Nenhum produto.</p>"; 
    res.forEach(p => { 
        let estoqueTotal = p.variacoes.reduce((s,v)=> s + parseInt(v.qtd||0), 0);
        let ft = p.imagens ? p.imagens[0] : p.imagem;
        lista.innerHTML += `<div class="admin-card" style="display:flex; align-items:center; gap:15px; padding:10px;"><img src="${ft}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div style="flex:1;"><strong>${p.nome}</strong><br>Total Estq: ${estoqueTotal} | R$ ${parseFloat(p.preco).toFixed(2)}</div><div style="display:flex; gap:5px;"><button onclick="window.editarProdutoAdmin('${p.id}')" class="btn-icon" style="background:var(--secondary); color:white;">✏️</button> <button onclick="window.excluirProdutoAdmin('${p.id}')" class="btn-icon" style="background:#e74c3c; color:white;">🗑️</button></div></div>`; 
    }); 
}
window.editarProdutoAdmin = (id) => { 
    let p = todosProdutosAdmin.find(x => x.id === id); if(!p) return;
    document.getElementById('edit-produto-id').value=p.id; document.getElementById('add-nome').value=p.nome; document.getElementById('add-preco').value=p.preco; document.getElementById('add-categoria').value=p.categoria||'Vestido'; document.getElementById('add-lancamento').checked=p.lancamento===true; document.getElementById('add-material').value=p.material; 
    
    variacoesAdminTemp = p.variacoes.map(v => {
        let t = v.tamanho || (v.nome.split('-')[0] ? v.nome.split('-')[0].trim() : 'P');
        let c = v.cor || (v.nome.split('-')[1] ? v.nome.split('-')[1].trim() : '');
        return { tamanho: t, cor: c, qtd: v.qtd };
    });
    renderizarVariacoesAdmin();
    document.querySelector('.admin-content').scrollTo(0,0); 
};
window.excluirProdutoAdmin = async (id) => { const sim = await window.confirmarAcao("Apagar", "🗑️ Deseja apagar essa peça do estoque?"); if(sim) { await deleteDoc(doc(db, "produtos", id)); window.mostrarNotificacao("Peça apagada!", "info"); carregarListaAdminProdutosEditar(); window.carregarProdutosDoBanco(); } };

window.imprimirBalancoEstoque = () => {
    const janela = window.open('', '_blank'); let linhasHtml = ''; let totalPecasGeral = 0; let produtosOrdem = [...todosProdutosAdmin].sort((a,b) => a.nome.localeCompare(b.nome));
    produtosOrdem.forEach(p => { let totalProd = p.variacoes.reduce((s,v) => s + parseInt(v.qtd||0), 0); totalPecasGeral += totalProd; let strVars = p.variacoes.map(v => `${v.nome}: ${v.qtd} un.`).join('<br>'); linhasHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${p.nome}</td><td style="padding: 8px; border: 1px solid #ddd;">${p.categoria}</td><td style="padding: 8px; border: 1px solid #ddd;">${strVars}</td><td style="padding: 8px; border: 1px solid #ddd; text-align:center; font-weight:bold;">${totalProd}</td></tr>`; });
    janela.document.write(`<html><head><title>Balanço de Estoque - Maribella Kids</title><style>body { font-family: sans-serif; padding: 20px; color: #333; } table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; } th { background-color: #ffb6c1; color: #333; padding: 10px; border: 1px solid #ddd; text-align: left; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; } @media print { .btn-print { display: none; } }</style></head><body><div class="header"><h2>Balanço de Estoque - Maribella Kids</h2><div><button class="btn-print" onclick="window.print()" style="padding: 10px 20px; font-size: 1rem; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">🖨️ Imprimir / Salvar PDF</button></div></div><p><strong>Data da geração:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p><p><strong>Total Geral de Peças:</strong> ${totalPecasGeral} unidades</p><table><thead><tr><th>Produto</th><th>Categoria</th><th>Tamanhos/Cores (Qtd)</th><th style="text-align:center;">Total da Peça</th></tr></thead><tbody>${linhasHtml}</tbody></table></body></html>`);
    janela.document.close();
};

async function carregarListaAdminClientes() { const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "clientes")); todosClientesAdmin = []; snap.forEach(d => todosClientesAdmin.push(d.data())); window.filtrarClientesAdmin(); }
window.filtrarClientesAdmin = () => { 
    const termo = removerAcentos(document.getElementById('busca-cliente-admin').value); const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = ""; 
    let res = todosClientesAdmin.filter(c => removerAcentos(c.nome).includes(termo) || c.telefone.includes(termo) || (c.cpf && c.cpf.includes(termo))); 
    if(res.length === 0) lista.innerHTML = "<p>Nenhum cliente.</p>"; 
    res.forEach(c => { 
        let linkZap = gerarLinkWhatsApp(c.telefone, "Olá, aqui é da Maribella Kids!"); 
        lista.innerHTML += `<div class="admin-card" style="border-left-color: #2ecc71; display:flex; justify-content:space-between; align-items:center;"><div><strong>${c.nome}</strong><br><span style="font-size:0.85rem; color:#666;">📍 ${c.cidade||c.bairro||''}, ${c.estado||''}</span><br><span>${c.telefone}</span></div><div style="display:flex; gap:10px;"><button onclick="window.verHistoricoClienteAdmin('${c.cpf}', '${c.nome}')" style="background:var(--secondary); color:white; border:none; padding:8px 10px; border-radius:8px; font-weight:bold; cursor:pointer;">🛍️ Histórico</button><a href="${linkZap}" target="_blank" style="background:#25D366; color:white; padding:8px 10px; border-radius:8px; text-decoration:none;">💬</a></div></div>`; 
    }); 
}
window.fecharHistoricoClienteAdmin = () => document.getElementById('admin-historico-cliente-modal').classList.add('hidden');
window.verHistoricoClienteAdmin = async (cpf, nome) => { document.getElementById('admin-historico-cliente-modal').classList.remove('hidden'); document.getElementById('nome-historico-admin').innerText = `🛍️ Histórico: ${nome.split(' ')[0]}`; const lista = document.getElementById('lista-historico-cliente-admin'); lista.innerHTML = "⏳ Buscando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); lista.innerHTML = ""; let tem = false; snap.forEach(d => { const p = d.data(); if(p.cpf === cpf) { tem = true; let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; lista.innerHTML += `<div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:10px; border-left: 4px solid ${cor};"><strong>Data: ${p.data}</strong><br><span style="font-size:0.85rem;">Itens: ${p.itens}</span><br><strong>R$ ${p.total}</strong> - <span style="font-weight:bold; color:${cor};">${p.status}</span></div>`; } }); if(!tem) lista.innerHTML = "<p>Sem compras.</p>"; };

window.gerarDadosDeExemplo = async () => {
    const sim = await window.confirmarAcao("Criar Exemplos", "Isso vai adicionar roupas falsas no seu banco. Confirmar?"); if(!sim) return;
    window.mostrarNotificacao("Gerando produtos...", "info");
    const prods = [
        {nome: "Vestido Floral Princesa", preco: 89.90, variacoes: [{nome:"P - Rosa", tamanho:"P", cor:"Rosa", qtd: 10}, {nome:"M - Azul", tamanho:"M", cor:"Azul", qtd:5}], categoria: "Vestido", lancamento: false, material: "Algodão", imagem: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500"},
    ];
    for(let p of prods) await addDoc(collection(db, "produtos"), p);
    window.mostrarNotificacao("Pronto! Recarregando...", "sucesso"); setTimeout(()=>window.location.reload(), 2000);
};

// --- LOGICA DA NOTIFICAÇÃO DO APP ---
setTimeout(() => {
    const dispensado = localStorage.getItem('maribella_app_banner_closed');
    if(!dispensado) document.getElementById('install-app-banner').classList.remove('hidden');
}, 3000); 

window.fecharBannerInstalacao = () => {
    document.getElementById('install-app-banner').classList.add('hidden');
    localStorage.setItem('maribella_app_banner_closed', 'true');
};

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
});

document.getElementById('btn-instalar-app').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') window.fecharBannerInstalacao();
        deferredPrompt = null;
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            window.confirmarAcao("Instalar no iPhone 🍏", "1. Toque no ícone de [Compartilhar] (o quadrado com a seta pra cima) no menu inferior.\n\n2. Role um pouco para baixo e toque em 'Adicionar à Tela de Início'.\n\nPronto! Vai virar um App na sua tela! 🎀");
        } else {
            window.confirmarAcao("Instalar o App 📱", "1. Clique nos 3 pontinhos (⋮) no canto superior direito do seu navegador.\n\n2. Clique em 'Adicionar à Tela Inicial' ou 'Instalar Aplicativo'.\n\nPronto! O App estará na sua tela inicial! 🎀");
        }
        window.fecharBannerInstalacao();
    }
});


// Inicialização
const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.cpf, logado.senha);
carregarConfiguracoes(); carregarForm(); atualizarCarrinho(); window.carregarProdutosDoBanco();

gerarAvaliacoes(); 
renderizarReviewSidebar(); 
setInterval(renderizarReviewSidebar, 30000); // A cada 30 segundos
// --- LIGANDO O MOTOR DO APP (SERVICE WORKER) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('✅ Service Worker ativado com sucesso!', reg.scope))
            .catch(err => console.error('❌ Falha ao ativar o Service Worker:', err));
    });
}
