import './style.css';
import type { Categoria, Despesa } from "./types";


const CATEGORIAS: Categoria[] = [
    "Alimentos",
    "Transporte",
    "Lazer",
    "Saude",
    "Cartao",
    "Outros",
];

const NOMES_CATEGORIAS: Record<Categoria, string> = {
    Alimentos: "Alimentos",
    Transporte: "Transporte",
    Lazer: "Lazer",
    Saude: "Saúde",
    Cartao: "Cartão de Crédito",
    Outros: "Outros",
};

let despesas: Despesa[] = [];


function obterElemento<T extends HTMLElement>(seletor: string): T {
    const elemento = document.querySelector<T>(seletor);

    if (elemento === null) {
        throw new Error(`Elemento não encontrado: ${seletor}`);
    }

    return elemento;
}

const formularioNovaDespesa = obterElemento<HTMLFormElement>("#formNovaDespesa");
const campoTituloDespesa = obterElemento<HTMLInputElement>("#tituloDespesa");
const campoValorDespesa = obterElemento<HTMLInputElement>("#valorDespesa");
const campoCategoriaDespesa = obterElemento<HTMLSelectElement>("#categoriaDespesa");
const mensagemErroValidacao = obterElemento<HTMLParagraphElement>("#mensagemErroValidacao");
const listaDespesas = obterElemento<HTMLUListElement>("#listaDespesas");
const mensagemListaVazia = obterElemento<HTMLParagraphElement>("#mensagemListaVazia");
const elementoSomaTotal = obterElemento<HTMLElement>("#somaTotalDespesas");
const listaTotaisCategoria = obterElemento<HTMLUListElement>("#totaisPorCategoria");


function gerarIdDespesa(): string {
    return crypto.randomUUID();
}


function formatarValorMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function somarValoresDaLista(lista: Despesa[]): number {
    return lista.reduce((soma, despesa) => soma + despesa.valor, 0);
}

function calcularTotaisPorCategoria(
    lista: Despesa[]
): Record<Categoria, number> {
    const totais: Record<Categoria, number> = {
        Alimentos: 0,
        Transporte: 0,
        Lazer: 0,
        Saude: 0,
        Cartao: 0,
        Outros: 0,
    };

    for (const despesa of lista) {
        totais[despesa.categoria] = totais[despesa.categoria] + despesa.valor;
    }

    return totais;
}

function adicionarDespesa(
    titulo: string,
    valor: number,
    categoria: Categoria
): Despesa | null {
    const tituloLimpo = titulo.trim();

    if (tituloLimpo.length === 0) {
        return null;
    }

    if (valor <= 0) {
        return null;
    }

    const despesa: Despesa = {
        id: gerarIdDespesa(),
        titulo: tituloLimpo,
        valor: valor,
        categoria: categoria,
    };

    despesas = [...despesas, despesa];

    return despesa;
}

function validarFormulario(
    titulo: string,
    valor: string,
    categoria: string
): string | null {
    if (titulo.trim().length === 0) {
        return "Informe um título para a despesa.";
    }

    const valorNumerico: number = Number(valor);

    if (
        valor.trim().length === 0 ||
        Number.isNaN(valorNumerico) ||
        valorNumerico <= 0
    ) {
        return "Informe um valor válido para a despesa.";
    }

    if (!CATEGORIAS.includes(categoria as Categoria)) {
        return "Selecione uma categoria.";
    }

    return null;
}

function exibirMensagemErro(mensagem: string | null): void {
    if (mensagem === null) {
        mensagemErroValidacao.hidden = true;
        return;
    }

    mensagemErroValidacao.textContent = mensagem;
    mensagemErroValidacao.hidden = false;
}

function limparFormulario(): void {
    campoTituloDespesa.value = "";
    campoValorDespesa.value = "";
    campoCategoriaDespesa.value = "";
}

function criarItemDespesa(despesa: Despesa): HTMLLIElement {
    const item: HTMLLIElement = document.createElement("li");
    item.className = "despesa";
    item.dataset.idDespesa = despesa.id;

    const titulo = document.createElement("span");
    titulo.className = "despesa__titulo";
    titulo.textContent = despesa.titulo;

    const categoria = document.createElement("span");
    categoria.className = "despesa__categoria";
    categoria.textContent = NOMES_CATEGORIAS[despesa.categoria];

    const valor = document.createElement("span");
    valor.className = "despesa__valor";
    valor.textContent = formatarValorMoeda(despesa.valor);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "despesa__botao-excluir";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.setAttribute(
        "aria-label",
        `Excluir despesa: ${despesa.titulo}`
    );

    item.append(titulo, categoria, valor, botaoExcluir);

    return item;
}

function atualizarListaDespesas(): void {
    listaDespesas.textContent = "";

    if (despesas.length === 0) {
        mensagemListaVazia.hidden = false;
        return;
    }

    mensagemListaVazia.hidden = true;

    for (const despesa of despesas) {
        listaDespesas.append(criarItemDespesa(despesa));
    }
}

function atualizarResumo(): void {
    const somaTotal = somarValoresDaLista(despesas);
    elementoSomaTotal.textContent = formatarValorMoeda(somaTotal);

    const totais = calcularTotaisPorCategoria(despesas);

    listaTotaisCategoria.textContent = "";

    for (const categoria of CATEGORIAS) {
        const itemCategoria = document.createElement("li");

        const nomeCategoria = document.createElement("span");
        nomeCategoria.textContent = NOMES_CATEGORIAS[categoria];

        const valorCategoria = document.createElement("strong");
        valorCategoria.textContent = formatarValorMoeda(totais[categoria]);

        itemCategoria.append(nomeCategoria, valorCategoria);
        listaTotaisCategoria.append(itemCategoria);
    }
}

function aoEnviarFormulario(evento: Event): void {
    evento.preventDefault();

    const tituloInformado = campoTituloDespesa.value;
    const valorInformado = campoValorDespesa.value;
    const categoriaInformada = campoCategoriaDespesa.value;

    const mensagemErro = validarFormulario(
        tituloInformado,
        valorInformado,
        categoriaInformada
    );

    if (mensagemErro !== null) {
        exibirMensagemErro(mensagemErro);
        return;
    }

    exibirMensagemErro(null);

    adicionarDespesa(
        tituloInformado,
        Number(valorInformado),
        categoriaInformada as Categoria
    );

    limparFormulario();
    atualizarListaDespesas();
    atualizarResumo();
}

function excluirDespesa(idDespesa: string): void {
    despesas = despesas.filter((despesa) => despesa.id !== idDespesa);
}

function aoClicarExcluirDespesa(evento: Event): void {
    const botaoExcluir = (evento.target as HTMLElement).closest<HTMLButtonElement>(
        ".despesa__botao-excluir"
    );

    if (botaoExcluir === null) {
        return;
    }

    const itemDespesa = botaoExcluir.closest<HTMLLIElement>(".despesa");
    const idDespesa = itemDespesa?.dataset.idDespesa;

    if (idDespesa === undefined) {
        return;
    }

    excluirDespesa(idDespesa);
    atualizarListaDespesas();
    atualizarResumo();
}

function iniciarPainel(): void {
    formularioNovaDespesa.addEventListener("submit", aoEnviarFormulario);
    listaDespesas.addEventListener("click", aoClicarExcluirDespesa);

    atualizarResumo();
    atualizarListaDespesas();
}

iniciarPainel();