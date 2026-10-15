// Busca e filtro por categoria da vitrine. Sem JS, todos os cards continuam visíveis.
const busca = document.getElementById('busca');
const filtros = document.querySelectorAll('.filtro');
const cards = [...document.querySelectorAll('.card')];
const resultado = document.querySelector('.resultado');
let categoria = '';

// Remove acentos para "animacao" achar "Animação"
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
cards.forEach((card) => { card.dataset.busca = normalizar(card.dataset.busca); });

function aplicar() {
    const termo = normalizar(busca.value.trim());
    let visiveis = 0;

    for (const card of cards) {
        const passaCategoria = !categoria
            || (categoria === '__melhorado' ? card.dataset.melhorado === 'true' : card.dataset.categoria === categoria)
        const passa = passaCategoria
            && (!termo || card.dataset.busca.includes(termo));
        card.hidden = !passa;
        if (passa) visiveis += 1;
    }

    resultado.textContent = visiveis === 0
        ? 'Nenhum projeto encontrado. Tente outro termo ou categoria.'
        : `${visiveis} ${visiveis === 1 ? 'projeto' : 'projetos'}${
            categoria === '__melhorado' ? ' melhorados em 2026' : categoria ? ` em ${categoria}` : ''}`;
}

busca.addEventListener('input', aplicar);

filtros.forEach((botao) => {
    botao.addEventListener('click', () => {
        categoria = botao.dataset.filtro;
        filtros.forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
        aplicar();
    });
});

aplicar();
