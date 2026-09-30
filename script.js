let totalGasto = 0;
let quantidadeComprovantes = 0;

async function lerFoto() {
    const inputFoto = document.querySelector('.foto');
    const elementoValorTotal = document.getElementById('valor-total');
    const elementoQtdComprovantes = document.getElementById('qtd-comprovantes');
    const elementoResultado = document.getElementById('resultado');

    if (!elementoValorTotal || !elementoQtdComprovantes || !elementoResultado) {
        console.error("Erro: Elementos do HTML não foram localizados.");
        return;
    }

    const arquivo = inputFoto.files[0];
    if (!arquivo) return;

    const textoOriginalValor = elementoValorTotal.innerText;
    elementoValorTotal.innerText = "Lendo comprovante...";

    try {
        const prompt = `Analise esta imagem de recibo e extraia as informações.
Retorne APENAS um objeto JSON no formato:
{
    "estabelecimento": "Nome da loja",
    "data": "DD/MM/AAAA",
    "valor": 0.00
}`;

        const resposta = await puter.ai.chat(prompt, arquivo);

        let textoResposta = typeof resposta === "string" ? resposta : (resposta.text || String(resposta));

        const inicioJson = textoResposta.indexOf('{');
        const fimJson = textoResposta.lastIndexOf('}') + 1;
        const textoJson = textoResposta.substring(inicioJson, fimJson);

        const dados = JSON.parse(textoJson);

        if (dados.valor && dados.valor > 0) {
            totalGasto += parseFloat(dados.valor);
            quantidadeComprovantes += 1;

            elementoValorTotal.innerText = `R$ ${totalGasto.toFixed(2).replace('.', ',')}`;
            elementoQtdComprovantes.innerText = `${quantidadeComprovantes} comprovante(s) lido(s)`;

            const blocorecibo = `
                <div class="card-recibo">
                    <p class="titulo-sucesso"> Recibo Lido com Sucesso!</p>
                    <p><strong>Local:</strong> ${dados.estabelecimento || 'Não identificado'}</p>
                    <p><strong>Data:</strong> ${dados.data || 'Não identificada'}</p>
                    <p><strong>Valor:</strong> R$ ${parseFloat(dados.valor).toFixed(2).replace('.', ',')}
                </div>
            `;

            elementoResultado.insertAdjacentHTML('afterbegin', blocorecibo);

        } else {
            elementoResultado.insertAdjacentHTML('afterbegin', `
                <div class="mensagem-aviso">
                    ⚠️ Não foi possível identificar o valor deste comprovante.
                </div>
            `);
            elementoValorTotal.innerText = textoOriginalValor;
        }

    } catch (erro) {
        console.error("Erro no processamento:", erro);
        elementoResultado.insertAdjacentHTML('afterbegin', `
            <div class="mensagem-erro">
                Ocorreu um erro ao processar a imagem. Tente novamente.
            </div>
        `);
        elementoValorTotal.innerText = textoOriginalValor;

    } finally {
        inputFoto.value = '';
    }
}