// Chave pública que veio do curso; já estava no repositório. Para uso próprio, gere a sua em themoviedb.org.
const API_KEY = '0bcc49e19e18f892f0c1751eb31a7f72'
const BASE = 'https://api.themoviedb.org/3'
const IMG_PATH = 'https://image.tmdb.org/t/p/w500'
const POPULARES = `${BASE}/discover/movie?sort_by=popularity.desc&language=pt-BR&page=1&api_key=${API_KEY}`
const busca = (termo) => `${BASE}/search/movie?language=pt-BR&query=${encodeURIComponent(termo)}&api_key=${API_KEY}`

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')

// Título e sinopse vêm da API: escapar antes de pôr no HTML
const escapar = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

function aviso(texto) {
    main.innerHTML = `<p class="aviso-filmes" role="status">${escapar(texto)}</p>`
}

async function getMovies(url, termo = '') {
    aviso('Carregando filmes…')
    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`TMDB respondeu ${res.status}`)
        const data = await res.json()
        if (!data.results.length) return aviso(`Nenhum filme encontrado para "${termo}".`)
        showMovies(data.results)
    } catch (erro) {
        console.error(erro)
        aviso('Não foi possível carregar os filmes agora. Tente de novo em instantes.')
    }
}

function showMovies(movies) {
    main.innerHTML = movies.map(({ title, poster_path, vote_average, overview, release_date }) => {
        const nota = vote_average ? vote_average.toFixed(1) : '–'
        const ano = release_date ? release_date.slice(0, 4) : ''
        const poster = poster_path
            ? `<img src="${IMG_PATH + poster_path}" alt="" loading="lazy">`
            : `<div class="sem-poster" aria-hidden="true">Sem pôster</div>`
        return `
        <article class="movie" tabindex="0">
            ${poster}
            <div class="movie-info">
                <h3 aria-level="2">${escapar(title)}${ano ? ` <small>(${ano})</small>` : ''}</h3>
                <span class="${getClassByRate(vote_average)}" aria-label="Nota ${nota} de 10">${nota}</span>
            </div>
            <div class="overview">
                <h3 aria-level="3">Sinopse</h3>
                ${overview ? escapar(overview) : 'Sinopse não disponível em português.'}
            </div>
        </article>`
    }).join('')
}

function getClassByRate(vote) {
    if (vote >= 8) return 'green'
    if (vote >= 5) return 'orange'
    return 'red'
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const termo = search.value.trim()
    termo ? getMovies(busca(termo), termo) : getMovies(POPULARES)
})

getMovies(POPULARES)
