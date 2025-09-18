document.addEventListener('DOMContentLoaded', function() {

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const fila = JSON.parse(localStorage.getItem('fila')) || [];
    const ganhosMensais = JSON.parse(localStorage.getItem('ganhosMensais')) || [];
    let editandoIndex = null;
    let editandoFilaIndex = null;
    const itensPorPagina = 10;
    let paginaAtualFila = 1;
    
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
    
    function salvarDados() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('fila', JSON.stringify(fila));
        localStorage.setItem('ganhosMensais', JSON.stringify(ganhosMensais));
    }

    function renderizarFila() {
    listaFilaElemento.innerHTML = '';
    const paginacaoContainer = document.getElementById('paginacaoFila');
    paginacaoContainer.innerHTML = '';

    const inicio = (paginaAtualFila - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const itensDaPagina = fila.slice(inicio, fim);

    itensDaPagina.forEach((cliente, indexNaPagina) => {
        const indexReal = inicio + indexNaPagina;
        const itemLista = document.createElement('li');
        
        const nomeItem = document.createElement('span');
        nomeItem.className = 'item-nome';
        nomeItem.textContent = cliente.nome;
        
        if (cliente.atendido) {
            nomeItem.classList.add('atendido');
            const okIcone = document.createElement('span');
            okIcone.textContent = '✅';
            okIcone.classList.add('ok-icon');
            itemLista.appendChild(okIcone);
        }

        itemLista.appendChild(nomeItem);
        
        const botoes = document.createElement('div');
        botoes.classList.add('botoes-fila');

        const botaoEditar = document.createElement('button');
        botaoEditar.innerHTML = '✏️';
        botaoEditar.classList.add('botao-acao', 'editar');
        botaoEditar.title = 'Editar nome na fila';
        botaoEditar.addEventListener('click', function() {
            inputFila.value = cliente.nome;
            editandoFilaIndex = indexReal;
            botaoAdicionarFila.textContent = 'Salvar Alterações';
            inputFila.focus();
        });
        botoes.appendChild(botaoEditar);

        if (!cliente.atendido) {
            const botaoChamar = document.createElement('button');
            botaoChamar.innerHTML = '▶️';
            botaoChamar.title = 'Chamar cliente';
            botaoChamar.classList.add('botao-acao', 'chamar');

            botaoChamar.addEventListener('click', function() {
                fila[indexReal].atendido = true;
                salvarDados();
                renderizarFila();
                inputNome.value = cliente.nome;
            });

            botoes.appendChild(botaoChamar);
        }

        const botaoLixeira = document.createElement('button');
        botaoLixeira.innerHTML = '🗑️';
        botaoLixeira.classList.add('botao-acao', 'lixeira');
        botaoLixeira.title = 'Remover da fila';

        botaoLixeira.addEventListener('click', function() {
            fila.splice(indexReal, 1);
            salvarDados();
            renderizarFila();
        });

        botoes.appendChild(botaoLixeira);
        itemLista.appendChild(botoes);
        listaFilaElemento.appendChild(itemLista);
    });

    
    const totalPaginas = Math.ceil(fila.length / itensPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        const botaoPagina = document.createElement('button');
        botaoPagina.textContent = i;
        if (i === paginaAtualFila) {
            botaoPagina.classList.add('active');
        }
        botaoPagina.addEventListener('click', function() {
            paginaAtualFila = i;
            renderizarFila();
        });
        paginacaoContainer.appendChild(botaoPagina);
    }
}

function renderizarClientes() {
    listaClientesElemento.innerHTML = '';
    clientes.forEach((cliente, index) => {
        const itemLista = document.createElement('li');
        
        const textoCliente = document.createElement('span');
        textoCliente.textContent = `${cliente.nome} - R$ ${cliente.valor.toFixed(2)}`;
        itemLista.appendChild(textoCliente);

        const botoesContainer = document.createElement('div');

        const botaoEditar = document.createElement('button');
        botaoEditar.innerHTML = '✏️';
        botaoEditar.classList.add('botao-acao', 'editar');
        botaoEditar.title = 'Editar cliente';
        botaoEditar.addEventListener('click', function() {
            inputNome.value = cliente.nome;
            inputValor.value = cliente.valor;
            editandoIndex = index;
            botaoAdicionar.textContent = 'Salvar Alterações';
            inputNome.focus();
        });
        botoesContainer.appendChild(botaoEditar);
        
        const botaoLixeira = document.createElement('button');
        botaoLixeira.innerHTML = '🗑️';
        botaoLixeira.classList.add('botao-acao', 'lixeira');
        botaoLixeira.title = 'Excluir cliente';
        botaoLixeira.addEventListener('click', function() {
            clientes.splice(index, 1);
            salvarDados();
            renderizarClientes();
            calcularTotalDiario();
        });
        botoesContainer.appendChild(botaoLixeira);

        itemLista.appendChild(botoesContainer);
        listaClientesElemento.appendChild(itemLista);
    });
}

    function calcularTotalDiario() {
        const total = clientes.reduce((soma, cliente) => soma + cliente.valor, 0);
        totalValorElemento.textContent = total.toFixed(2);
    }

    function renderizarGanhosMensais() {
        listaGanhosMensaisElemento.innerHTML = '';
        let totalMes = 0;
        ganhosMensais.forEach((ganho, index) => {
            const itemLista = document.createElement('li');
            itemLista.textContent = `Dia ${ganho.data}: R$ ${ganho.valor.toFixed(2)}`;
            
            const botaoLixeira = document.createElement('button');
            botaoLixeira.textContent = '🗑️';
            botaoLixeira.classList.add('botao-acao');
            botaoLixeira.classList.add('lixeira');
            
            botaoLixeira.addEventListener('click', function() {
                ganhosMensais.splice(index, 1);
                salvarDados();
                renderizarGanhosMensais();
            });
            
            itemLista.appendChild(botaoLixeira);
            listaGanhosMensaisElemento.appendChild(itemLista);

            totalMes += ganho.valor;
        });
        totalMensalElemento.textContent = totalMes.toFixed(2);
    }

    
    botaoAdicionarFila.addEventListener('click', function() {
    const nomeFila = inputFila.value.trim();

    if (!nomeFila) {
        alert('Por favor, digite um nome.');
        return;
    }

    
    if (editandoFilaIndex !== null) {
        fila[editandoFilaIndex].nome = nomeFila;
        alert('Nome na fila atualizado com sucesso!');
        
    } else {
        const novoClienteFila = {
            nome: nomeFila,
            atendido: false
        };
        fila.push(novoClienteFila);
    }

    
    editandoFilaIndex = null;
    
    
    botaoAdicionarFila.textContent = 'Adicionar à Fila';

    
    salvarDados();
    renderizarFila();
    inputFila.value = '';
    inputFila.focus();
});

    botaoAdicionar.addEventListener('click', function() {
        const nomeCliente = inputNome.value;
        const valorPago = parseFloat(inputValor.value);
        
        if (!nomeCliente || isNaN(valorPago) || valorPago <= 0) {
             alert("Por favor, preencha o nome e um valor válido.");
            return;
            };

        if (editandoIndex !== null) {
            clientes[editandoIndex].nome = nomeCliente;
            clientes[editandoIndex].valor = valorPago;

            alert('Cliente atualizado com sucesso!');

            } else {
                const novoCliente = {
                    nome: nomeCliente,
                    valor: valorPago
            };
            
            clientes.push(novoCliente);
            }

            editandoIndex = null;
            botaoAdicionar.textContent = 'Adicionar';
            
            salvarDados();
            renderizarClientes();
            calcularTotalDiario();
            
            inputNome.value = '';
            inputValor.value = '';
            inputNome.focus();
            
    });
    
    botaoFinalizar.addEventListener('click', function() {
        const totalDiario = clientes.reduce((soma, cliente) => soma + cliente.valor, 0);
        if (totalDiario > 0 && confirm('Tem certeza que deseja fechar o caixa do dia e salvar o total?')) {
            const data = new Date();
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            
            ganhosMensais.push({
                valor: totalDiario,
                data: `${dia}/${mes}/${ano}`
            });
            
            clientes.length = 0;
            fila.length = 0;
            
            salvarDados();
            renderizarClientes();
            calcularTotalDiario();
            renderizarGanhosMensais();
            renderizarFila();
        } else if (totalDiario === 0) {
             alert("Não há valor para ser salvo.");
        }
    });

    botaoApagarFila.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja apagar todos os clientes da fila?')) {
            fila.length = 0;
            salvarDados();
            renderizarFila();
        }
    });

    botaoApagarGanhos.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja apagar todo o histórico de ganhos do mês?')) {
            ganhosMensais.length = 0;
            salvarDados();
            renderizarGanhosMensais();
        }
    });
    toggleGanhosBtn.addEventListener('click', function() {
    
    listaGanhosMensaisElemento.classList.toggle('escondido');
    totalMensalContainer.classList.toggle('escondido');

    
    if (listaGanhosMensaisElemento.classList.contains('escondido')) {
        toggleGanhosBtn.textContent = 'Mostrar';
    } else {
        toggleGanhosBtn.textContent = 'Ocultar';
    }
});
    

    renderizarFila();
    renderizarClientes();
    calcularTotalDiario();
    renderizarGanhosMensais();
    });