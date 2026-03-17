// app.js
let carrinho = [];

// Carrega os produtos na tela automaticamente
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

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('hidden');
}

function copiarPix() {
    // COLOQUE SUA CHAVE PIX AQUI PARA O CLIENTE COPIAR
    const chavePix = "81999999999"; 
    navigator.clipboard.writeText(chavePix).then(() => {
        alert("Chave PIX copiada! Abra seu banco para pagar.");
    });
}

// Fechar pedido e enviar para o WhatsApp
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const nome = document.getElementById('cliente-nome').value;
    const endereco = document.getElementById('cliente-endereco').value;
    const obs = document.getElementById('cliente-obs').value;
    const total = document.getElementById('total-price').innerText;

    let mensagem = `Olá! Meu nome é ${nome} e gostaria de finalizar meu pedido da Boutique Kids:\n\n`;
    mensagem += `🛍️ *MEUS PRODUTOS:*\n`;
    
    carrinho.forEach(item => {
        mensagem += `- ${item.nome} (R$ ${item.preco.toFixed(2)})\n`;
    });

    mensagem += `\n💰 *TOTAL:* R$ ${total}\n\n`;
    mensagem += `📦 *DADOS DE ENVIO:*\n${endereco}\n`;
    if (obs) mensagem += `📌 *OBS:* ${obs}\n\n`;
    mensagem += `O pagamento foi feito via PIX e estou enviando o comprovante nesta conversa!`;

    // COLOQUE O SEU NÚMERO DE WHATSAPP AQUI (Com 55, DDD e número. Ex: 5581999999999)
    const telefoneVendedora = "5581999999999";
    const url = `https://wa.me/${telefoneVendedora}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
    
    // Limpar carrinho após envio
    carrinho = [];
    atualizarCarrinho();
    toggleCart();
    this.reset();
});

// Inicializar
renderizarProdutos();

// Registrar Service Worker (Para transformar em PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
