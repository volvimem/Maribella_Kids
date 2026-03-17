let carrinho = [];

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

function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    carrinho.push(produto);
    atualizarCarrinho();
    alert(`${produto.nome} adicionado ao carrinho!`);
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

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function toggleCart() { document.getElementById('cart-modal').classList.toggle('hidden'); }
function togglePerfil() { document.getElementById('perfil-modal').classList.toggle('hidden'); carregarPerfil(); }
function fecharAdmin() { document.getElementById('admin-modal').classList.add('hidden'); }

function mostrarAba(aba) {
    document.getElementById('conteudo-pedidos').classList.add('hidden');
    document.getElementById('conteudo-enderecos').classList.add('hidden');
    document.getElementById('tab-pedidos').classList.remove('ativa');
    document.getElementById('tab-enderecos').classList.remove('ativa');

    document.getElementById(`conteudo-${aba}`).classList.remove('hidden');
    document.getElementById(`tab-${aba}`).classList.add('ativa');
}

function copiarPix() {
    const chavePix = "81999999999"; 
    navigator.clipboard.writeText(chavePix).then(() => alert("Chave PIX copiada!"));
}

// Fechamento de Pedido
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");

    const nome = document.getElementById('cliente-nome').value;
    const endereco = document.getElementById('cliente-endereco').value;
    const obs = document.getElementById('cliente-obs').value;
    const total = document.getElementById('total-price').innerText;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Salvar pedido no histórico do navegador
    salvarHistorico(nome, endereco, carrinho, total, dataAtual);

    let mensagem = `Olá! Meu nome é ${nome} e gostaria de finalizar meu pedido da Maribella Kids:\n\n🛍️ *MEUS PRODUTOS:*\n`;
    carrinho.forEach(item => mensagem += `- ${item.nome} (R$ ${item.preco.toFixed(2)})\n`);
    mensagem += `\n💰 *TOTAL:* R$ ${total}\n\n📦 *DADOS DE ENVIO:*\n${endereco}\n`;
    if (obs) mensagem += `📌 *OBS:* ${obs}\n\n`;
    mensagem += `O pagamento foi feito via PIX e estou enviando o comprovante!`;

    const telefoneVendedora = "5581999999999";
    window.open(`https://wa.me/${telefoneVendedora}?text=${encodeURIComponent(mensagem)}`, '_blank');
    
    carrinho = [];
    atualizarCarrinho();
    toggleCart();
    this.reset();
});

// Lógica de Banco de Dados Local (LocalStorage)
function salvarHistorico(nome, endereco, itens, total, data) {
    let historico = JSON.parse(localStorage.getItem('maribella_pedidos')) || [];
    let enderecos = JSON.parse(localStorage.getItem('maribella_enderecos')) || [];
    
    // Salva o pedido
    historico.push({ nome, data, total, itens: itens.length });
    localStorage.setItem('maribella_pedidos', JSON.stringify(historico));

    // Salva o endereço se não existir
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

// Lógica do Administrador
function abrirAdmin() {
    const senhaAdmin = "1234"; // SENHA PARA ENTRAR NO ADMIN
    const tentativa = prompt("Digite a senha do administrador:");
    
    if(tentativa === senhaAdmin) {
        document.getElementById('admin-modal').classList.remove('hidden');
        carregarAdmin();
    } else if (tentativa !== null) {
        alert("Senha Incorreta!");
    }
}

function carregarAdmin() {
    const lista = document.getElementById('lista-admin-pedidos');
    let historico = JSON.parse(localStorage.getItem('maribella_pedidos')) || [];
    
    lista.innerHTML = historico.length === 0 ? "<p>Nenhum pedido registrado ainda.</p>" : "";
    historico.reverse().forEach(p => {
        lista.innerHTML += `<div class="pedido-item" style="flex-direction:column; gap:5px; margin-bottom:10px; border:1px solid #ccc; padding:10px;">
            <strong>Data: ${p.data} | Cliente: ${p.nome}</strong>
            <span>Total: R$ ${p.total} (${p.itens} peças)</span>
        </div>`;
    });
}

function limparHistoricoAdmin() {
    if(confirm("Tem certeza que deseja apagar todo o histórico de pedidos deste aparelho?")) {
        localStorage.removeItem('maribella_pedidos');
        carregarAdmin();
    }
}

// Inicializar
renderizarProdutos();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
