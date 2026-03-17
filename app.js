// Importações obrigatórias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- CONFIGURAÇÃO REAL DO FIREBASE DA MARIBELLA KIDS ---
const firebaseConfig = {
  apiKey: "AIzaSyBSSDixkWzEaP3pbncJ5NhTf_0ZDNgzUtA",
  authDomain: "maribella-kids.firebaseapp.com",
  databaseURL: "https://maribella-kids-default-rtdb.firebaseio.com",
  projectId: "maribella-kids",
  storageBucket: "maribella-kids.firebasestorage.app",
  messagingSenderId: "874601019258",
  appId: "1:874601019258:web:ec1a308aa526de5a1088c3"
};

// Inicializando o Banco de Dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrinho = [];

// Funções amarradas ao 'window' para o HTML conseguir enxergar
window.adicionarAoCarrinho = function(id) {
    const produto = produtos.find(p => p.id === id);
    carrinho.push(produto);
    atualizarCarrinho();
    alert(`${produto.nome} adicionado ao carrinho!`);
};

window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
};

window.toggleCart = () => document.getElementById('cart-modal').classList.toggle('hidden');
window.togglePerfil = () => { document.getElementById('perfil-modal').classList.toggle('hidden'); carregarPerfil(); };
window.fecharAdmin = () => document.getElementById('admin-modal').classList.add('hidden');
window.copiarPix = () => {
    // COLOQUE SUA CHAVE PIX REAL AQUI
    navigator.clipboard.writeText("81999999999").then(() => alert("Chave PIX copiada!"));
};

window.mostrarAba = function(aba) {
    document.getElementById('conteudo-pedidos').classList.add('hidden');
    document.getElementById('conteudo-enderecos').classList.add('hidden');
    document.getElementById('tab-pedidos').classList.remove('ativa');
    document.getElementById('tab-enderecos').classList.remove('ativa');
    document.getElementById(`conteudo-${aba}`).classList.remove('hidden');
    document.getElementById(`tab-${aba}`).classList.add('ativa');
};

function renderizarProdutos() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p><strong>Tamanho:</strong> ${produto.tamanho}</p>
            <p><strong>Material:</strong> ${produto.material}</p>
            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            <button class="btn-add" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
        `;
        grid.appendChild(div);
    });
}

function atualizarCarrinho() {
    document.getElementById('cart-count').innerText = carrinho.length;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, index) => {
        total += item.preco;
        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2)} <button onclick="removerDoCarrinho(${index})" style="color:red; background:none; border:none; cursor:pointer;">X</button></span>
            </div>
        `;
    });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

// Lógica de Fechar Pedido (Salva no Firebase e no Celular da Cliente)
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");

    const nome = document.getElementById('cliente-nome').value;
    const endereco = document.getElementById('cliente-endereco').value;
    const obs = document.getElementById('cliente-obs').value;
    const total = document.getElementById('total-price').innerText;
    
    // Data exata para o Firebase conseguir ordenar
    const dataIso = new Date().toISOString(); 
    const dataFormatada = new Date().toLocaleDateString('pt-BR');

    // 1. Salvar perfil no celular da cliente
    salvarNoCelularDaCliente(nome, endereco, carrinho, total, dataFormatada);

    // 2. SALVAR NO FIREBASE (Para a Maribella Kids ver no Admin)
    try {
        await addDoc(collection(db, "pedidos"), {
            nome: nome,
            endereco: endereco,
            observacao: obs,
            itens: carrinho.length,
            total: total,
            data: dataFormatada,
            timestamp: dataIso 
        });
        console.log("Pedido salvo com sucesso no Firebase!");
    } catch (erro) {
        console.error("Erro ao salvar no banco de dados: ", erro);
        alert("Houve um pequeno erro ao registrar no sistema, mas seu pedido será enviado para o WhatsApp!");
    }

    // 3. Montar mensagem do WhatsApp
    let mensagem = `Olá! Meu nome é ${nome} e gostaria de finalizar meu pedido da Maribella Kids:\n\n🛍️ *MEUS PRODUTOS:*\n`;
    carrinho.forEach(item => mensagem += `- ${item.nome} (R$ ${item.preco.toFixed(2)})\n`);
    mensagem += `\n💰 *TOTAL:* R$ ${total}\n\n📦 *DADOS DE ENVIO:*\n${endereco}\n`;
    if (obs) mensagem += `📌 *OBS:* ${obs}\n\n`;
    mensagem += `O pagamento foi feito via PIX e estou enviando o comprovante!`;

    // COLOQUE O SEU NÚMERO DE WHATSAPP REAL AQUI (DDD + NÚMERO, ex: 5581999999999)
    const telefoneVendedora = "5581999999999";
    window.open(`https://wa.me/${telefoneVendedora}?text=${encodeURIComponent(mensagem)}`, '_blank');
    
    carrinho = [];
    atualizarCarrinho();
    window.toggleCart();
    this.reset();
});

function salvarNoCelularDaCliente(nome, endereco, itens, total, data) {
    let historico = JSON.parse(localStorage.getItem('maribella_pedidos')) || [];
    let enderecos = JSON.parse(localStorage.getItem('maribella_enderecos')) || [];
    historico.push({ nome, data, total, itens: itens.length });
    localStorage.setItem('maribella_pedidos', JSON.stringify(historico));
    if(!enderecos.includes(endereco)) {
        enderecos.push(endereco);
        localStorage.setItem('maribella_enderecos', JSON.stringify(enderecos));
    }
}

function carregarPerfil() {
    const listaPedidos = document.getElementById('lista-meus-pedidos');
    const listaEnderecos = document.getElementById('lista-meus-enderecos');
    let historico = JSON.parse(localStorage.getItem('maribella_pedidos')) || [];
    let enderecos = JSON.parse(localStorage.getItem('maribella_enderecos')) || [];

    listaPedidos.innerHTML = historico.length === 0 ? "<p>Nenhum pedido recente.</p>" : "";
    historico.reverse().forEach(p => {
        listaPedidos.innerHTML += `<div class="pedido-item"><strong>${p.data}</strong> <span>${p.itens} item(s) - R$ ${p.total}</span></div>`;
    });

    listaEnderecos.innerHTML = enderecos.length === 0 ? "<p>Nenhum endereço salvo.</p>" : "";
    enderecos.forEach(end => {
        listaEnderecos.innerHTML += `<div class="endereco-item">${end}</div>`;
    });
}

// --- ÁREA DO ADMINISTRADOR (Puxando do Firebase) ---
window.abrirAdmin = function() {
    const senhaAdmin = "1234"; // SUA SENHA DO ADMIN AQUI
    const tentativa = prompt("Digite a senha do administrador:");
    if(tentativa === senhaAdmin) {
        document.getElementById('admin-modal').classList.remove('hidden');
        carregarAdminFirebase();
    } else if (tentativa !== null) {
        alert("Senha Incorreta!");
    }
};

async function carregarAdminFirebase() {
    const lista = document.getElementById('lista-admin-pedidos');
    lista.innerHTML = "<p>⏳ Carregando pedidos da nuvem...</p>";
    
    try {
        const q = query(collection(db, "pedidos"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            lista.innerHTML = "<p>Nenhum pedido registrado no banco de dados.</p>";
            return;
        }

        lista.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            lista.innerHTML += `
            <div class="pedido-item" style="flex-direction:column; gap:5px; margin-bottom:10px; border:1px solid #ffb6c1; padding:10px; border-radius: 8px;">
                <strong>Data: ${p.data} | Cliente: ${p.nome}</strong>
                <span>Total: R$ ${p.total} (${p.itens} peças)</span>
                <span style="font-size: 0.85em; color: #666;">📍 Endereço: ${p.endereco}</span>
                <span style="font-size: 0.85em; color: #888;">📌 Obs: ${p.observacao || 'Nenhuma'}</span>
            </div>`;
        });
    } catch (error) {
        console.error(error);
        lista.innerHTML = `<p style="color:red;">Erro ao carregar do Firebase. Verifique se o Firestore Database foi criado e as regras de segurança estão em modo de teste.</p>`;
    }
}

// Iniciar a loja
renderizarProdutos();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
