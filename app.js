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
let configLoja = { pix: "", pixNome: "", telefone: "5581999999999", aviso: "Vendemos apenas grade fechada (10 un). Frete via WhatsApp!", instagram: "https://instagram.com/maribellakids", endereco: "Sua Cidade, Estado", linkMaps: "#" };
let clienteLogadoDados = null;
let meusPedidosSalvos = []; let pedidoEmEdicao = null;
let carouselIntervals = [];

let variacoesAdminTemp = [];
let produtoParaAdicionarTamanho = null;
let graficoVendasApp = null; 

window.mascaraTelefone = (i) => { 
    let v = i.value.replace(/\D/g,""); 
    v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); 
    v = v.replace(/(\d{4})(\d{4})$/,"$1-$2"); 
    i.value = v; 
};
window.removerAcentos = (str) => { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; };

function esconderCarrinhoFlutuante() {
    const c = document.getElementById('cart-btn-floating');
    if(c) c.classList.add('oculto');
}
function mostrarCarrinhoFlutuante() {
    const c = document.getElementById('cart-btn-floating');
    const isAdm = !document.getElementById('admin-dashboard').classList.contains('hidden');
    if(c && !isAdm) c.classList.remove('oculto');
}

window.mostrarNotificacao = (msg, t = 'sucesso', fechavel = false) => { 
    const toast = document.getElementById('toast-notificacao'); 
    let fecharBtn = fechavel ? `<span onclick="window.fecharToast()" style="margin-left:10px; cursor:pointer; font-size:1.2rem; color:#666;">×</span>` : '';
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

// --- AVALIAÇÕES CRESCENTES (1 a cada 2 dias) ---
let avaliacoesGeradas = []; let indexAvaliacaoAtual = 0;
function gerarAvaliacoes() {
    const totalReviews = 160;
    const nomesF = ["Mariana", "Carla", "Ana", "Beatriz", "Juliana", "Camila", "Fernanda", "Amanda", "Letícia", "Vanessa", "Bruna", "Aline"];
    const nomesM = ["Carlos", "Marcos", "João", "Pedro", "Lucas", "Mateus", "Rafael", "Felipe", "Bruno", "Thiago", "Eduardo"];
    const sobrenomes = ["Silva", "Mendes", "Costa", "Souza", "Oliveira", "Pereira", "Lima", "Gomes", "Ribeiro", "Martins"];
    const dddBR = ["81", "87", "81", "87", "81", "87", "11", "21", "31", "41"];
    const comentarios = ["Qualidade incrível, amei as grades!", "Chegou super rápido, recomendo.", "Perfeito, tamanho certinho para revenda.", "Comprei para revender e já acabou tudo!", "Lindas peças, ótimo acabamento.", "As cores são vivas, idêntico à foto.", "Minhas clientes adoraram.", "Superou minhas expectativas.", "Comprarei novamente.", "Tudo perfeito, recomendo para lojistas!"];

    const dataBase = new Date('2024-01-01').getTime();
    const hoje = new Date().getTime();
    const diasPassados = Math.floor((hoje - dataBase) / (1000 * 60 * 60 * 24));
    const totalPermitido = Math.max(1, Math.floor(diasPassados / 2));

    let tempReviews = [];
    for(let i=0; i < totalReviews; i++) {
        let isMulher = Math.random() > 0.2;
        let nomeBase = isMulher ? nomesF[(i * 13) % nomesF.length] : nomesM[(i * 11) % nomesM.length];
        let nomeCompleto = `${nomeBase} ${sobrenomes[(i * 7) % sobrenomes.length]}`;
        let ddd = dddBR[Math.floor(Math.random()*dddBR.length)];
        let telefone = `(${ddd}) 9${Math.floor(Math.random()*9)}***-**${Math.floor(Math.random()*90)+10}`;
        let generoFoto = isMulher ? "women" : "men";

        tempReviews.push({
            nome: `${nomeCompleto} 🇧🇷`,
            telefone: `${telefone} | ⭐⭐⭐⭐⭐`,
            texto: comentarios[(i * 23) % comentarios.length],
            foto: `https://randomuser.me/api/portraits/${generoFoto}/${(i % 99) + 1}.jpg`
        });
    }
    avaliacoesGeradas = tempReviews.slice(0, totalPermitido).reverse();
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

window.toggleBusca = () => { 
    let b = document.getElementById('busca-container'); 
    b.classList.toggle('hidden'); 
    if(!b.classList.contains('hidden')) document.getElementById('busca-input').focus(); 
};

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
window.filtrarProdutos = () => { window.filtrarCategoria('Todas'); };

// --- LIGHTBOX COM SETAS ---
let lightboxCurrentProdId = null;
let lightboxImgsArray = [];
let lightboxCurrentIndex = 0;

window.abrirLightbox = (src, id = null, arrayFotosStr = null) => { 
    lightboxCurrentProdId = id; 
    document.getElementById('lightbox-img').src = src; 
    document.getElementById('lightbox-modal').classList.remove('hidden'); 
    
    if(arrayFotosStr && arrayFotosStr !== 'null') {
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

// --- CONFIGURAÇÕES DA LOJA ---
async function carregarConfiguracoes() { 
    const snap = await getDoc(doc(db, "config", "loja")); 
    if(snap.exists()) { 
        configLoja = snap.data(); 
        document.getElementById('pix-display').innerText = configLoja.pix; 
        document.getElementById('pix-nome-display').innerText = configLoja.pixNome || configLoja.pix; 
        document.getElementById('config-pix').value = configLoja.pix; 
        document.getElementById('config-pix-nome').value = configLoja.pixNome || ""; 
        document.getElementById('config-telefone').value = configLoja.telefone; 
        document.getElementById('config-aviso').value = configLoja.aviso || ""; 
        document.getElementById('config-instagram').value = configLoja.instagram || ""; 
        document.getElementById('config-endereco').value = configLoja.endereco || "";
        document.getElementById('config-link-maps').value = configLoja.linkMaps || "";
    } 
    document.getElementById('texto-aviso-loja').innerText = configLoja.aviso || "Vendemos apenas grade fechada."; 
    document.getElementById('footer-instagram-link').href = configLoja.instagram || "#"; 
    
    const endFormatado = (configLoja.endereco || "Nossa Loja").replace(/\n/g, '<br>');
    document.getElementById('footer-endereco-texto').innerHTML = '📍 ' + endFormatado; 
    document.getElementById('menu-endereco-info').innerHTML = '📍 ' + endFormatado;
    
    document.getElementById('footer-endereco-link').href = configLoja.linkMaps || "#";
    document.getElementById('menu-endereco-link').href = configLoja.linkMaps || "#";
}

window.salvarConfiguracoes = async (e) => { 
    e.preventDefault(); const sim = await window.confirmarAcao("Ajustes", "Salvar novas informações da loja?"); if(!sim) return;
    const btn = document.getElementById('btn-salvar-config'); btn.innerText = "⏳..."; 
    try { 
        configLoja.pix = document.getElementById('config-pix').value; 
        configLoja.pixNome = document.getElementById('config-pix-nome').value; 
        configLoja.telefone = document.getElementById('config-telefone').value; 
        configLoja.aviso = document.getElementById('config-aviso').value; 
        configLoja.instagram = document.getElementById('config-instagram').value; 
        configLoja.endereco = document.getElementById('config-endereco').value;
        configLoja.linkMaps = document.getElementById('config-link-maps').value;
        
        await setDoc(doc(db, "config", "loja"), configLoja); 
        
        carregarConfiguracoes(); 
        mostrarNotificacao("Salvo!", "sucesso"); 
    } catch(err) {} btn.innerText = "💾 Atualizar Dados"; 
};

// --- CARREGAMENTO E VITRINE (LOOP INFINITO) ---
window.carregarProdutosDoBanco = async () => {
    try {
        const snap = await getDocs(collection(db, "produtos")); listaDeProdutos = [];
        if (snap.empty) { document.getElementById('vitrine-estacoes').innerHTML = '<p style="text-align:center;color:#aaa;">Nenhuma peça.</p>'; return; }
        snap.forEach(d => { let p = d.data(); p.id = d.id; 
            if(!p.variacoes) p.variacoes = [{nome: 'Grade Fechada (10 un)', qtd: p.estoque || 0}];
            listaDeProdutos.push(p); 
        });
        renderizarStories(); renderizarVitrinesCategorias(listaDeProdutos);
    } catch (e) {}
}

// SCROLL DOS STORIES (SOZINHO E MANUAL)
let scrollStoriesInt = null;
let storyPausado = false;

window.iniciarScrollStories = () => {
    const wrapper = document.querySelector('.stories-wrapper');
    if(!wrapper) return;
    
    wrapper.addEventListener('touchstart', () => storyPausado = true);
    wrapper.addEventListener('touchend', () => setTimeout(()=> storyPausado = false, 2000));
    wrapper.addEventListener('mousedown', () => storyPausado = true);
    wrapper.addEventListener('mouseup', () => setTimeout(()=> storyPausado = false, 2000));
    wrapper.addEventListener('mouseenter', () => storyPausado = true);
    wrapper.addEventListener('mouseleave', () => storyPausado = false);

    clearInterval(scrollStoriesInt);
    scrollStoriesInt = setInterval(() => {
        if(!storyPausado) {
            wrapper.scrollLeft += 1;
            // Se chegou perto do fim, volta sutilmente para o meio (já que os itens estão duplicados 3x)
            if(wrapper.scrollLeft >= (wrapper.scrollWidth - wrapper.clientWidth - 5)) {
                wrapper.scrollLeft = wrapper.scrollWidth / 3; 
            }
        }
    }, 30); // Velocidade suave
};

function renderizarStories() {
    const track = document.getElementById('stories-track'); track.innerHTML = '';
    let storyList = [...listaDeProdutos, ...listaDeProdutos, ...listaDeProdutos]; 
    storyList.forEach(p => { 
        let foto = p.imagens ? p.imagens[0] : p.imagem;
        track.innerHTML += `<img src="${foto}" class="story-circle" onclick="window.abrirLightbox('${foto}', '${p.id}', null)" title="${p.nome}">`; 
    });
    window.iniciarScrollStories();
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
        let blusas = lista.filter(p => p.categoria === 'T-shirt' || p.categoria === 'Blusa/Cropped/Body'); 
        let conjuntos = lista.filter(p => p.categoria === 'Conjunto');

        if(lancamentos.length > 0) criarSecaoCarrossel('Lançamentos 🌟', lancamentos, container, indexFila++);
        if(shorts.length > 0) criarSecaoCarrossel('Shorts e Saias 🩳👗', shorts, container, indexFila++);
        if(blusas.length > 0) criarSecaoCarrossel('T-shirts 👚', blusas, container, indexFila++);
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

        let imgHtml = '';
        if(p.imagens && p.imagens.length > 1) {
            let fotosStr = JSON.stringify(p.imagens).replace(/"/g, '&quot;');
            imgHtml = `<div class="slider-viewport"><div class="prod-slider" data-count="${p.imagens.length}">`;
            
            // CORREÇÃO: O click agora é na imagem específica para abrir nela!
            p.imagens.forEach(img => {
                imgHtml += `<img src="${img}" onclick="event.stopPropagation(); window.abrirLightbox('${img}', '${p.id}', '${fotosStr}')" style="width:100%; flex-shrink:0;">`;
            });
            imgHtml += `</div></div><div style="text-align:center; font-size:0.75rem; color:#888; font-weight:bold; padding: 4px 0;">📸 ${p.imagens.length} Fotos</div>`;
        } else {
            let ft = p.imagens ? p.imagens[0] : p.imagem;
            imgHtml = `<img src="${ft}" style="width:100%; height:160px; object-fit:cover;" onclick="window.abrirLightbox('${ft}', '${p.id}', null)">`;
        }

        let btnStatus = estoqueTotal > 0 ? `<button class="btn-add" onclick="window.abrirEscolherTamanho('${p.id}')">🛒 Comprar Grade</button>` : `<button class="btn-add esgotado">Esgotado</button>`;
        carrossel.innerHTML += `<div class="card">${imgHtml}<div class="card-info"><div><h3>${p.nome}</h3><p style="font-size:0.75rem;">Grade (10 un)</p><p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p></div>${btnStatus}</div></div>`;
    });
    containerMaster.appendChild(section);

    let direcao = (indexFila % 2 === 0) ? 1 : -1;
    if(direcao === -1 && produtos.length > 2) setTimeout(() => carrossel.scrollLeft = carrossel.scrollWidth, 300);

    let autoScroll = setInterval(() => {
        if(!carrossel.querySelector('.card') || produtos.length <= 2) return;
        let firstCard = carrossel.firstElementChild;
        let lastCard = carrossel.lastElementChild;
        let cardWidth = firstCard.clientWidth + 10;
        if(direcao === 1) { 
            carrossel.scrollBy({left: cardWidth, behavior:'smooth'});
            setTimeout(() => { carrossel.appendChild(firstCard); carrossel.scrollBy({left: -cardWidth, behavior:'instant'}); }, 400);
        } else { 
            carrossel.prepend(lastCard);
            carrossel.scrollBy({left: cardWidth, behavior:'instant'});
            setTimeout(() => { carrossel.scrollBy({left: -cardWidth, behavior:'smooth'}); }, 50);
        }
    }, 4500); 
    carouselIntervals.push(autoScroll);
}

// SLIDER DE IMAGENS DO PRODUTO (CÍRCULO INFINITO)
setInterval(() => {
    document.querySelectorAll('.prod-slider').forEach(slider => {
        let count = parseInt(slider.getAttribute('data-count'));
        if (count <= 1) return;
        
        slider.style.transition = 'transform 0.4s ease-in-out';
        slider.style.transform = `translateX(-100%)`;
        
        // Pega a primeira foto e joga pro final em um loop perfeito
        setTimeout(() => {
            slider.style.transition = 'none';
            slider.appendChild(slider.firstElementChild);
            slider.style.transform = `translateX(0)`;
        }, 400);
    });
}, 3000);

// --- ESCOLHA DE GRADES ---
window.mudarQtdModal = (idx, delta, max) => {
    let input = document.getElementById(`qtd_var_${idx}`);
    if(!input) return;
    let val = parseInt(input.value) + delta;
    if(val < 0) val = 0;
    if(val > max) {
        window.mostrarNotificacao(`Estoque máximo: ${max} grades`, 'erro');
        val = max;
    }
    input.value = val;
};

window.abrirEscolherTamanho = (id) => {
    produtoParaAdicionarTamanho = listaDeProdutos.find(p => p.id === id);
    if(!produtoParaAdicionarTamanho) return;
    let ft = produtoParaAdicionarTamanho.imagens ? produtoParaAdicionarTamanho.imagens[0] : produtoParaAdicionarTamanho.imagem;

    document.getElementById('info-produto-tamanho').innerHTML = `<img src="${ft}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div><strong style="font-size:1rem;">${produtoParaAdicionarTamanho.nome}</strong><br><span style="color:var(--secondary); font-weight:bold;">Grade: R$ ${parseFloat(produtoParaAdicionarTamanho.preco).toFixed(2)}</span></div>`;
    
    let firstAvailableIdx = -1;
    produtoParaAdicionarTamanho.variacoes.forEach((v, i) => { 
        if (v.qtd > 0 && firstAvailableIdx === -1) firstAvailableIdx = i; 
    });

    let htmlOpcoes = "";
    produtoParaAdicionarTamanho.variacoes.forEach((v, idx) => {
        let esgotado = v.qtd <= 0;
        let corSpan = esgotado ? 'color:#ccc; text-decoration:line-through;' : 'color:#333;';
        let isDefault = (idx === firstAvailableIdx);
        
        let nomeVar = "Grade Fechada (10 un)";

        htmlOpcoes += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #eee; border-radius:8px; margin-bottom:5px; ${corSpan}">
            <div><strong>${nomeVar}</strong><br><span style="font-size:0.75rem;">${esgotado ? 'Esgotado' : v.qtd + ' grades disponíveis'}</span></div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button onclick="window.mudarQtdModal(${idx}, -1, ${v.qtd})" style="border:none; background:#eee; width:30px; height:30px; border-radius:5px; font-weight:bold; cursor:pointer; color:#333;" ${esgotado ? 'disabled' : ''}>-</button>
                <input type="number" id="qtd_var_${idx}" min="0" max="${v.qtd}" value="${esgotado ? 0 : (isDefault ? 1 : 0)}" readonly style="width:40px; padding:5px; border:1px solid #eee; border-radius:5px; font-weight:bold; text-align:center; background:#fff; color:#333;">
                <button onclick="window.mudarQtdModal(${idx}, 1, ${v.qtd})" style="border:none; background:#eee; width:30px; height:30px; border-radius:5px; font-weight:bold; cursor:pointer; color:#333;" ${esgotado ? 'disabled' : ''}>+</button>
            </div>
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
            
            let nomeVar = "Grade Fechada (10 un)";

            if(itemEx) {
                if(itemEx.qtd + qtdPedida > v.qtd) return window.mostrarNotificacao(`Estoque max atingido!`, 'erro');
                itemEx.qtd += qtdPedida;
            } else {
                let imgCart = produtoParaAdicionarTamanho.imagens ? produtoParaAdicionarTamanho.imagens[0] : produtoParaAdicionarTamanho.imagem;
                carrinho.push({ ...produtoParaAdicionarTamanho, imagem: imgCart, cartId: cartId, tamanhoSelecionado: nomeVar, idxVariacao: idx, estoqueDisponivel: v.qtd, qtd: qtdPedida });
            }
            adicionouAlgo = true;
        }
    });
    
    if(!adicionouAlgo) return window.mostrarNotificacao("Adicione pelo menos 1 grade usando o botão +", "erro");
    
    salvarCarrinhoNoLocal(); 
    window.fecharModalTamanho();
    window.mostrarNotificacao("Adicionado com sucesso!", 'sucesso'); 
};


// --- CARRINHO BÁSICO E CHECKOUT ---
window.alterarQtdCarrinho = (index, delta) => { let novoQtd = (carrinho[index].qtd || 1) + delta; if(novoQtd > carrinho[index].estoqueDisponivel) return window.mostrarNotificacao("Estoque máximo atingido para esta grade!", 'erro'); carrinho[index].qtd = novoQtd; if(carrinho[index].qtd <= 0) carrinho.splice(index, 1); salvarCarrinhoNoLocal(); };
window.removerDoCarrinho = async (index) => { const sim = await window.confirmarAcao("Remover item", "Tirar do carrinho?"); if(sim) { carrinho.splice(index, 1); salvarCarrinhoNoLocal(); } };
function salvarCarrinhoNoLocal() { localStorage.setItem('maribella_carrinho', JSON.stringify(carrinho)); atualizarCarrinho(); }

window.toggleCart = () => { 
    document.getElementById('cart-modal').classList.toggle('hidden'); 
    document.getElementById('etapa-carrinho').classList.remove('hidden'); 
    document.getElementById('etapa-cadastro').classList.add('hidden'); 
};
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
                <button onclick="window.removerDoCarrinho(${index})" style="color:red;background:none;border:none;font-weight:bold;font-size:1.2rem;margin-left:5px;">×</button>
            </div>
        </div>`; 
    });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

function validaCamposCheckout() { const nome = document.getElementById('cliente-nome').value; const tel = document.getElementById('cliente-telefone').value; const cid = document.getElementById('cliente-cidade').value; const est = document.getElementById('cliente-estado').value; const met = document.getElementById('cliente-metodo-entrega').value; if(!nome || !tel || !cid || !est || !met) return false; return true; }
window.tentarCopiarPix = () => { if(!validaCamposCheckout()) return window.mostrarNotificacao("Preencha seu cadastro!", "erro"); navigator.clipboard.writeText(configLoja.pix).then(() => window.mostrarNotificacao("Chave PIX copiada!", 'sucesso')); };
window.tentarFinalizar = (e) => { if(!validaCamposCheckout()) { e.preventDefault(); window.mostrarNotificacao("Preencha seus dados!", "erro"); } };

window.mudarMetodoEntrega = () => {
    const metodo = document.getElementById('cliente-metodo-entrega').value;
    const blocoExc = document.getElementById('bloco-excursao');
    const inputExc = document.getElementById('cliente-excursao');
    const blocoRet = document.getElementById('bloco-retirada');
    
    if (metodo === 'Excursão') {
        blocoExc.classList.remove('hidden'); inputExc.required = true;
        blocoRet.classList.add('hidden');
    } else if (metodo === 'Retirada') {
        blocoExc.classList.add('hidden'); inputExc.required = false;
        blocoRet.classList.remove('hidden');
    } else {
        blocoExc.classList.add('hidden'); inputExc.required = false;
        blocoRet.classList.add('hidden');
    }
    window.salvarFormulario();
}

window.salvarFormulario = () => { localStorage.setItem('maribella_form', JSON.stringify({ nome: document.getElementById('cliente-nome').value, tel: document.getElementById('cliente-telefone').value, uf: document.getElementById('cliente-estado').value, cidade: document.getElementById('cliente-cidade').value, metodo: document.getElementById('cliente-metodo-entrega').value, excursao: document.getElementById('cliente-excursao').value })); };
function carregarForm() { const s = JSON.parse(localStorage.getItem('maribella_form')); if(s && !clienteLogadoDados) { document.getElementById('cliente-nome').value=s.nome||''; document.getElementById('cliente-telefone').value=s.tel||''; document.getElementById('cliente-estado').value=s.uf||''; document.getElementById('cliente-cidade').value=s.cidade||''; document.getElementById('cliente-metodo-entrega').value=s.metodo||''; document.getElementById('cliente-excursao').value=s.excursao||''; window.mudarMetodoEntrega(); } }

window.finalizarCheckout = async (e) => {
    e.preventDefault(); 
    const sim = await window.confirmarAcao("Finalizar", "Enviar pedido de grade fechada agora?"); if(!sim) return;
    
    const btn = document.getElementById('btn-finalizar-checkout'); btn.disabled=true; btn.innerText="⏳...";
    const nome = document.getElementById('cliente-nome').value; const tel = document.getElementById('cliente-telefone').value; const cidade = document.getElementById('cliente-cidade').value; const estado = document.getElementById('cliente-estado').value; const metodo = document.getElementById('cliente-metodo-entrega').value; const excursao = document.getElementById('cliente-excursao').value; const total = document.getElementById('total-price').innerText;

    let envioInfo = metodo === 'Excursão' ? `Excursão: ${excursao}` : `Retirada na Loja`;

    try {
        let dadosC = { nome, telefone: tel, cidade, estado };
        let telLimpo = tel.replace(/\D/g, '');
        let idClienteStr = `${nome.trim().toLowerCase().replace(/\s+/g, '_')}_${telLimpo}`;
        
        let clientesSnap = await getDocs(collection(db, "clientes"));
        clientesSnap.forEach(d => {
            let c = d.data();
            if(c.telefone && c.telefone.replace(/\D/g, '') === telLimpo) {
                idClienteStr = d.id; 
            }
        });
        await setDoc(doc(db, "clientes", idClienteStr), dadosC, { merge: true });
        
        let strItens = carrinho.map(i=> `${i.qtd||1}x ${i.nome} (${i.tamanhoSelecionado})`).join(", "); const dataH = new Date();
        await addDoc(collection(db, "pedidos"), { cliente: nome, cidade: cidade, estado: estado, telefone: tel, envio: envioInfo, itens: strItens, detalhes_itens: carrinho, total, data: dataH.toLocaleDateString('pt-BR'), hora: dataH.toLocaleTimeString('pt-BR'), timestamp: dataH.toISOString(), status: "Pendente" });
        
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

    let msg = `Olá! Sou ${nome} e vim finalizar meu pedido (Atacado):\n\n🛍️ *PRODUTOS:*\n`; carrinho.forEach(i => msg += `- ${i.qtd||1}x ${i.nome} - ${i.tamanhoSelecionado} (R$ ${parseFloat(i.preco).toFixed(2)})\n`); msg += `\n💰 *TOTAL:* R$ ${total}\n📦 *ENTREGA:* ${envioInfo}\n📍 *CIDADE:* ${cidade} - ${estado}`;
    let linkZap = gerarLinkWhatsApp(configLoja.telefone, msg); window.open(linkZap, '_blank');
    
    carrinho = []; localStorage.removeItem('maribella_carrinho'); localStorage.removeItem('maribella_form'); window.toggleCart(); btn.disabled=false; btn.innerText="💾 Enviar Pedido"; window.carregarProdutosDoBanco();
    
    clienteLogadoDados = {nome: nome}; 
    localStorage.setItem('maribella_auth_cliente', JSON.stringify({nome})); 
    atualizarHeaderLogado(); 
    abrirPainelCliente(clienteLogadoDados);
};

function prepararCheckoutLogado() { if(clienteLogadoDados) { document.getElementById('cliente-nome').value = clienteLogadoDados.nome; } }

// --- LOGIN APENAS COM NOME ---
window.verificarLoginCliente = () => { 
    esconderCarrinhoFlutuante();
    if (clienteLogadoDados) {
        abrirPainelCliente(clienteLogadoDados);
    } else {
        const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); 
        if(logado) autoLogin(logado.nome, true); 
        else document.getElementById('cliente-login-modal').classList.remove('hidden'); 
    }
}
window.fecharLoginCliente = () => { document.getElementById('cliente-login-modal').classList.add('hidden'); mostrarCarrinhoFlutuante(); };
window.fecharPerfil = () => { 
    document.getElementById('perfil-cliente-modal').classList.add('hidden'); 
    localStorage.removeItem('maribella_tela_perfil_aberta');
    mostrarCarrinhoFlutuante();
};

async function autoLogin(nome, forcarAbertura = false) { 
    if(nome) { 
        clienteLogadoDados = {nome: nome}; atualizarHeaderLogado(); 
        if(forcarAbertura || localStorage.getItem('maribella_tela_perfil_aberta')) abrirPainelCliente(clienteLogadoDados); 
    } else { 
        localStorage.removeItem('maribella_auth_cliente'); document.getElementById('cliente-login-modal').classList.remove('hidden'); 
    } 
}

function atualizarHeaderLogado() { document.getElementById('btn-header-pedidos').innerText = clienteLogadoDados ? `👤 ${clienteLogadoDados.nome.split(' ')[0]}` : `👤 Perfil`; }

window.realizarLoginCliente = async (e) => { 
    e.preventDefault(); 
    const nome = document.getElementById('login-nome-cliente').value.trim(); 
    if(!nome) return;
    
    clienteLogadoDados = {nome: nome}; 
    localStorage.setItem('maribella_auth_cliente', JSON.stringify({nome})); 
    atualizarHeaderLogado(); 
    document.getElementById('cliente-login-modal').classList.add('hidden'); 
    abrirPainelCliente(clienteLogadoDados); 
    e.target.reset(); 
};

window.mudarAbaCliente = (idAba) => { document.getElementById('aba-historico').classList.add('hidden'); document.getElementById('btn-aba-historico').classList.remove('ativa'); document.getElementById('btn-aba-historico').style.color='#aaa'; document.getElementById(idAba).classList.remove('hidden'); document.getElementById('btn-'+idAba).classList.add('ativa'); document.getElementById('btn-'+idAba).style.color='var(--primary)'; }

async function abrirPainelCliente(dados) { 
    esconderCarrinhoFlutuante();
    localStorage.setItem('maribella_tela_perfil_aberta', 'true'); 
    document.getElementById('perfil-cliente-modal').classList.remove('hidden'); document.getElementById('titulo-painel-cliente').innerText = `👤 Oi, ${dados.nome.split(' ')[0]}`; window.carregarMeusPedidosPainel(dados.nome); 
}

window.carregarMeusPedidosPainel = async (nome) => { const lista = document.getElementById('lista-meus-pedidos'); lista.innerHTML = "⏳ Carregando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); meusPedidosSalvos = []; lista.innerHTML = ""; let tem = false; snap.forEach(d => { let p = d.data(); p.id = d.id; if(p.cliente && p.cliente.toLowerCase() === nome.toLowerCase()) { tem = true; meusPedidosSalvos.push(p); let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; let botoesAcao = p.status === 'Pendente' ? `<div style="display:flex; gap:10px; margin-top:10px;"><button onclick="window.abrirEdicaoPedido('${p.id}')" style="background:var(--secondary); color:white; border:none; padding:5px 10px; border-radius:5px;">✏️ Editar Pedido</button> <button onclick="window.cancelarMeuPedido('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px;">🗑️ Cancelar</button></div>` : ''; lista.innerHTML += `<div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border-left: 5px solid ${cor};"><strong style="font-size:1.1rem;">📅 ${p.data} às ${p.hora}</strong><br><div style="margin:5px 0; color:#555; font-size:0.9rem;"><strong>Itens:</strong> ${p.itens}</div><strong style="color:var(--primary); font-size:1.1rem;">💰 R$ ${p.total}</strong><br><span style="font-size:0.9rem; font-weight:bold; color:${cor};">● Status: ${p.status}</span>${botoesAcao}</div>`; } }); if(!tem) lista.innerHTML = "<p>Nenhuma compra.</p>"; }

window.cancelarMeuPedido = async (id) => { const sim = await window.confirmarAcao("Cancelar Pedido", "Tem certeza que não deseja mais essas grades?"); if(sim) { await updateDoc(doc(db, "pedidos", id), { status: "Cancelado" }); window.carregarMeusPedidosPainel(clienteLogadoDados.nome); } };
window.abrirEdicaoPedido = (id) => { pedidoEmEdicao = JSON.parse(JSON.stringify(meusPedidosSalvos.find(p => p.id === id))); pedidoEmEdicao.detalhes_itens.forEach(i => i.qtd = i.qtd || 1); renderizarEdicaoPedido(); document.getElementById('modal-editar-pedido').classList.remove('hidden'); };
window.fecharEdicaoPedido = () => document.getElementById('modal-editar-pedido').classList.add('hidden');
function renderizarEdicaoPedido() { const lista = document.getElementById('lista-editar-itens'); lista.innerHTML = ""; let total = 0; if(pedidoEmEdicao.detalhes_itens.length === 0) lista.innerHTML = "<p style='color:red;'>O pedido será cancelado ao salvar.</p>"; pedidoEmEdicao.detalhes_itens.forEach((item, index) => { total += parseFloat(item.preco) * item.qtd; lista.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;"><div style="flex:1;"><strong>${item.nome}</strong><br><span style="color:#888;">R$ ${parseFloat(item.preco).toFixed(2)}</span></div><div style="display:flex; align-items:center; gap:8px;"><button onclick="window.alterarQtdEdicao(${index}, -1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px; font-weight:bold;">-</button><span>${item.qtd}</span><button onclick="window.alterarQtdEdicao(${index}, 1)" style="border:none; background:#eee; padding:5px 10px; border-radius:5px; font-weight:bold;">+</button></div></div>`; }); document.getElementById('novo-total-edicao').innerText = total.toFixed(2); }
window.alterarQtdEdicao = (index, delta) => { pedidoEmEdicao.detalhes_itens[index].qtd += delta; if(pedidoEmEdicao.detalhes_itens[index].qtd <= 0) pedidoEmEdicao.detalhes_itens.splice(index, 1); renderizarEdicaoPedido(); };
window.salvarEdicaoPedido = async () => { if(pedidoEmEdicao.detalhes_itens.length === 0) { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { status: "Cancelado" }); window.fecharEdicaoPedido(); return window.carregarMeusPedidosPainel(clienteLogadoDados.nome); } let total = 0; pedidoEmEdicao.detalhes_itens.forEach(i => total += parseFloat(i.preco) * i.qtd); let strItens = pedidoEmEdicao.detalhes_itens.map(i => `${i.qtd}x ${i.nome}`).join(", "); try { await updateDoc(doc(db, "pedidos", pedidoEmEdicao.id), { detalhes_itens: pedidoEmEdicao.detalhes_itens, itens: strItens, total: total.toFixed(2) }); window.mostrarNotificacao("Atualizado!", "sucesso"); window.fecharEdicaoPedido(); window.carregarMeusPedidosPainel(clienteLogadoDados.nome); } catch(e) {} };
window.sairCliente = async () => { const sim = await window.confirmarAcao("Sair", "Deseja sair da conta?"); if(sim){ localStorage.removeItem('maribella_auth_cliente'); clienteLogadoDados = null; atualizarHeaderLogado(); window.fecharPerfil(); window.mostrarNotificacao("Sessão encerrada.", "info"); } };

// --- ADMINISTRAÇÃO E CONTROLE ---
window.abrirLoginAdmin = () => { window.fecharMenuLateral(); document.getElementById('admin-login-modal').classList.remove('hidden'); esconderCarrinhoFlutuante(); }
window.fecharLoginAdmin = () => { document.getElementById('admin-login-modal').classList.add('hidden'); mostrarCarrinhoFlutuante(); }
window.realizarLoginAdmin = async (e) => { 
    e.preventDefault(); 
    try { 
        await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-senha').value); 
        localStorage.setItem('maribella_admin_auth', 'true');
        window.mostrarNotificacao("Liberado!", "sucesso"); 
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden'); 
        esconderCarrinhoFlutuante();
        carregarListaAdminPedidos(); 
        e.target.reset(); 
    } catch(e) { window.mostrarNotificacao("Erro!", "erro"); } 
};
window.sairDoAdmin = async () => { 
    await signOut(auth); 
    localStorage.removeItem('maribella_admin_auth');
    localStorage.removeItem('maribella_admin_tab');
    document.getElementById('admin-dashboard').classList.add('hidden'); 
    window.carregarProdutosDoBanco(); 
    mostrarCarrinhoFlutuante();
};

window.mudarAbaAdmin = (abaId) => { 
    localStorage.setItem('maribella_admin_tab', abaId);
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
    let res = todosPedidosAdmin.filter(p => { let matchTermo = removerAcentos(p.cliente).includes(termo) || (p.cidade && removerAcentos(p.cidade).includes(termo)); let matchStatus = filtro === 'Todos' || p.status === filtro; return matchTermo && matchStatus; });
    if(res.length === 0) lista.innerHTML = "<p>Nenhum pedido.</p>";
    res.forEach(p => { 
        let corText = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12';
        let selectStatus = `<div style="display:inline-flex; align-items:center; gap:5px; background:#f0f0f0; padding:5px; border-radius:5px; margin-right: 5px;">
            <span>✏️</span>
            <select onchange="window.mudarStatusPedido('${p.id}', this.value)" style="border:none; background:transparent; outline:none; font-weight:bold; color:${corText}; cursor:pointer;">
                <option value="Pendente" style="color:#f39c12;" ${p.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                <option value="Aprovado" style="color:var(--success);" ${p.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                <option value="Cancelado" style="color:#e74c3c;" ${p.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
        </div>`;
        let btnEtiqueta = p.status === 'Aprovado' ? `<button onclick="window.imprimirEtiqueta('${p.id}')" style="background:var(--secondary); color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🖨️ Etiqueta</button>` : '';
        let btnExcluir = `<button onclick="window.excluirPedidoAdmin('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🗑️ Excluir</button>`;
        
        lista.innerHTML += `<div class="admin-card"><strong style="color:var(--primary);">Data: ${p.data} às ${p.hora}</strong><br><strong>Cliente:</strong> ${p.cliente}<br><strong>Local:</strong> ${p.cidade||'Não info'} - ${p.estado||''}<br><strong>Entrega:</strong> ${p.envio||'Não informado'}<br><strong>Total:</strong> R$ ${p.total} <br><span style="font-size:0.85rem;color:#666;">(${p.itens})</span><br><br><span style="font-weight:bold; color:${corText};">Status Atual: ${p.status}</span><div style="display:flex; gap:5px; margin-top:10px; flex-wrap:wrap; align-items:center;">${selectStatus}${btnEtiqueta}${btnExcluir}</div></div>`; 
    });
}
window.mudarStatusPedido = async (id, novoStatus) => { const sim = await window.confirmarAcao("Mudar Status", `Alterar o pedido para ${novoStatus}?`); if (sim) { await updateDoc(doc(db, "pedidos", id), { status: novoStatus }); carregarListaAdminPedidos(); } else { carregarListaAdminPedidos(); } };

window.excluirPedidoAdmin = async (id) => { 
    const sim = await window.confirmarAcao("Apagar Registro", "Deseja APAGAR este pedido? (Pedidos de até 5 dias terão o estoque devolvido)"); 
    if(sim) { 
        const pedido = todosPedidosAdmin.find(p => p.id === id);
        if(pedido) {
            const dataPedido = new Date(pedido.timestamp);
            const hoje = new Date();
            const diffDays = Math.ceil(Math.abs(hoje - dataPedido) / (1000 * 60 * 60 * 24));
            
            if(diffDays <= 5 && pedido.detalhes_itens) {
                for(let item of pedido.detalhes_itens) {
                    let pDoc = await getDoc(doc(db, "produtos", item.id));
                    if(pDoc.exists()) {
                        let pd = pDoc.data();
                        if(pd.variacoes && pd.variacoes[item.idxVariacao]) {
                            pd.variacoes[item.idxVariacao].qtd += item.qtd; 
                            await updateDoc(doc(db, "produtos", item.id), { variacoes: pd.variacoes });
                        }
                    }
                }
                window.mostrarNotificacao("Estoque devolvido (Pedido dentro de 5 dias).", "info");
            }
        }
        await deleteDoc(doc(db, "pedidos", id)); 
        carregarListaAdminPedidos(); 
        window.carregarProdutosDoBanco();
    } 
};

window.imprimirEtiqueta = (id) => { const pedido = todosPedidosAdmin.find(p => p.id === id); if(!pedido) return; const janela = window.open('', '_blank', 'width=600,height=600'); janela.document.write(`<html><head><title>Etiqueta - ${pedido.cliente}</title><style>body { font-family: sans-serif; padding: 20px; } .etiqueta { border: 2px dashed #333; padding: 20px; max-width: 400px; margin: auto; border-radius: 10px; } .remetente { font-size: 0.9rem; color: #555; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 15px; } .destinatario { font-size: 1.1rem; line-height: 1.5; } @media print { .btn-print { display: none; } }</style></head><body><div style="text-align:center; margin-bottom: 20px;"><button class="btn-print" onclick="window.print()" style="padding: 10px 20px; font-size: 1rem; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">🖨️ Imprimir Etiqueta</button></div><div class="etiqueta"><div class="remetente"><strong>REMETENTE:</strong><br>Maribella Kids<br>${configLoja.endereco ? configLoja.endereco.replace(/\n/g, '<br>') : 'Seu Endereço Aqui'}<br>Cel: ${configLoja.telefone || ''}</div><div class="destinatario"><strong>DESTINATÁRIO:</strong><br>${pedido.cliente}<br><strong>Endereço:</strong> ${pedido.cidade || 'Não informado'} - ${pedido.estado || ''}<br><strong>Entrega:</strong> ${pedido.envio || 'Não informado'}<br><strong>Tel:</strong> ${pedido.telefone}</div></div></body></html>`); janela.document.close(); };

// --- RELATÓRIOS INTELIGENTES (APENAS APROVADOS) ---
window.gerarRelatoriosAdmin = () => {
    let mesFiltro = document.getElementById('filtro-mes-rel') ? document.getElementById('filtro-mes-rel').value : 'Todos';
    let anoFiltro = document.getElementById('filtro-ano-rel') ? document.getElementById('filtro-ano-rel').value : 'Todos';

    let prodsVenda = {}; let clientesTop = {}; let faturamento = 0; let totalVendas = 0;
    let vendasPorData = {}; 

    todosPedidosAdmin.forEach(p => {
        // CORREÇÃO: Pega SOMENTE os status Aprovados
        if(p.status === 'Aprovado') {
            let mesPedido, anoPedido, dataAgrupamento;
            if(p.timestamp) {
                anoPedido = p.timestamp.substring(0,4);
                mesPedido = p.timestamp.substring(5,7);
                dataAgrupamento = `${p.timestamp.substring(8,10)}/${mesPedido}/${anoPedido}`;
            } else {
                let partes = p.data.split('/');
                mesPedido = partes[1]; anoPedido = partes[2];
                dataAgrupamento = p.data;
            }

            if (mesFiltro !== 'Todos' && mesPedido !== mesFiltro) return;
            if (anoFiltro !== 'Todos' && anoPedido !== anoFiltro) return;

            let valorTotal = parseFloat(p.total || 0);
            faturamento += valorTotal;
            totalVendas++;
            
            vendasPorData[dataAgrupamento] = (vendasPorData[dataAgrupamento] || 0) + valorTotal;

            clientesTop[p.cliente] = clientesTop[p.cliente] || {nome: p.cliente, gasto: 0, compras: 0};
            clientesTop[p.cliente].gasto += valorTotal;
            clientesTop[p.cliente].compras += 1;
            
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
    rankProds.forEach((p, idx) => html += `<li style="margin-bottom:5px;"><strong>${idx+1}º</strong> ${p.nome} - <span style="color:var(--primary); font-weight:bold;">${p.qtd} grades.</span></li>`);
    html += `</ul>`;

    let rankClientes = Object.values(clientesTop).sort((a,b) => b.gasto - a.gasto).slice(0, 10);
    html += `<h4>👑 Top 10 Clientes</h4><ul style="padding-left:20px; background:white; padding:15px; border-radius:8px; border:1px solid #ddd;">`;
    if(rankClientes.length === 0) html += `<li>Nenhum dado no período.</li>`;
    rankClientes.forEach((c, idx) => html += `<li style="margin-bottom:5px;"><strong>${idx+1}º</strong> ${c.nome} - <span style="color:var(--success); font-weight:bold;">R$ ${c.gasto.toFixed(2)}</span> (${c.compras} compras)</li>`);
    html += `</ul>`;

    document.getElementById('conteudo-relatorios').innerHTML = html;

    if(window.Chart) {
        let ctx = document.getElementById('graficoVendas').getContext('2d');
        if(graficoVendasApp) graficoVendasApp.destroy();
        
        let labelsOrdem = Object.keys(vendasPorData).sort((a,b) => {
            let [d1,m1,y1] = a.split('/'); let [d2,m2,y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });
        
        graficoVendasApp = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsOrdem,
                datasets: [{
                    label: 'Faturamento R$',
                    data: labelsOrdem.map(l => vendasPorData[l]),
                    borderColor: '#ffb6c1',
                    backgroundColor: 'rgba(255, 182, 193, 0.4)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
};

window.adicionarVariacaoAdmin = (qtd=0) => { variacoesAdminTemp.push({tamanho: 'Grade', qtd}); renderizarVariacoesAdmin(); };
window.atualizarVariacaoAdmin = (idx, campo, valor) => { variacoesAdminTemp[idx][campo] = valor; renderizarVariacoesAdmin(); };
window.removerVariacaoAdmin = (idx) => { variacoesAdminTemp.splice(idx, 1); renderizarVariacoesAdmin(); };
function renderizarVariacoesAdmin() {
    const div = document.getElementById('lista-variacoes-admin'); let total = 0;
    div.innerHTML = variacoesAdminTemp.map((v, i) => {
        total += parseInt(v.qtd||0);
        return `<div style="display:flex; gap:5px; align-items:center;">
            <span style="flex:1; font-weight:bold; color:#555;">Quantidade em Estoque:</span>
            <input type="number" placeholder="Qtd Grades" value="${v.qtd}" onchange="window.atualizarVariacaoAdmin(${i}, 'qtd', parseInt(this.value)||0)" style="width:120px; padding:10px; border:1px solid #ccc; border-radius:5px;">
            <button type="button" onclick="window.removerVariacaoAdmin(${i})" style="background:#e74c3c; color:white; border:none; padding:10px 12px; border-radius:5px;">X</button>
        </div>`;
    }).join('');
    document.getElementById('total-pecas-admin').innerText = total;
}

window.salvarProdutoAdmin = async (e) => { 
    e.preventDefault(); 
    if(variacoesAdminTemp.length === 0) return window.mostrarNotificacao("Adicione pelo menos a quantidade do Estoque!", "erro");
    let variacoesLimpas = variacoesAdminTemp.map(v => ({ nome: `Grade Fechada (10 un)`, tamanho: 'Grade', cor: '', qtd: v.qtd }));

    const sim = await window.confirmarAcao("Salvar Grade", "Salvar no sistema?"); if(!sim) return;
    const btn = document.getElementById('btn-salvar-produto'); const imgs = document.getElementById('add-imagem-file').files; const id = document.getElementById('edit-produto-id').value; 
    btn.innerText = "⏳ Enviando Imagens..."; btn.disabled = true; 
    
    try { 
        let urlsFotos = [];
        if (imgs && imgs.length > 0) {
            let uploadPromises = Array.from(imgs).slice(0, 4).map(async (img) => {
                const sRef = ref(storage, 'produtos/' + Date.now() + '_' + img.name); 
                await uploadBytes(sRef, img); 
                return await getDownloadURL(sRef);
            });
            urlsFotos = await Promise.all(uploadPromises);
        } 

        const pData = { nome: document.getElementById('add-nome').value, preco: parseFloat(document.getElementById('add-preco').value), variacoes: variacoesLimpas, categoria: document.getElementById('add-categoria').value, lancamento: document.getElementById('add-lancamento').checked, material: document.getElementById('add-material').value }; 
        if(urlsFotos.length > 0) { pData.imagens = urlsFotos; pData.imagem = urlsFotos[0]; } 
        
        btn.innerText = "⏳ Salvando dados...";
        if (id) { await updateDoc(doc(db, "produtos", id), pData); } else { if(!pData.imagem) { btn.disabled = false; btn.innerText = "💾 Salvar Produto"; return window.mostrarNotificacao("Foto obrigatória!","erro"); } await addDoc(collection(db, "produtos"), pData); } 
        window.limparFormProduto(); carregarListaAdminProdutosEditar(); window.mostrarNotificacao("Sucesso!","sucesso"); 
    } catch(e) {} 
    btn.innerText = "💾 Salvar Produto"; btn.disabled = false; 
};

window.limparFormProduto = () => { document.getElementById('form-add-produto').reset(); document.getElementById('edit-produto-id').value=''; variacoesAdminTemp=[]; renderizarVariacoesAdmin(); };

async function carregarListaAdminProdutosEditar() { const lista = document.getElementById('lista-admin-produtos-cadastrados'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "produtos")); todosProdutosAdmin = []; snap.forEach(d => { let p = d.data(); p.id = d.id; if(!p.variacoes) p.variacoes = [{nome: 'Grade', qtd: p.estoque || 0}]; todosProdutosAdmin.push(p); }); window.filtrarProdutosAdmin(); }

window.filtrarProdutosAdmin = () => { 
    const inputBusca = document.getElementById('busca-produto-admin');
    const inputFiltro = document.getElementById('admin-filtro-cat');
    const counterTotal = document.getElementById('admin-total-prods-count');
    const lista = document.getElementById('lista-admin-produtos-cadastrados'); 
    
    if (!lista) return; 
    lista.innerHTML = ""; 
    
    const termo = inputBusca ? removerAcentos(inputBusca.value) : ""; 
    const cat = inputFiltro ? inputFiltro.value : 'Todos';
    
    let res = todosProdutosAdmin.filter(p => {
        let matchCat = cat === 'Todos' || p.categoria === cat || (p.categoria === 'Short/Calça/Saia' && cat === 'Short/Saia');
        let matchTermo = removerAcentos(p.nome).includes(termo);
        return matchCat && matchTermo;
    }); 
    
    if(counterTotal) counterTotal.innerText = res.length;
    
    if(res.length === 0) { lista.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>"; return; } 
    res.forEach(p => { 
        let estoqueTotal = p.variacoes.reduce((s,v)=> s + parseInt(v.qtd||0), 0);
        let ft = p.imagens && p.imagens.length > 0 ? p.imagens[0] : (p.imagem || '');
        lista.innerHTML += `<div class="admin-card" style="display:flex; align-items:center; gap:15px; padding:10px;"><img src="${ft}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;"><div style="flex:1;"><strong>${p.nome}</strong><br>Total Grades: ${estoqueTotal} | R$ ${parseFloat(p.preco).toFixed(2)}</div><div style="display:flex; gap:5px;"><button onclick="window.editarProdutoAdmin('${p.id}')" class="btn-action-adm btn-edit">✏️</button> <button onclick="window.excluirProdutoAdmin('${p.id}')" class="btn-action-adm btn-delete">🗑️</button></div></div>`; 
    }); 
}

window.editarProdutoAdmin = (id) => { 
    let p = todosProdutosAdmin.find(x => x.id === id); if(!p) return;
    document.getElementById('edit-produto-id').value=p.id; document.getElementById('add-nome').value=p.nome; document.getElementById('add-preco').value=p.preco; document.getElementById('add-categoria').value=p.categoria||'Vestido'; document.getElementById('add-lancamento').checked=p.lancamento===true; document.getElementById('add-material').value=p.material; 
    
    variacoesAdminTemp = p.variacoes.map(v => {
        return { tamanho: 'Grade', cor: '', qtd: v.qtd };
    });
    renderizarVariacoesAdmin();
    document.querySelector('.admin-content').scrollTo(0,0); 
};
window.excluirProdutoAdmin = async (id) => { const sim = await window.confirmarAcao("Apagar", "🗑️ Deseja apagar essa peça do estoque?"); if(sim) { await deleteDoc(doc(db, "produtos", id)); window.mostrarNotificacao("Peça apagada!", "info"); carregarListaAdminProdutosEditar(); window.carregarProdutosDoBanco(); } };

window.imprimirBalancoEstoque = () => {
    const janela = window.open('', '_blank'); let linhasHtml = ''; let totalPecasGeral = 0; let produtosOrdem = [...todosProdutosAdmin].sort((a,b) => a.nome.localeCompare(b.nome));
    produtosOrdem.forEach(p => { let totalProd = p.variacoes.reduce((s,v) => s + parseInt(v.qtd||0), 0); totalPecasGeral += totalProd; let strVars = p.variacoes.map(v => `Grade Fechada: ${v.qtd} disp.`).join('<br>'); linhasHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${p.nome}</td><td style="padding: 8px; border: 1px solid #ddd;">${p.categoria}</td><td style="padding: 8px; border: 1px solid #ddd;">${strVars}</td><td style="padding: 8px; border: 1px solid #ddd; text-align:center; font-weight:bold;">${totalProd}</td></tr>`; });
    janela.document.write(`<html><head><title>Balanço de Estoque - Maribella Kids</title><style>body { font-family: sans-serif; padding: 20px; color: #333; } table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; } th { background-color: #ffb6c1; color: #333; padding: 10px; border: 1px solid #ddd; text-align: left; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; } @media print { .btn-print { display: none; } }</style></head><body><div class="header"><h2>Balanço de Estoque (Grades) - Maribella Kids</h2><div><button class="btn-print" onclick="window.print()" style="padding: 10px 20px; font-size: 1rem; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">🖨️ Imprimir / Salvar PDF</button></div></div><p><strong>Data da geração:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p><p><strong>Total Geral de Grades:</strong> ${totalPecasGeral} grades</p><table><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th style="text-align:center;">Total Grades do Produto</th></tr></thead><tbody>${linhasHtml}</tbody></table></body></html>`);
    janela.document.close();
};

async function carregarListaAdminClientes() { const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = "⏳..."; const snap = await getDocs(collection(db, "clientes")); todosClientesAdmin = []; snap.forEach(d => { let c = d.data(); c.id = d.id; todosClientesAdmin.push(c); }); window.filtrarClientesAdmin(); }
window.filtrarClientesAdmin = () => { 
    const termo = removerAcentos(document.getElementById('busca-cliente-admin').value); const lista = document.getElementById('lista-admin-clientes'); lista.innerHTML = ""; 
    let res = todosClientesAdmin.filter(c => removerAcentos(c.nome).includes(termo) || c.telefone.includes(termo)); 
    if(res.length === 0) lista.innerHTML = "<p>Nenhum cliente.</p>"; 
    res.forEach(c => { 
        let linkZap = gerarLinkWhatsApp(c.telefone, "Olá, aqui é da Maribella Kids!"); 
        lista.innerHTML += `<div class="admin-card" style="border-left-color: #2ecc71; display:flex; justify-content:space-between; align-items:center;"><div><strong>${c.nome}</strong><br><span style="font-size:0.85rem; color:#666;">📍 ${c.cidade||''}, ${c.estado||''}</span><br><span>${c.telefone}</span></div><div style="display:flex; gap:10px;"><button onclick="window.verHistoricoClienteAdmin('${c.nome}')" style="background:var(--secondary); color:white; border:none; padding:8px 10px; border-radius:8px; font-weight:bold; cursor:pointer;">🛍️ Histórico</button><a href="${linkZap}" target="_blank" style="background:#25D366; color:white; padding:8px 10px; border-radius:8px; text-decoration:none;">💬</a> <button onclick="window.excluirClienteAdmin('${c.id}')" style="background:#e74c3c; color:white; border:none; padding:8px 10px; border-radius:8px; font-weight:bold; cursor:pointer;">🗑️</button></div></div>`; 
    }); 
}
window.excluirClienteAdmin = async (id) => { const sim = await window.confirmarAcao("Excluir Cliente", "Deseja realmente apagar o cadastro deste cliente?"); if (sim) { await deleteDoc(doc(db, "clientes", id)); window.mostrarNotificacao("Cliente apagado!", "info"); carregarListaAdminClientes(); } };
window.fecharHistoricoClienteAdmin = () => document.getElementById('admin-historico-cliente-modal').classList.add('hidden');
window.verHistoricoClienteAdmin = async (nome) => { document.getElementById('admin-historico-cliente-modal').classList.remove('hidden'); document.getElementById('nome-historico-admin').innerText = `🛍️ Histórico: ${nome.split(' ')[0]}`; const lista = document.getElementById('lista-historico-cliente-admin'); lista.innerHTML = "⏳ Buscando..."; const snap = await getDocs(query(collection(db, "pedidos"), orderBy("timestamp", "desc"))); lista.innerHTML = ""; let tem = false; snap.forEach(d => { const p = d.data(); if(p.cliente.toLowerCase() === nome.toLowerCase()) { tem = true; let cor = p.status === 'Aprovado' ? 'var(--success)' : p.status === 'Cancelado' ? '#e74c3c' : '#f39c12'; lista.innerHTML += `<div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:10px; border-left: 4px solid ${cor};"><strong>Data: ${p.data}</strong><br><span style="font-size:0.85rem;">Itens: ${p.itens}</span><br><strong>R$ ${p.total}</strong> - <span style="font-weight:bold; color:${cor};">${p.status}</span></div>`; } }); if(!tem) lista.innerHTML = "<p>Sem compras.</p>"; };

// --- LÓGICA DO INSTALADOR DO APP FORÇADO E PERSISTENTE ---
let deferredPrompt;

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
    if (!isStandalone) {
        document.getElementById('install-app-banner').classList.remove('hidden');
    }
});

setTimeout(() => {
    if (!isStandalone && !document.getElementById('install-app-banner').classList.contains('hidden') === false) {
        document.getElementById('install-app-banner').classList.remove('hidden');
    }
}, 3000);

window.fecharBannerInstalacao = () => {
    document.getElementById('install-app-banner').classList.add('hidden');
};

document.getElementById('btn-instalar-app').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            window.fecharBannerInstalacao();
        }
        deferredPrompt = null;
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            window.confirmarAcao("Instalar no iPhone 🍏", "1. Toque no ícone de [Compartilhar] (o quadrado com a seta pra cima) no menu inferior.\n\n2. Role para baixo e toque em 'Adicionar à Tela de Início'.\n\nPronto! Vai virar um App! 🎀");
        } else {
            window.confirmarAcao("Instalar o App 📱", "Para instalar:\n\n1. Clique nos 3 pontinhos (⋮) no navegador.\n2. Clique em 'Instalar Aplicativo'.\n\n🎀");
        }
        window.fecharBannerInstalacao();
    }
});

window.addEventListener('appinstalled', () => {
    window.fecharBannerInstalacao();
    window.mostrarNotificacao("App instalado com sucesso! 🎀", "sucesso");
});

// Inicialização de Dados Básicos
const logado = JSON.parse(localStorage.getItem('maribella_auth_cliente')); if(logado) autoLogin(logado.nome);
carregarConfiguracoes(); carregarForm(); atualizarCarrinho(); window.carregarProdutosDoBanco();

gerarAvaliacoes(); 
renderizarReviewSidebar(); 
setInterval(renderizarReviewSidebar, 30000);

// --- VERIFICAÇÃO ADMIN LOGADO AO ATUALIZAR (Persistência) ---
const adminLogado = localStorage.getItem('maribella_admin_auth');
if(adminLogado === 'true') {
    document.getElementById('admin-dashboard').classList.remove('hidden');
    esconderCarrinhoFlutuante();
    const ultimaAba = localStorage.getItem('maribella_admin_tab') || 'admin-pedidos';
    window.mudarAbaAdmin(ultimaAba);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('✅ Service Worker ativado com sucesso!', reg.scope))
            .catch(err => console.error('❌ Falha ao ativar o Service Worker:', err));
    });
}
