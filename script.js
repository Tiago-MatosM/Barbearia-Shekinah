// Aguarda o carregamento completo do DOM antes de rodar o código
document.addEventListener('DOMContentLoaded', function() {

    // Recupera dados salvos ou inicia arrays vazios
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const fila = JSON.parse(localStorage.getItem('fila')) || [];
    const ganhosMensais = JSON.parse(localStorage.getItem('ganhosMensais')) || [];

    // Índices de edição (null significa que não está editando nada)
    let editandoIndex = null;
    let editandoFilaIndex = null;

    // Controle da paginação da fila
    const itensPorPagina = 10;
    let paginaAtualFila = 1;
    
    // Seleção dos elementos da página
    const inputFila = document.getElementById('nomeFila');
    const botaoAdicionarFila = document.getElementById('adicionarFila');
    const listaFilaElemento = document.getElementById('listaFila');
    const botaoApagarFila = document.getElementById('apagarFila');
    const inputNome = document.getElementById('nomeCliente');
    const inputValor = document.getElementById('valorPago');
    const botaoAdicionar = document.getElementById('adicionarCliente');
    const listaClientesElemento = document.getElementById('listaClientes');
    const totalValorElemento = document.getElementById('totalValor');
    const botaoFinalizar = document.getElementById('finalizarDia');
    const listaGanhosMensaisElemento = document.getElementById('listaGanhosMensais');
    const totalMensalElemento = document.getElementById('totalMensal');
    const botaoApagarGanhos = document.getElementById('apagarGanhos');
    const toggleGanhosBtn = document.getElementById('toggleGanhosBtn');
    const totalMensalContainer = document.getElementById('totalMensalContainer');
    
    // Salva os arrays no localStorage
    function salvarDados() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('fila', JSON.stringify(fila));
        localStorage.setItem('ganhosMensais', JSON.stringify(ganhosMensais));
    }

    // Mostra a fila na tela
    function renderizarFila() {
        // Limpa a área da lista
        listaFilaElemento.innerHTML = '';
        // Seleciona o container da paginação
        const paginacaoContainer = document.getElementById('paginacaoFila');
        // Limpa a paginação
        paginacaoContainer.innerHTML = '';

        // --- CONTADOR DE PESSOAS NA FILA (NOVO) ---
        // Tenta obter um elemento existente para exibir o contador da fila
        let contadorFila = document.getElementById('contadorFila');
        // Se ainda não existe, cria um novo elemento <p> para o contador
        if (!contadorFila) {
            // Cria o parágrafo que exibirá o total de pessoas na fila
            contadorFila = document.createElement('p');
            // Define o id para poder reutilizar depois
            contadorFila.id = 'contadorFila';
            // Centraliza o texto do contador
            contadorFila.style.textAlign = 'center';
            // Deixa o texto em negrito
            contadorFila.style.fontWeight = 'bold';
            // Insere o contador imediatamente antes da lista da fila
            listaFilaElemento.parentNode.insertBefore(contadorFila, listaFilaElemento);
        }
        // Atualiza o texto do contador com o tamanho atual da fila
        contadorFila.textContent = `Pessoas na fila: ${fila.length}`;
        // --- FIM DO CONTADOR DE PESSOAS NA FILA (NOVO) ---

        // Se a fila estiver vazia, mostra o estado vazio e oculta paginação
        if (fila.length === 0) {
            // Adiciona HTML do estado vazio na lista
            listaFilaElemento.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-couch"></i>
                    <span>A fila de espera está vazia.</span>
                </div>
            `;
            // Esconde a paginação quando não há itens
            paginacaoContainer.style.display = 'none';
            // Encerra a função aqui porque não há itens para listar
            return;
        }
        // Exibe a paginação quando há itens na fila
        paginacaoContainer.style.display = 'flex';

        // Calcula o índice inicial dos itens dessa página
        const inicio = (paginaAtualFila - 1) * itensPorPagina;
        // Calcula o índice final (não inclusivo) dos itens dessa página
        const fim = inicio + itensPorPagina;
        // Obtém o recorte do array da fila referente à página atual
        const itensDaPagina = fila.slice(inicio, fim);

        // Percorre os itens da página e cria os elementos de lista
        itensDaPagina.forEach((cliente, indexNaPagina) => {
            // Converte o índice relativo na página para o índice real no array
            const indexReal = inicio + indexNaPagina;
            // Cria o elemento <li> para o item da fila
            const itemLista = document.createElement('li');
            
            // Cria o <span> que exibirá o nome do cliente
            const nomeItem = document.createElement('span');
            // Aplica a classe CSS para estilo do nome
            nomeItem.className = 'item-nome';
            // Define o texto exibido como o nome do cliente
            nomeItem.textContent = cliente.nome;
            
            // Se o cliente já foi atendido, aplica a classe visual correspondente
            if (cliente.atendido) {
                // Marca o item com a classe "atendido"
                itemLista.classList.add('atendido');
            }

            // Adiciona o span com o nome dentro do <li>
            itemLista.appendChild(nomeItem);
            
            // Cria o container para os botões de ação do item
            const botoes = document.createElement('div');
            // Adiciona a classe CSS do grupo de botões
            botoes.classList.add('botoes-fila');

            // Cria o botão de editar o nome do cliente da fila
            const botaoEditar = document.createElement('button');
            // Define o ícone do botão de edição
            botaoEditar.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            // Adiciona classes CSS do botão
            botaoEditar.classList.add('botao-acao', 'editar');
            // Define o título (tooltip) do botão
            botaoEditar.title = 'Editar nome na fila';
            // Ao clicar, preenche o input com o nome e entra em modo de edição
            botaoEditar.onclick = () => {
                // Copia o nome do cliente para o input da fila
                inputFila.value = cliente.nome;
                // Guarda o índice que está sendo editado
                editandoFilaIndex = indexReal;
                // Muda o texto do botão principal para "Salvar Alterações"
                botaoAdicionarFila.textContent = 'Salvar Alterações';
                // Coloca o foco no input para digitação imediata
                inputFila.focus();
            };
            // Adiciona o botão de editar ao container de botões
            botoes.appendChild(botaoEditar);

            // Se o cliente ainda não foi atendido, mostra o botão de "chamar"
            if (!cliente.atendido) {
                // Cria o botão de chamar o cliente para o caixa
                const botaoChamar = document.createElement('button');
                // Define o ícone do botão de chamar
                botaoChamar.innerHTML = '<i class="fas fa-arrow-right"></i>';
                // Define o título (tooltip) do botão
                botaoChamar.title = 'Chamar cliente e mover para o caixa';
                // Adiciona classes CSS do botão
                botaoChamar.classList.add('botao-acao', 'chamar');
                // Ao clicar, marca como atendido e preenche o caixa com "Serviço"
                botaoChamar.onclick = () => {
                    // Marca o item da fila como atendido
                    fila[indexReal].atendido = true;
                    // Salva os dados atualizados no localStorage
                    salvarDados();
                    // Re-renderiza a fila para refletir a mudança visual
                    renderizarFila();
                    // Preenche o campo do caixa com o texto "Serviço"
                    inputNome.value = "Serviço";
                    // Foca no campo de valor para facilitar o atendimento
                    inputValor.focus();
                };
                // Adiciona o botão de chamar ao container de botões
                botoes.appendChild(botaoChamar);
            }

            // Cria o botão de remover o cliente da fila
            const botaoLixeira = document.createElement('button');
            // Define o ícone do botão de lixeira
            botaoLixeira.innerHTML = '<i class="fas fa-trash-alt"></i>';
            // Adiciona classes CSS do botão
            botaoLixeira.classList.add('botao-acao', 'lixeira');
            // Define o título (tooltip) do botão
            botaoLixeira.title = 'Remover da fila';
            // Ao clicar, remove o item da fila e atualiza a tela
            botaoLixeira.onclick = () => {
                // Remove o item da posição correta no array
                fila.splice(indexReal, 1);
                // Se a página ficou sem itens e não é a primeira, volta uma página
                if (listaFilaElemento.children.length === 1 && paginaAtualFila > 1) {
                    // Decrementa o número da página atual
                    paginaAtualFila--;
                }
                // Salva os dados atualizados
                salvarDados();
                // Re-renderiza a lista da fila (e atualiza o contador)
                renderizarFila();
            };

            // Adiciona o botão de lixeira ao container de botões
            botoes.appendChild(botaoLixeira);
            // Adiciona o container de botões ao item da lista
            itemLista.appendChild(botoes);
            // Adiciona o item completo à lista da fila
            listaFilaElemento.appendChild(itemLista);
        });

        // Calcula o total de páginas baseado no tamanho da fila
        const totalPaginas = Math.ceil(fila.length / itensPorPagina);
        // Se houver mais de uma página, cria os botões de navegação
        if (totalPaginas > 1) {
            // Loop para criar cada botão de página
            for (let i = 1; i <= totalPaginas; i++) {
                // Cria o botão da página i
                const botaoPagina = document.createElement('button');
                // Define o texto do botão como o número da página
                botaoPagina.textContent = i;
                // Se for a página atual, adiciona a classe "active"
                if (i === paginaAtualFila) {
                    // Marca visualmente a página atual
                    botaoPagina.classList.add('active');
                }
                // Ao clicar, muda a página atual e re-renderiza a fila
                botaoPagina.onclick = () => {
                    // Atualiza o número da página atual
                    paginaAtualFila = i;
                    // Re-renderiza a lista da fila (e atualiza o contador)
                    renderizarFila();
                };
                // Adiciona o botão de página no container de paginação
                paginacaoContainer.appendChild(botaoPagina);
            }
        }
    }

    // Mostra os clientes atendidos no caixa
    function renderizarClientes() {
        // Limpa a lista de clientes do dia
        listaClientesElemento.innerHTML = '';
        
        // Se não houver clientes no dia, mostra estado vazio
        if (clientes.length === 0) {
            // Insere o HTML do estado vazio
            listaClientesElemento.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <span>Nenhum cliente no caixa hoje.</span>
                </div>
            `;
            // Encerra a função aqui
            return;
        }

        // Percorre a lista de clientes do dia e monta os itens
        clientes.forEach((cliente, index) => {
            // Cria o elemento <li> do cliente
            const itemLista = document.createElement('li');
            
            // Cria o span com o texto "nome - R$ valor"
            const textoCliente = document.createElement('span');
            // Define o conteúdo de texto com nome e valor formatado
            textoCliente.textContent = `${cliente.nome} - R$ ${cliente.valor.toFixed(2)}`;
            // Adiciona o span ao item <li>
            itemLista.appendChild(textoCliente);

            // Cria o container dos botões do item
            const botoesContainer = document.createElement('div');
            // Define a classe CSS do container dos botões
            botoesContainer.className = 'botoes-container';

            // Cria o botão de editar o cliente
            const botaoEditar = document.createElement('button');
            // Define o ícone do botão de edição
            botaoEditar.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            // Adiciona classes CSS ao botão
            botaoEditar.classList.add('botao-acao', 'editar');
            // Define o título (tooltip) do botão
            botaoEditar.title = 'Editar cliente';
            // Ao clicar, carrega os dados no formulário para edição
            botaoEditar.onclick = () => {
                // Coloca o nome atual no input de nome
                inputNome.value = cliente.nome;
                // Coloca o valor atual no input de valor
                inputValor.value = cliente.valor;
                // Guarda o índice do cliente sendo editado
                editandoIndex = index;
                // Muda o texto do botão principal para "Salvar Alterações"
                botaoAdicionar.textContent = 'Salvar Alterações';
                // Foca no input de nome para edição imediata
                inputNome.focus();
            };
            // Adiciona o botão de editar ao container
            botoesContainer.appendChild(botaoEditar);
            
            // Cria o botão de lixeira para remover o cliente
            const botaoLixeira = document.createElement('button');
            // Define o ícone do botão de lixeira
            botaoLixeira.innerHTML = '<i class="fas fa-trash-alt"></i>';
            // Adiciona classes CSS ao botão
            botaoLixeira.classList.add('botao-acao', 'lixeira');
            // Define o título (tooltip) do botão
            botaoLixeira.title = 'Excluir cliente';
            // Ao clicar, remove o cliente e atualiza as listas
            botaoLixeira.onclick = () => {
                // Remove o cliente do array baseado no índice
                clientes.splice(index, 1);
                // Salva o estado atualizado no localStorage
                salvarDados();
                // Re-renderiza a lista de clientes
                renderizarClientes();
                // Recalcula o total do dia
                calcularTotalDiario();
            };
            // Adiciona o botão de lixeira ao container
            botoesContainer.appendChild(botaoLixeira);

            // Adiciona o container de botões ao item <li>
            itemLista.appendChild(botoesContainer);
            // Adiciona o item completo à lista de clientes
            listaClientesElemento.appendChild(itemLista);
        });
    }

    // Calcula o total diário do caixa
    function calcularTotalDiario() {
        // Usa reduce para somar os valores pagos por todos os clientes do dia
        const total = clientes.reduce((soma, cliente) => soma + cliente.valor, 0);
        // Atualiza o span com o total formatado com duas casas decimais
        totalValorElemento.textContent = total.toFixed(2);
    }

    // Mostra os ganhos do mês
    function renderizarGanhosMensais() {
        // Limpa a lista do histórico mensal
        listaGanhosMensaisElemento.innerHTML = '';
        
        // Se não houver registros no histórico, mostra estado vazio
        if (ganhosMensais.length === 0) {
            // Insere o HTML do estado vazio
            listaGanhosMensaisElemento.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <span>Histórico de ganhos está vazio.</span>
                </div>
            `;
            // Zera o total mensal exibido
            totalMensalElemento.textContent = "0.00";
            // Encerra a função aqui
            return;
        }

        // Acumulador do total do mês
        let totalMes = 0;
        // Percorre cada entrada do histórico mensal
        ganhosMensais.forEach((ganho, index) => {
            // Cria o item <li> do histórico
            const itemLista = document.createElement('li');
            
            // Cria o span com a data e o valor do dia
            const textoGanho = document.createElement('span');
            // Define o texto no formato "Dia dd/mm/aaaa: R$ valor"
            textoGanho.textContent = `Dia ${ganho.data}: R$ ${ganho.valor.toFixed(2)}`;
            // Adiciona o span ao item <li>
            itemLista.appendChild(textoGanho);
            
            // Cria o botão de lixeira para remover o registro
            const botaoLixeira = document.createElement('button');
            // Define o ícone do botão
            botaoLixeira.innerHTML = '<i class="fas fa-trash-alt"></i>';
            // Adiciona classes CSS
            botaoLixeira.classList.add('botao-acao', 'lixeira');
            // Define o título (tooltip) do botão
            botaoLixeira.title = 'Excluir este registro';
            // Ao clicar, remove o registro e atualiza a lista
            botaoLixeira.onclick = () => {
                // Remove o registro do array ganhosMensais
                ganhosMensais.splice(index, 1);
                // Salva o estado atualizado
                salvarDados();
                // Re-renderiza a lista do histórico
                renderizarGanhosMensais();
            };
            // Adiciona o botão de lixeira ao item <li>
            itemLista.appendChild(botaoLixeira);
            // Adiciona o item completo na lista do histórico
            listaGanhosMensaisElemento.appendChild(itemLista);

            // Soma o valor deste registro ao total do mês
            totalMes += ganho.valor;
        });
        // Exibe o total mensal com duas casas decimais
        totalMensalElemento.textContent = totalMes.toFixed(2);
    }
    
    // --- EVENTOS ---

    // Adiciona ou salva alterações de um item da fila
    botaoAdicionarFila.addEventListener('click', () => {
        // Lê o valor do input da fila e remove espaços extras
        const nomeFila = inputFila.value.trim();
        // Se estiver vazio, não faz nada
        if (!nomeFila) return;

        // Se está editando um item da fila, atualiza o nome
        if (editandoFilaIndex !== null) {
            // Atribui o novo nome ao índice em edição
            fila[editandoFilaIndex].nome = nomeFila;
        } else {
            // Caso contrário, adiciona um novo registro à fila
            fila.push({ nome: nomeFila, atendido: false });
        }
        // Sai do modo de edição
        editandoFilaIndex = null;
        // Retorna o texto do botão principal para o estado padrão
        botaoAdicionarFila.textContent = 'Adicionar à Fila';
        // Salva os dados atualizados
        salvarDados();
        // Re-renderiza a fila (e atualiza o contador)
        renderizarFila();
        // Limpa o input da fila
        inputFila.value = '';
        // Foca no input para próxima digitação
        inputFila.focus();
    });

    // Adiciona ou salva alterações de um cliente no caixa
    botaoAdicionar.addEventListener('click', () => {
        // Lê o nome do cliente do input
        const nomeCliente = inputNome.value.trim();
        // Converte o valor pago para número de ponto flutuante
        const valorPago = parseFloat(inputValor.value);
        // Se nome vazio, valor não numérico ou não positivo, não faz nada
        if (!nomeCliente || isNaN(valorPago) || valorPago <= 0) return;

        // Se está editando, atualiza o cliente existente
        if (editandoIndex !== null) {
            // Substitui o objeto do cliente no índice correspondente
            clientes[editandoIndex] = { nome: nomeCliente, valor: valorPago };
        } else {
            // Caso contrário, adiciona um novo cliente ao array
            clientes.push({ nome: nomeCliente, valor: valorPago });
        }
        // Sai do modo de edição
        editandoIndex = null;
        // Retorna o texto do botão principal para o estado padrão
        botaoAdicionar.textContent = 'Adicionar';
        // Salva os dados no localStorage
        salvarDados();
        // Re-renderiza a lista de clientes do dia
        renderizarClientes();
        // Recalcula o total diário
        calcularTotalDiario();
        // Limpa o input de nome
        inputNome.value = '';
        // Limpa o input de valor
        inputValor.value = '';
        // Foca no input de nome para próxima digitação
        inputNome.focus();
    });
    
    // Finaliza o dia e salva o total nos ganhos mensais
    botaoFinalizar.addEventListener('click', () => {
        // Calcula o total diário somando os valores de todos os clientes
        const totalDiario = clientes.reduce((soma, cliente) => soma + cliente.valor, 0);
        // Se houver total e o usuário confirmar, salva no histórico
        if (totalDiario > 0 && confirm('Tem certeza que deseja fechar o caixa e salvar o total? Os clientes do dia serão limpos.')) {
            // Obtém a data atual
            const data = new Date();
            // Formata a data como dd/mm/aaaa
            const dataFormatada = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            
            // Adiciona um registro ao histórico mensal com valor e data
            ganhosMensais.push({ valor: totalDiario, data: dataFormatada });
            // Limpa a lista de clientes do dia
            clientes.length = 0;
            
            // Salva os dados no localStorage
            salvarDados();
            // Re-renderiza a lista de clientes do dia
            renderizarClientes();
            // Recalcula o total diário (que agora será 0)
            calcularTotalDiario();
            // Re-renderiza o histórico de ganhos do mês
            renderizarGanhosMensais();
            // Re-renderiza a fila (contador permanece e fila pode continuar)
            renderizarFila();
        } else if (totalDiario === 0) {
            // Se não há total a salvar, exibe alerta informando
            alert("Não há valor no caixa para ser salvo.");
        }
    });

    // Apaga toda a fila de espera
    botaoApagarFila.addEventListener('click', () => {
        // Só executa se existir algo na fila e o usuário confirmar
        if (fila.length > 0 && confirm('Tem certeza que deseja apagar TODOS os clientes da fila?')) {
            // Zera o array mantendo a referência
            fila.length = 0;
            // Salva os dados atualizados
            salvarDados();
            // Re-renderiza a fila (contador vai para zero)
            renderizarFila();
        }
    });

    // Apaga todo o histórico de ganhos mensais
    botaoApagarGanhos.addEventListener('click', () => {
        // Só executa se existir histórico e o usuário confirmar
        if (ganhosMensais.length > 0 && confirm('Tem certeza que deseja apagar TODO o histórico de ganhos?')) {
            // Zera o array mantendo a referência
            ganhosMensais.length = 0;
            // Salva os dados atualizados
            salvarDados();
            // Re-renderiza a lista e o total mensal
            renderizarGanhosMensais();
        }
    });

    // Alterna entre mostrar e ocultar a lista de ganhos mensais
    toggleGanhosBtn.addEventListener('click', () => {
        // Alterna a classe "escondido" na lista de ganhos
        const estaEscondido = listaGanhosMensaisElemento.classList.toggle('escondido');
        // Alterna a classe "escondido" no container do total mensal
        totalMensalContainer.classList.toggle('escondido');
        // Atualiza o texto do botão conforme estado atual
        toggleGanhosBtn.textContent = estaEscondido ? 'Mostrar' : 'Ocultar';
    });
    
    // Renderização inicial ao abrir a página
    renderizarFila();
    renderizarClientes();
    calcularTotalDiario();
    renderizarGanhosMensais();
});


// Registro do Service Worker (para PWA)
if ('serviceWorker' in navigator) {
  // Aguarda o evento de load da janela
  window.addEventListener('load', () => {
    // Tenta registrar o arquivo service-worker.js na raiz
    navigator.serviceWorker.register('/service-worker.js')
      // Em caso de sucesso, loga o registration
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      // Em caso de erro, loga o erro
      .catch(err => {
        console.log('Falha ao registrar Service Worker:', err);
      });
  });
}
