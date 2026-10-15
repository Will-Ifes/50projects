const APIURL = 'https://api.github.com/users/'

const form = document.getElementById('form')
const main = document.getElementById('main')
const search = document.getElementById('search')

// Tudo que vem da API (nome, bio, repositórios) é texto do usuário: escapar antes de pôr no HTML
const escapar = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

const numero = (n) => Number(n).toLocaleString('en-US', { notation: 'compact' })

async function buscar(url) {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (res.status === 404) throw new Error('No profile with this username')
    if (res.status === 403) throw new Error('GitHub API rate limit reached. Try again in a few minutes.')
    if (!res.ok) throw new Error(`GitHub answered with status ${res.status}`)
    return res.json()
}

async function getUser(username) {
    main.innerHTML = '<div class="card carregando" aria-busy="true"><p>Loading profile…</p></div>'
    try {
        const user = await buscar(APIURL + encodeURIComponent(username))
        createUserCard(user)
        getRepos(username)
    } catch (err) {
        // Sem rede o fetch lança TypeError, sem mensagem útil para o usuário
        createErrorCard(err instanceof TypeError ? 'Could not reach GitHub. Check your connection.' : err.message)
    }
}

async function getRepos(username) {
    const reposEl = document.getElementById('repos')
    try {
        const repos = await buscar(`${APIURL}${encodeURIComponent(username)}/repos?per_page=100&sort=updated`)
        addReposToCard(repos)
    } catch {
        reposEl.innerHTML = '<p class="repos-vazio">Could not load the repositories.</p>'
    }
}

function createUserCard(user) {
    const nome = user.name || user.login
    main.innerHTML = `
    <div class="card">
        <div class="back">
            <img src="${escapar(user.avatar_url)}" alt="" class="avatar">
        </div>
        <div class="user-info">
            <h2><a href="${escapar(user.html_url)}" target="_blank" rel="noopener noreferrer">${escapar(nome)}</a></h2>
            <p class="login">@${escapar(user.login)}</p>
            ${user.bio ? `<p>${escapar(user.bio)}</p>` : ''}
            <ul>
                <li>${numero(user.followers)} <strong>Followers</strong></li>
                <li>${numero(user.following)} <strong>Following</strong></li>
                <li>${numero(user.public_repos)} <strong>Repos</strong></li>
            </ul>
            <h3 class="repos-titulo">Top repositories by stars</h3>
            <div id="repos" aria-live="polite"><p class="repos-vazio">Loading repositories…</p></div>
        </div>
    </div>`
}

function addReposToCard(repos) {
    const reposEl = document.getElementById('repos')
    const melhores = repos
        .filter(r => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 10)

    reposEl.innerHTML = melhores.length
        ? melhores.map(repo => `
            <a class="repo" href="${escapar(repo.html_url)}" target="_blank" rel="noopener noreferrer">
                ${escapar(repo.name)}
                <span class="repo-meta">★ ${numero(repo.stargazers_count)}${repo.language ? ` · ${escapar(repo.language)}` : ''}</span>
            </a>`).join('')
        : '<p class="repos-vazio">No public repositories yet.</p>'
}

function createErrorCard(msg) {
    main.innerHTML = `<div class="card"><p class="erro" role="alert">${escapar(msg)}</p></div>`
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const user = search.value.trim()
    if (user) {
        getUser(user)
        search.value = ''
    }
})

// Abre com um perfil de exemplo para a página não começar vazia
getUser('Will-Ifes')
