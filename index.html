<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Maribella Kids | Coleção Semanal</title>
    
    <meta name="theme-color" content="#ffb6c1">
    
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div id="toast-notificacao" class="toast hidden"></div>

    <div id="modal-confirmacao" class="modal hidden" style="z-index: 999999;">
        <div class="modal-content" style="max-width: 320px; text-align: center; padding: 30px 20px; border-radius: 20px;">
            <h3 id="confirm-title" style="color: var(--primary); margin-bottom: 10px; font-size: 1.4rem;">Confirmação</h3>
            <p id="confirm-msg" style="color: #666; margin-bottom: 25px; font-size: 1rem;">Deseja realmente fazer isso?</p>
            <div style="display: flex; gap: 10px;">
                <button id="btn-confirm-no" style="flex:1; padding:12px; border:none; border-radius:10px; background:#e0e0e0; color:#333; font-weight:bold; cursor:pointer;">Cancelar</button>
                <button id="btn-confirm-yes" style="flex:1; padding:12px; border:none; border-radius:10px; background:var(--success); color:white; font-weight:bold; cursor:pointer;">Confirmar</button>
            </div>
        </div>
    </div>

    <div id="modal-escolher-tamanho" class="modal hidden" style="z-index: 3000;">
        <div class="modal-content" style="max-width: 350px;">
            <span class="close" onclick="window.fecharModalTamanho()">×</span>
            <h2 style="color:var(--primary); margin-bottom: 10px; font-size:1.3rem;">Adicionar ao Carrinho</h2>
            <p style="font-size: 0.8rem; color: #555; margin-bottom: 15px; line-height: 1.4; background: #fff5f7; padding: 8px; border-radius: 8px; border: 1px solid #ffe4e8;">
                ⚠️ <strong>Atenção:</strong> Cada grade contém <strong>10 peças</strong>, sendo 2 unidades de cada tamanho: <strong>8, 10, 12, 14 e 16</strong>.
            </p>
            <div id="info-produto-tamanho" style="display:flex; gap:10px; margin-bottom:15px; align-items:center;"></div>
            <div id="lista-opcoes-tamanho" style="display:flex; flex-direction:column; gap:10px; margin-bottom: 15px; max-height: 40vh; overflow-y:auto;"></div>
            <button onclick="window.confirmarAdicaoCarrinho()" class="btn-whatsapp" style="width:100%;">🛒 Adicionar Grade ao Carrinho</button>
        </div>
    </div>

    <div id="sidebar-overlay" class="hidden" onclick="window.fecharMenuLateral()"></div>
    <div id="sidebar-menu" class="sidebar hidden">
        <div class="sidebar-header">
            <h2>Categorias</h2>
            <span class="close-sidebar" onclick="window.fecharMenuLateral()">×</span>
        </div>
        <ul class="menu-links">
            <li onclick="window.filtrarCategoria('Todas')">🎀 Todas as Peças</li>
            <li onclick="window.filtrarCategoria('Vestido')">👗 Vestidos</li>
            <li onclick="window.filtrarCategoria('T-shirt')">👚 T-shirt</li>
            <li onclick="window.filtrarCategoria('Short/Saia')">🩳👗 Shorts e Saias</li>
            <li onclick="window.filtrarCategoria('Conjunto')">👯‍♀️ Conjuntos</li>
            <li onclick="window.filtrarCategoria('Macacão/Macaquito')">🩱 Macacões / Macaquitos</li>
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <div class="store-info">
            <h3>Nossa Loja</h3>
            <a id="menu-endereco-link" href="#" target="_blank" style="text-decoration: none; color: inherit;">
                <p id="menu-endereco-info" style="line-height: 1.4; display: flex; align-items: center; gap: 5px;">📍 Enviamos para todo o Brasil.</p>
            </a>
        </div>
        
        <div class="fake-reviews" onclick="window.abrirModalAvaliacoes()" style="cursor: pointer; margin-top: 20px;">
            <h3 style="margin-bottom: 5px;">Avaliações ⭐⭐⭐⭐⭐</h3>
            <div id="review-destaque"></div>
        </div>

        <div style="margin-top: auto; border-top: 1px solid #eee; padding-top: 15px; display: flex; align-items: center; justify-content: space-between;">
            <button onclick="window.abrirLoginAdmin()" style="background: #f0f0f0; border: none; width: 35px; height: 35px; border-radius: 50%; font-size: 1rem; cursor: pointer; color: #555;" title="Painel da Gestora">⚙️</button>
            <div style="text-align: right; line-height: 1.2;">
                <span style="font-size: 0.75rem; color: #2ecc71; font-weight: bold;">🔒 Ambiente 100%<br>Seguro e Criptografado</span>
            </div>
        </div>
    </div>

    <div id="admin-login-modal" class="modal hidden" style="z-index: 100000;">
        <div class="modal-content" style="max-width:350px; text-align:center; margin:auto; border-radius:20px;">
            <span class="close" onclick="window.fecharLoginAdmin()">×</span>
            <h2 style="color:var(--primary); margin-bottom:10px;">🔐 Admin</h2>
            <form id="form-login-admin" onsubmit="window.realizarLoginAdmin(event)">
                <input type="email" id="admin-email" placeholder="E-mail Administrativo" required>
                <input type="password" id="admin-senha" placeholder="Senha" required>
                <button type="submit" class="btn-whatsapp" style="width:100%;">Entrar</button>
            </form>
        </div>
    </div>

    <div id="modal-avaliacoes" class="modal hidden" style="z-index: 9999999;">
        <div class="modal-content" style="padding: 20px;">
            <span class="close" onclick="window.fecharModalAvaliacoes()">×</span>
            <h2 style="color:var(--primary); margin-bottom: 15px; font-size: 1.5rem;">⭐ Avaliações (<span id="total-avaliacoes-count">0</span>)</h2>
            <div id="lista-avaliacoes-modal" style="max-height: 65vh; overflow-y: auto; padding-right: 5px;"></div>
        </div>
    </div>

    <header id="main-header">
        <div class="header-top">
            <button class="btn-icon-menu" onclick="window.abrirMenuLateral()">☰</button>
            <div class="logo"><span>Maribella Kids</span></div>
            <div style="width: 40px;"></div> 
        </div>
        <div class="header-sub">
            <div style="flex: 2; position: relative; display: flex; align-items: center;">
                <span style="position: absolute; left: 12px; font-size: 0.9rem; color: #888;">🔍</span>
                <input type="text" id="busca-input" placeholder="Buscar modelos..." oninput="window.filtrarProdutos()" style="width:100%; height:34px; padding:0 15px 0 32px; border-radius:20px; border:none; outline:none; font-size:0.9rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            </div>
            <button class="header-btn" id="btn-header-pedidos" onclick="window.verificarLoginCliente()" style="flex: 1; height: 34px;">👤 Perfil</button>
        </div>
    </header>

    <button id="cart-btn-floating" class="floating-cart" onclick="window.toggleCart()">
        🛒 <span id="cart-count">0</span>
    </button>

    <main id="loja-main">
        <div class="stories-wrapper">
            <div class="stories-track" id="stories-track"><p style="font-size:0.8rem; color:#aaa; margin:auto; padding:10px;">⏳ Carregando novidades...</p></div>
        </div>

        <div class="info-banner" id="texto-aviso-loja">⏳ Carregando informações da loja...</div>

        <div id="vitrine-estacoes" style="padding-bottom: 20px;">
            <p style="text-align: center; color: #aaa; margin-top: 50px;">⏳ Carregando coleção...</p>
        </div>

        <footer class="site-footer">
            <h3 style="color:var(--primary); margin-bottom:5px;">Maribella Kids</h3>
            <a id="footer-endereco-link" href="#" target="_blank" style="text-decoration: none; color: inherit;">
                <p id="footer-endereco-texto" style="font-size:0.9rem; color:#666; margin-bottom:15px; line-height: 1.4;">📍 Carregando localização...</p>
            </a>
            <a id="footer-instagram-link" href="#" target="_blank" class="btn-instagram">📸 Siga nosso Instagram</a>
            <div style="margin-top: 25px;">
                <img src="https://img.shields.io/badge/Site%20Seguro-100%25%20SSL-success?style=for-the-badge&logo=appveyor" alt="Site Seguro" style="height: 30px;">
                <p style="font-size:0.75rem; color:#999; margin-top:5px;">Ambiente 100% Seguro e Criptografado</p>
            </div>
        </footer>
    </main>

    <div id="lightbox-modal" class="modal hidden" style="background: rgba(0,0,0,0.95); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; position: fixed;">
        <span class="close" onclick="window.fecharLightbox()" style="color:white; top:20px; right:20px; font-size:3rem; position: fixed; z-index: 10002;">×</span>
        <button id="lightbox-prev" class="lightbox-nav hidden" onclick="window.navegarLightbox(-1)">❮</button>
        <img id="lightbox-img" src="" onclick="window.toggleZoom()" alt="Zoom" style="max-height: 70vh; width: auto; max-width: 95vw; object-fit: contain; border-radius: 10px; transition: 0.3s ease; position: relative; z-index: 10000;">
        <button id="lightbox-next" class="lightbox-nav hidden" onclick="window.navegarLightbox(1)">❯</button>
        <div id="lightbox-controls" style="margin-top: 20px; text-align: center; display: none; z-index: 10001;">
            <button class="btn-whatsapp" onclick="window.abrirOpcoesLightbox()" style="padding: 15px 30px; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.4); border-radius: 30px;">🛒 Adicionar ao Carrinho</button>
        </div>
    </div>

    <div id="install-app-banner" class="app-banner hidden">
        <span class="close-banner" onclick="window.fecharBannerInstalacao()">×</span>
        <img src="https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif" alt="App Icon" class="app-banner-icon">
        <div class="app-banner-text">
            <h4>Baixe o App! 🎀</h4>
            <p>Compre mais rápido e fácil.</p>
        </div>
        <button id="btn-instalar-app" class="btn-install">Instalar Agora</button>
    </div>
    
    <div id="cliente-login-modal" class="modal hidden">
        <div class="modal-content" style="max-width:350px; text-align:center; margin:auto; border-radius:20px;">
            <span class="close" onclick="window.fecharLoginCliente()">×</span>
            <h2 style="color:var(--secondary); margin-bottom:10px;">📦 Meus Pedidos</h2>
            
            <div id="etapa-login-telefone">
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">Para sua segurança, enviaremos um código por SMS.</p>
                <form id="form-enviar-sms" onsubmit="window.enviarCodigoSMS(event)">
                    <input type="tel" id="login-telefone-cliente" placeholder="Telefone: (**)* ****-****" maxlength="15" required oninput="window.mascaraTelefone(this)">
                    
                    <div id="recaptcha-container" style="margin-top: 15px; display: flex; justify-content: center;"></div>
                    
                    <button type="submit" class="btn-whatsapp" id="btn-enviar-sms" style="width:100%; margin-top:15px;">📲 Enviar Código SMS</button>
                </form>
            </div>

            <div id="etapa-login-codigo" class="hidden">
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">Digite o código de 6 dígitos que enviamos para o seu celular.</p>
                <form id="form-verificar-sms" onsubmit="window.verificarCodigoSMS(event)">
                    <input type="text" id="login-codigo-sms" placeholder="Código SMS (Ex: 123456)" maxlength="6" required style="text-align: center; font-size: 1.2rem; letter-spacing: 5px;">
                    <button type="submit" class="btn-whatsapp" id="btn-verificar-sms" style="width:100%; margin-top:15px;">✅ Confirmar e Acessar</button>
                    <button type="button" onclick="window.voltarParaTelefone()" style="background: none; border: none; color: #888; margin-top: 15px; text-decoration: underline; font-size: 0.8rem; cursor: pointer;">Voltar e corrigir número</button>
                </form>
            </div>
        </div>
    </div>
    
    <div id="perfil-cliente-modal" class="modal hidden"><div class="modal-content" style="display:flex; flex-direction:column;"><span class="close" onclick="window.fecharPerfil()">×</span><h2 style="color:var(--secondary); margin-bottom:5px;" id="titulo-painel-cliente">👤 Meu Painel</h2><div class="tabs" style="display:flex; border-bottom:2px solid #eee; margin-top:10px;"><button onclick="window.mudarAbaCliente('aba-historico')" class="tab-btn ativa" id="btn-aba-historico" style="flex:1; padding:10px; font-weight:bold; border:none; background:none;">🛍️ Histórico de Compras</button></div><div id="aba-historico" style="margin-top:15px; max-height:50vh; overflow-y:auto;"><div id="lista-meus-pedidos"></div></div><button onclick="window.sairCliente()" class="btn-sair" style="margin-top:20px;">🚪 Sair da Conta</button></div></div>
    
    <div id="modal-editar-pedido" class="modal hidden" style="z-index: 3000;"><div class="modal-content"><span class="close" onclick="window.fecharEdicaoPedido()">×</span><h2 style="color:var(--secondary);">✏️ Editar Carrinho</h2><div id="lista-editar-itens" style="margin-top:15px; max-height:40vh; overflow-y:auto;"></div><div class="cart-total">Novo Total: R$ <span id="novo-total-edicao">0.00</span></div><button onclick="window.salvarEdicaoPedido()" class="btn-whatsapp" style="width:100%; margin-top:15px;">💾 Salvar Alterações</button></div></div>
    
    <div id="cart-modal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="window.toggleCart()">×</span>
            <div id="etapa-carrinho">
                <h2>🛒 Seu Carrinho (Atacado)</h2>
                <p style="font-size: 0.8rem; color: #e74c3c; margin-bottom: 15px; text-align: center; font-weight: bold; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">Lembrando: Cada Grade contém 10 Peças (Tamanhos 8 ao 16)</p>
                <div id="cart-items"></div>
                <div class="cart-total">Total: R$ <span id="total-price">0.00</span></div>
                <button class="btn-whatsapp" onclick="window.irParaCadastro()" style="width:100%; margin-top:20px;">Finalizar Compra</button>
            </div>
            <div id="etapa-cadastro" class="hidden">
                <h2>Dados de Envio</h2>
                
                <form id="checkout-form" onsubmit="window.finalizarCheckout(event)">
                    <input type="text" id="cliente-nome" placeholder="Nome Completo" required oninput="window.salvarFormulario()">
                    <input type="tel" id="cliente-telefone" placeholder="Telefone: (**)* ****-****" maxlength="15" required oninput="window.mascaraTelefone(this); window.salvarFormulario()">
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="cliente-cidade" placeholder="Cidade" style="flex:1;" required oninput="window.salvarFormulario()">
                        <input type="text" id="cliente-estado" placeholder="UF" style="width:80px;" required oninput="window.salvarFormulario()">
                    </div>

                    <label style="font-weight:bold; font-size: 0.9rem; margin-top: 10px; color: var(--primary);">Método de Entrega:</label>
                    <select id="cliente-metodo-entrega" required onchange="window.mudarMetodoEntrega()" style="margin-top: 0;">
                        <option value="">Selecione...</option>
                        <option value="Retirada">Retirada na Loja</option>
                        <option value="Excursão">Envio por Excursão</option>
                    </select>

                    <div id="bloco-excursao" class="hidden">
                        <input type="text" id="cliente-excursao" placeholder="Nome da Excursão" style="width: 100%;" oninput="window.salvarFormulario()">
                    </div>

                    <div id="bloco-retirada" class="hidden" style="background:#f0fff4; padding:10px; border-radius:8px; border:1px solid var(--success); margin-top: 5px;">
                        <span style="font-size:0.85rem; font-weight:bold; color:var(--success);">📍 Endereço de Retirada:</span>
                        <p style="font-size: 0.85rem; color: #333; margin-top: 3px;">Loja Maribella Kids<br>Cidade: Santa Cruz<br>Box Setor Amarelo, Rua N, Box 1 e 3.</p>
                    </div>

                    <div class="pagamento-info" style="margin-top: 15px;">
                        <h4>Pagamento via PIX</h4>
                        <p style="margin-bottom: 5px;">Nome: <strong id="pix-nome-display">Carregando...</strong></p>
                        <p>Chave: <strong id="pix-display">Carregando...</strong></p>
                        <button type="button" class="btn-pix" onclick="window.tentarCopiarPix()">📋 Copiar Chave PIX</button>
                    </div>
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button type="button" class="btn-add" onclick="window.voltarParaCarrinho()" style="background:#ccc; color:#333; flex:1;">Voltar</button>
                        <button type="submit" class="btn-whatsapp" id="btn-finalizar-checkout" style="flex:2; margin-top:0;">💾 Enviar Pedido</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="admin-historico-cliente-modal" class="modal hidden" style="z-index:4000;"><div class="modal-content"><span class="close" onclick="window.fecharHistoricoClienteAdmin()">×</span><h2 style="color:var(--secondary);" id="nome-historico-admin">Histórico</h2><div id="lista-historico-cliente-admin" style="margin-top:15px; max-height:60vh; overflow-y:auto;"></div></div></div>

    <div id="admin-dashboard" class="hidden">
        <div class="admin-sidebar">
            <button onclick="window.mudarAbaAdmin('admin-pedidos')" class="admin-tab-btn ativa" id="tab-admin-pedidos">🛍️ Pedidos</button>
            <button onclick="window.mudarAbaAdmin('admin-produtos')" class="admin-tab-btn" id="tab-admin-produtos">📦 Produtos</button>
            <button onclick="window.mudarAbaAdmin('admin-clientes')" class="admin-tab-btn" id="tab-admin-clientes">👥 Clientes</button>
            <button onclick="window.mudarAbaAdmin('admin-relatorios')" class="admin-tab-btn" id="tab-admin-relatorios">📊 Relatórios</button>
            <button onclick="window.mudarAbaAdmin('admin-config')" class="admin-tab-btn" id="tab-admin-config">🔧 Ajustes</button>
            <button onclick="window.sairDoAdmin()" class="btn-sair-adm">❌ Sair</button>
        </div>
        
        <div class="admin-content">
            <div id="admin-pedidos" class="admin-aba">
                <h3>Gerenciar Vendas</h3>
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap: wrap;">
                    <input type="text" id="busca-pedido" placeholder="🔍 Buscar Cliente..." oninput="window.filtrarPedidosAdmin()" style="flex:1; min-width: 200px; padding:10px; border-radius:10px; border:1px solid #ddd;">
                    
                    <button onclick="window.setFiltroStatus('Pendente')" class="btn-whatsapp" style="margin:0; background:#f39c12; padding: 10px 15px; border-radius: 10px;">Pendentes</button>
                    <button onclick="window.setFiltroStatus('Aprovado')" class="btn-whatsapp" style="margin:0; background:var(--success); padding: 10px 15px; border-radius: 10px;">Aprovados</button>
                    <button onclick="window.setFiltroStatus('Todos')" class="btn-whatsapp" style="margin:0; background:#666; padding: 10px 15px; border-radius: 10px;">Todos</button>
                    
                    <input type="hidden" id="filtro-status" value="Todos">
                </div>
                <div id="lista-admin-pedidos"></div>
            </div>

            <div id="admin-relatorios" class="admin-aba hidden">
                <h3>📊 Relatórios e Gráfico de Vendas</h3>
                <div style="display:flex; gap:10px; margin-top: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                    <select id="filtro-mes-rel" style="flex:1; min-width:120px; padding: 10px; border-radius: 10px; border:1px solid #ddd;">
                        <option value="Todos">Todos os Meses</option> <option value="01">Janeiro</option> <option value="02">Fevereiro</option> <option value="03">Março</option> <option value="04">Abril</option> <option value="05">Maio</option> <option value="06">Junho</option> <option value="07">Julho</option> <option value="08">Agosto</option> <option value="09">Setembro</option> <option value="10">Outubro</option> <option value="11">Novembro</option> <option value="12">Dezembro</option>
                    </select>
                    <select id="filtro-ano-rel" style="flex:1; min-width:120px; padding: 10px; border-radius: 10px; border:1px solid #ddd;">
                        <option value="Todos">Todos os Anos</option> <option value="2024">2024</option> <option value="2025">2025</option> <option value="2026">2026</option> <option value="2027">2027</option>
                    </select>
                    <button onclick="window.gerarRelatoriosAdmin()" class="btn-whatsapp" style="margin:0; padding:10px 15px; border-radius:10px;">🔍 Filtrar</button>
                </div>
                <div style="background:white; padding:15px; border-radius:10px; border:1px solid #ddd; margin-bottom:20px;">
                    <canvas id="graficoVendas" style="width:100%; max-height:300px;"></canvas>
                </div>
                <div id="conteudo-relatorios">
                    <p style="color:#666;">Selecione os filtros e clique em Filtrar.</p>
                </div>
            </div>

            <div id="admin-produtos" class="admin-aba hidden">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Adicionar / Editar Produto</h3>
                    <button onclick="window.imprimirBalancoEstoque()" class="btn-whatsapp" style="margin:0; padding:10px; font-size:0.9rem; border-radius:8px;">🖨️ Balanço (PDF)</button>
                </div>
                <form id="form-add-produto" class="admin-form" onsubmit="window.salvarProdutoAdmin(event)">
                    <input type="hidden" id="edit-produto-id">
                    <input type="text" id="add-nome" placeholder="Nome do Modelo" required style="width: 100%;">
                    <input type="number" id="add-preco" placeholder="Preço da Grade Fechada (Ex: 350.00)" step="0.01" required style="width:100%;">
                    
                    <div style="background: #eef2f5; padding: 15px; border-radius: 10px; margin-top:10px; border: 1px solid #ddd;">
                        <label style="font-weight:bold; color:var(--primary);">📏 Controle de Grades (10 Peças):</label>
                        <p style="font-size: 0.85rem; color: #555; margin-top: 5px; line-height: 1.4;">
                            ℹ️ <strong>Composição da Grade:</strong> 2 un. (Tam 8) | 2 un. (Tam 10) | 2 un. (Tam 12) | 2 un. (Tam 14) | 2 un. (Tam 16).
                        </p>
                        <div id="lista-variacoes-admin" style="display:flex; flex-direction:column; gap:8px; margin-top: 10px;"></div>
                        <button type="button" onclick="window.adicionarVariacaoAdmin()" style="background:#2ecc71; color:white; border:none; padding:8px 15px; border-radius:8px; margin-top:10px; font-weight:bold; cursor:pointer;">➕ Adicionar Estoque (Grade)</button>
                        <div style="margin-top:10px; font-weight:bold;">Total de Grades Disp: <span id="total-pecas-admin" style="color:var(--primary);">0</span></div>
                    </div>

                    <div style="display:flex; gap:10px; width: 100%; align-items:center; margin-top:10px;">
                        <select id="add-categoria" required style="flex:1; padding:12px; border-radius:10px; border:1px solid #ddd;">
                            <option value="Vestido">Vestido</option>
                            <option value="T-shirt">T-shirt</option>
                            <option value="Short/Saia">Short / Saia</option>
                            <option value="Conjunto">Conjunto</option>
                            <option value="Macacão/Macaquito">Macacão / Macaquito</option>
                        </select>
                        <label style="flex:1; display:flex; align-items:center; gap:5px; font-weight:bold; font-size:0.9rem; color:var(--primary); background: #f9f9f9; padding: 10px; border-radius: 10px;">
                            <input type="checkbox" id="add-lancamento" style="width:20px; height:20px; margin:0;"> Lançamento 🌟
                        </label>
                    </div>
                    <input type="text" id="add-material" placeholder="Tipo do Material" required>
                    <label style="font-size: 0.9rem; margin-top: 10px;">Fotos Oficiais (Até 4 fotos):</label>
                    <input type="file" id="add-imagem-file" accept="image/*" multiple max="4" style="background: white;">
                    <button type="submit" class="btn-whatsapp" id="btn-salvar-produto">💾 Salvar Produto</button>
                    <button type="button" class="btn-icon" style="background:#ccc; margin-top:10px; width:100%;" onclick="window.limparFormProduto()">Limpar / Cancelar Edição</button>
                </form>
                
                <h3 style="margin-top: 30px;">Catálogo</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:white; padding:10px; border-radius:10px; border:1px solid #ddd;">
                    <strong style="color:var(--primary);">Total: <span id="admin-total-prods-count">0</span> modelos</strong>
                    <select id="admin-filtro-cat" onchange="window.filtrarProdutosAdmin()" style="padding:8px; border-radius:8px; border:1px solid #ddd; outline:none;">
                        <option value="Todos">Todas as Peças</option>
                        <option value="Vestido">Vestido</option>
                        <option value="T-shirt">T-shirt</option>
                        <option value="Short/Saia">Short / Saia</option>
                        <option value="Conjunto">Conjunto</option>
                        <option value="Macacão/Macaquito">Macacão / Macaquito</option>
                    </select>
                </div>
                <input type="text" id="busca-produto-admin" placeholder="🔍 Buscar produto por nome..." oninput="window.filtrarProdutosAdmin()" style="width:100%; padding:10px; border-radius:10px; margin-bottom:15px; border:1px solid #ddd;">
                <div id="lista-admin-produtos-cadastrados" style="display: flex; flex-direction:column; gap: 10px;"></div>
            </div>

            <div id="admin-clientes" class="admin-aba hidden">
                <h3>Clientes Cadastrados</h3>
                <input type="text" id="busca-cliente-admin" placeholder="🔍 Buscar por nome ou telefone..." oninput="window.filtrarClientesAdmin()" style="width:100%; padding:10px; border-radius:10px; margin-bottom:15px; border:1px solid #ddd;">
                <div id="lista-admin-clientes"></div>
            </div>

            <div id="admin-config" class="admin-aba hidden">
                <h3>🔧 Ajustes da Loja</h3>
                
                <h4 style="margin-top:10px; color:var(--primary);">💾 Segurança e Backup</h4>
                <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; margin-bottom: 25px;">
                    <button onclick="window.gerarBackup(event)" class="btn-whatsapp" style="background:#3498db; flex:1; margin:0;"><span style="font-size:1.2rem;">📥</span> Baixar Backup</button>
                    <label class="btn-whatsapp" style="background:#f39c12; flex:1; margin:0; text-align:center; cursor:pointer;">
                        <span style="font-size:1.2rem;">📤</span> Restaurar Backup
                        <input type="file" id="file-restore-backup" accept=".json" style="display:none;" onchange="window.restaurarBackup(event)">
                    </label>
                </div>
                <p style="font-size:0.8rem; color:#666; margin-top:-15px; margin-bottom: 20px;">O backup salva todos os produtos, clientes, pedidos e configurações.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;">

                <form id="form-config-loja" class="admin-form" onsubmit="window.salvarConfiguracoes(event)">
                    <label style="font-weight:bold;">Aviso no Topo do Site (Aperte Enter para pular linha):</label>
                    <textarea id="config-aviso" placeholder="Ex: Apenas atacado. \nPedido mínimo..." rows="3" required></textarea>
                    
                    <label style="font-weight:bold; margin-top:10px;">Nome do Titular do PIX:</label>
                    <input type="text" id="config-pix-nome" placeholder="Ex: Maria José da Silva" required>
                    
                    <label style="font-weight:bold; margin-top:10px;">Chave PIX:</label>
                    <input type="text" id="config-pix" required>
                    
                    <label style="font-weight:bold; margin-top:10px;">WhatsApp Vendas (Com DDD):</label>
                    <input type="text" id="config-telefone" placeholder="Ex: 81 999999999" maxlength="15" required oninput="window.mascaraTelefone(this)">
                    
                    <label style="font-weight:bold; margin-top:10px;">Link do Instagram:</label>
                    <input type="url" id="config-instagram" placeholder="Ex: https://instagram.com/maribella" required>
                    
                    <label style="font-weight:bold; margin-top:10px;">Endereço Físico (Pressione Enter para pular linha):</label>
                    <textarea id="config-endereco" placeholder="Ex: Setor Amarelo\nRua N, Box 1 e 3\nSanta Cruz" rows="3" required></textarea>
                    
                    <label style="font-weight:bold; margin-top:10px;">Link do Google Maps (Localização):</label>
                    <input type="url" id="config-link-maps" placeholder="Ex: https://maps.app.goo.gl/..." required>
                    
                    <button type="submit" class="btn-whatsapp" id="btn-salvar-config">💾 Atualizar Dados</button>
                </form>
            </div>
        </div>
    </div>

    <script type="module" src="app.js"></script>
</body>
</html>
