// Pokédex: gerações, busca, filtro por tipo, favoritos e detalhes em <dialog>
const API = 'https://pokeapi.co/api/v2'

const GERACOES = [
    { nome: 'I · Kanto', inicio: 1, fim: 151 },
    { nome: 'II · Johto', inicio: 152, fim: 251 },
    { nome: 'III · Hoenn', inicio: 252, fim: 386 },
    { nome: 'IV · Sinnoh', inicio: 387, fim: 493 },
    { nome: 'V · Unova', inicio: 494, fim: 649 },
    { nome: 'VI · Kalos', inicio: 650, fim: 721 },
    { nome: 'VII · Alola', inicio: 722, fim: 809 },
    { nome: 'VIII · Galar', inicio: 810, fim: 905 },
    { nome: 'IX · Paldea', inicio: 906, fim: 1025 },
]

// Nome em português e cor de cada tipo
const TIPOS = {
    normal: ['Normal', '#A8A77A'], fire: ['Fogo', '#EE8130'], water: ['Água', '#6390F0'],
    electric: ['Elétrico', '#F7D02C'], grass: ['Planta', '#7AC74C'], ice: ['Gelo', '#96D9D6'],
    fighting: ['Lutador', '#C22E28'], poison: ['Venenoso', '#A33EA1'], ground: ['Terra', '#E2BF65'],
    flying: ['Voador', '#A98FF3'], psychic: ['Psíquico', '#F95587'], bug: ['Inseto', '#A6B91A'],
    rock: ['Pedra', '#B6A136'], ghost: ['Fantasma', '#735797'], dragon: ['Dragão', '#6F35FC'],
    dark: ['Sombrio', '#705746'], steel: ['Aço', '#B7B7CE'], fairy: ['Fada', '#D685AD'],
}

const ATRIBUTOS = {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Ataque esp.', 'special-defense': 'Defesa esp.', speed: 'Velocidade',
}

const container = document.getElementById('poke-container')
const status = document.querySelector('.status')
const selGeracao = document.getElementById('geracao')
const busca = document.getElementById('busca')
const selOrdem = document.getElementById('ordem')
const soFavoritos = document.getElementById('so-favoritos')
const tiposEl = document.querySelector('.tipos')
const dialogo = document.getElementById('detalhe')
const conteudo = dialogo.querySelector('.detalhe-conteudo')

const cache = new Map()          // id -> dados do Pokémon
const cacheEspecie = new Map()   // id -> dados da espécie
let lista = []                   // Pokémon da geração atual
let tipoAtivo = ''
let visiveis = []                // ordem atual, para anterior/próximo no detalhe
let favoritos = carregarFavoritos()

// ---------- utilidades ----------
const nomeBonito = (nome) => nome.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join(' ')
const numero = (id) => '#' + String(id).padStart(3, '0')
const arte = (p) => p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default
const totalStats = (p) => p.stats.reduce((s, x) => s + x.base_stat, 0)

// Texto escuro ou claro conforme a cor do tipo (contraste AA)
function corTexto(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return l > 0.22 ? '#1a1a1a' : '#ffffff'
}

function etiquetaTipo(tipo) {
    const [nome, cor] = TIPOS[tipo] || [tipo, '#888888']
    return `<span class="tipo" style="background:${cor};color:${corTexto(cor)}">${nome}</span>`
}

function carregarFavoritos() {
    try { return new Set(JSON.parse(localStorage.getItem('pokedex-favoritos') || '[]')) }
    catch { return new Set() }
}

function salvarFavoritos() {
    try { localStorage.setItem('pokedex-favoritos', JSON.stringify([...favoritos])) }
    catch { /* navegação privada: favoritos ficam só nesta sessão */ }
}

async function buscarJson(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
    return res.json()
}

async function getPokemon(id) {
    if (!cache.has(id)) cache.set(id, await buscarJson(`${API}/pokemon/${id}`))
    return cache.get(id)
}

async function getEspecie(id) {
    if (!cacheEspecie.has(id)) cacheEspecie.set(id, await buscarJson(`${API}/pokemon-species/${id}`))
    return cacheEspecie.get(id)
}

// ---------- carregamento ----------
function mostrarEsqueleto(qtd) {
    container.innerHTML = Array.from({ length: qtd }, () => '<li class="pokemon esqueleto" aria-hidden="true"></li>').join('')
}

async function carregarGeracao() {
    const g = GERACOES[selGeracao.value]
    const ids = Array.from({ length: g.fim - g.inicio + 1 }, (_, i) => g.inicio + i)
    status.textContent = `Carregando a geração ${g.nome}…`
    mostrarEsqueleto(Math.min(ids.length, 24))

    const resultados = await Promise.allSettled(ids.map(getPokemon))
    lista = resultados.filter(r => r.status === 'fulfilled').map(r => r.value)
    const falhas = resultados.length - lista.length

    if (lista.length === 0) {
        container.innerHTML = ''
        status.innerHTML = 'Não foi possível falar com a PokéAPI. <button type="button" class="tentar">Tentar de novo</button>'
        status.querySelector('.tentar').addEventListener('click', carregarGeracao)
        return
    }
    if (falhas) console.warn(`${falhas} Pokémon não carregaram nesta geração.`)
    renderizar()
}

// ---------- filtros e lista ----------
function filtrar() {
    const termo = busca.value.trim().toLowerCase().replace(/^#/, '')
    let r = lista.filter(p =>
        (!tipoAtivo || p.types.some(t => t.type.name === tipoAtivo)) &&
        (!soFavoritos.checked || favoritos.has(p.id)) &&
        (!termo || p.name.includes(termo) || String(p.id) === termo.replace(/^0+/, ''))
    )
    const ordem = selOrdem.value
    r.sort((a, b) =>
        ordem === 'nome' ? a.name.localeCompare(b.name) :
        ordem === 'total' ? totalStats(b) - totalStats(a) : a.id - b.id)
    return r
}

function card(p) {
    const tipoPrincipal = p.types[0].type.name
    const fav = favoritos.has(p.id)
    const nome = nomeBonito(p.name)
    return `
        <li class="pokemon" style="--cor:${TIPOS[tipoPrincipal]?.[1] || '#ccc'}">
            <button type="button" class="favorito" data-id="${p.id}" aria-pressed="${fav}"
                    aria-label="${fav ? 'Remover' : 'Adicionar'} ${nome} dos favoritos">${fav ? '★' : '☆'}</button>
            <button type="button" class="abrir" data-id="${p.id}">
                <span class="img-container"><img src="${arte(p)}" alt="" loading="lazy" width="120" height="120"></span>
                <span class="info">
                    <span class="number">${numero(p.id)}</span>
                    <span class="name">${nome}</span>
                </span>
            </button>
            <span class="tipos-card">${p.types.map(t => etiquetaTipo(t.type.name)).join('')}</span>
        </li>`
}

function renderizar() {
    visiveis = filtrar()
    container.innerHTML = visiveis.map(card).join('')
    const g = GERACOES[selGeracao.value].nome
    status.textContent = visiveis.length
        ? `${visiveis.length} Pokémon na geração ${g}${tipoAtivo ? ` do tipo ${TIPOS[tipoAtivo][0]}` : ''}.`
        : 'Nenhum Pokémon encontrado com esses filtros.'
}

function montarFiltros() {
    selGeracao.innerHTML = GERACOES.map((g, i) => `<option value="${i}">${g.nome}</option>`).join('')
    tiposEl.innerHTML = `<button type="button" class="filtro-tipo" data-tipo="" aria-pressed="true">Todos</button>` +
        Object.entries(TIPOS).map(([k, [nome, cor]]) =>
            `<button type="button" class="filtro-tipo" data-tipo="${k}" aria-pressed="false" style="--cor:${cor};--texto:${corTexto(cor)}">${nome}</button>`
        ).join('')
}

// ---------- detalhe ----------
async function evolucoes(especie) {
    const cadeia = await buscarJson(especie.evolution_chain.url)
    const nomes = []
    const percorrer = (no) => { nomes.push(no.species); no.evolves_to.forEach(percorrer) }
    percorrer(cadeia.chain)
    return nomes.map(s => ({ nome: s.name, id: Number(s.url.split('/').filter(Boolean).pop()) }))
}

function descricao(especie) {
    const textos = especie.flavor_text_entries
    const pt = textos.find(t => t.language.name === 'pt-br' || t.language.name === 'pt')
    const en = textos.find(t => t.language.name === 'en')
    const escolhido = pt || en
    return escolhido
        ? { texto: escolhido.flavor_text.replace(/[\f\n\r]/g, ' '), lang: pt ? 'pt-BR' : 'en' }
        : null
}

async function abrirDetalhe(id) {
    if (!dialogo.open) dialogo.showModal()
    conteudo.innerHTML = '<p class="carregando">Carregando…</p>'

    try {
        const p = await getPokemon(id)
        const especie = await getEspecie(id)
        const desc = descricao(especie)
        const evo = await evolucoes(especie).catch(() => [])
        const cor = TIPOS[p.types[0].type.name]?.[1] || '#ccc'
        const pos = visiveis.findIndex(x => x.id === p.id)
        const anterior = visiveis[pos - 1]
        const proximo = visiveis[pos + 1]
        const grito = p.cries?.latest

        conteudo.style.setProperty('--cor', cor)
        conteudo.innerHTML = `
            <div class="detalhe-topo">
                <button type="button" class="fechar" aria-label="Fechar detalhes">×</button>
                <img src="${arte(p)}" alt="Arte oficial de ${nomeBonito(p.name)}" width="220" height="220">
            </div>
            <div class="detalhe-corpo">
                <p class="number">${numero(p.id)}</p>
                <h2 id="detalhe-nome">${nomeBonito(p.name)}</h2>
                <p class="tipos-card">${p.types.map(t => etiquetaTipo(t.type.name)).join('')}</p>
                ${desc ? `<p class="descricao" lang="${desc.lang}">${desc.texto}</p>` : ''}

                <dl class="medidas">
                    <div><dt>Altura</dt><dd>${(p.height / 10).toLocaleString('pt-BR')} m</dd></div>
                    <div><dt>Peso</dt><dd>${(p.weight / 10).toLocaleString('pt-BR')} kg</dd></div>
                    <div><dt>Habilidades</dt><dd>${p.abilities.map(a => nomeBonito(a.ability.name) + (a.is_hidden ? ' (oculta)' : '')).join(', ')}</dd></div>
                </dl>

                <h3>Atributos base</h3>
                <ul class="stats">
                    ${p.stats.map(s => `
                        <li>
                            <span class="stat-nome">${ATRIBUTOS[s.stat.name] || s.stat.name}</span>
                            <span class="stat-valor">${s.base_stat}</span>
                            <span class="barra" aria-hidden="true"><span style="width:${Math.min(100, s.base_stat / 2)}%"></span></span>
                        </li>`).join('')}
                    <li class="stat-total"><span class="stat-nome">Total</span><span class="stat-valor">${totalStats(p)}</span></li>
                </ul>

                ${evo.length > 1 ? `
                    <h3>Evoluções</h3>
                    <ol class="evolucoes">
                        ${evo.map(e => `<li><button type="button" class="ir" data-id="${e.id}" ${e.id === p.id ? 'aria-current="true"' : ''}>
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.id}.png" alt="" width="72" height="72" loading="lazy">
                            ${nomeBonito(e.nome)}</button></li>`).join('')}
                    </ol>` : ''}

                <div class="detalhe-acoes">
                    ${grito ? `<button type="button" class="grito" data-src="${grito}">🔊 Ouvir o grito</button>` : ''}
                    <span class="navegar">
                        <button type="button" class="ir" ${anterior ? `data-id="${anterior.id}"` : 'disabled'} aria-label="Pokémon anterior">‹ Anterior</button>
                        <button type="button" class="ir" ${proximo ? `data-id="${proximo.id}"` : 'disabled'} aria-label="Próximo Pokémon">Próximo ›</button>
                    </span>
                </div>
            </div>`
        conteudo.querySelector('.fechar').focus()
    } catch (erro) {
        console.error(erro)
        conteudo.innerHTML = `<p class="carregando">Não foi possível carregar os detalhes.</p>
            <button type="button" class="fechar">Fechar</button>`
    }
}

// ---------- eventos ----------
container.addEventListener('click', (e) => {
    const fav = e.target.closest('.favorito')
    if (fav) {
        const id = Number(fav.dataset.id)
        favoritos.has(id) ? favoritos.delete(id) : favoritos.add(id)
        salvarFavoritos()
        const ativo = favoritos.has(id)
        const nome = fav.getAttribute('aria-label').replace(/^(Remover|Adicionar) | dos favoritos$/g, '')
        fav.setAttribute('aria-pressed', String(ativo))
        fav.setAttribute('aria-label', `${ativo ? 'Remover' : 'Adicionar'} ${nome} dos favoritos`)
        fav.textContent = ativo ? '★' : '☆'
        if (soFavoritos.checked) renderizar()
        return
    }
    const abrir = e.target.closest('.abrir')
    if (abrir) abrirDetalhe(Number(abrir.dataset.id))
})

conteudo.addEventListener('click', (e) => {
    if (e.target.closest('.fechar')) return dialogo.close()
    const ir = e.target.closest('.ir[data-id]')
    if (ir) return abrirDetalhe(Number(ir.dataset.id))
    const grito = e.target.closest('.grito')
    if (grito) new Audio(grito.dataset.src).play().catch(() => {})
})

// Clicar fora do conteúdo fecha o diálogo
dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close() })

tiposEl.addEventListener('click', (e) => {
    const b = e.target.closest('.filtro-tipo')
    if (!b) return
    tipoAtivo = b.dataset.tipo
    tiposEl.querySelectorAll('.filtro-tipo').forEach(x => x.setAttribute('aria-pressed', String(x === b)))
    renderizar()
})

busca.addEventListener('input', renderizar)
selOrdem.addEventListener('change', renderizar)
soFavoritos.addEventListener('change', renderizar)
selGeracao.addEventListener('change', carregarGeracao)
document.querySelector('.controles').addEventListener('submit', (e) => e.preventDefault())

montarFiltros()
carregarGeracao()
