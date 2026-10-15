const resultEl = document.getElementById('result')
const lengthEl = document.getElementById('length')
const uppercaseEl = document.getElementById('uppercase')
const lowercaseEl = document.getElementById('lowercase')
const numbersEl = document.getElementById('numbers')
const symbolsEl = document.getElementById('symbols')
const generateEl = document.getElementById('generate')
const clipboardEl = document.getElementById('clipboard')
const forcaPreenchimento = document.getElementById('forca-preenchimento')
const forcaTexto = document.getElementById('forca-texto')
const copiaStatus = document.getElementById('copia-status')

const CONJUNTOS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    number: '0123456789',
    symbol: '!@#$%^&*()[]{}=<>/,.-_',
}

// Inteiro aleatório em [0, max) com o gerador criptográfico do navegador.
// Descarta valores acima do maior múltiplo de max para não enviesar o resultado.
function aleatorio(max) {
    const limite = Math.floor(0xffffffff / max) * max
    const buf = new Uint32Array(1)
    do { crypto.getRandomValues(buf) } while (buf[0] >= limite)
    return buf[0] % max
}

const sortear = (texto) => texto[aleatorio(texto.length)]

function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = aleatorio(i + 1)
        ;[lista[i], lista[j]] = [lista[j], lista[i]]
    }
    return lista
}

// Garante ao menos um caractere de cada tipo escolhido e embaralha o resto,
// em vez de repetir sempre a sequência minúscula, maiúscula, número, símbolo.
function generatePassword(tipos, length) {
    if (tipos.length === 0) return ''
    const todos = tipos.map(t => CONJUNTOS[t]).join('')
    const obrigatorios = tipos.map(t => sortear(CONJUNTOS[t]))
    const resto = Array.from({ length: Math.max(0, length - obrigatorios.length) }, () => sortear(todos))
    return embaralhar([...obrigatorios, ...resto]).join('')
}

// Força estimada pela entropia: comprimento × log2(tamanho do alfabeto)
function atualizarForca(senha, tipos) {
    const alfabeto = tipos.reduce((n, t) => n + CONJUNTOS[t].length, 0)
    const bits = senha ? Math.round(senha.length * Math.log2(alfabeto)) : 0
    const [nivel, cor, pct] =
        bits === 0 ? ['-', '#555', 0] :
        bits < 40 ? ['Weak', '#ef4444', 25] :
        bits < 60 ? ['Fair', '#f59e0b', 50] :
        bits < 80 ? ['Strong', '#22c55e', 75] :
        ['Very strong', '#16a34a', 100]
    forcaPreenchimento.style.width = pct + '%'
    forcaPreenchimento.style.background = cor
    forcaTexto.textContent = bits ? `Strength: ${nivel} (~${bits} bits)` : 'Strength: select at least one option'
}

function gerar() {
    const length = Math.min(64, Math.max(4, +lengthEl.value || 20))
    lengthEl.value = length
    const tipos = [
        lowercaseEl.checked && 'lower',
        uppercaseEl.checked && 'upper',
        numbersEl.checked && 'number',
        symbolsEl.checked && 'symbol',
    ].filter(Boolean)

    const senha = generatePassword(tipos, length)
    resultEl.innerText = senha
    atualizarForca(senha, tipos)
    copiaStatus.textContent = ''
}

clipboardEl.addEventListener('click', async () => {
    const password = resultEl.innerText
    if (!password) return
    try {
        await navigator.clipboard.writeText(password)
        copiaStatus.textContent = 'Password copied to clipboard!'
    } catch {
        copiaStatus.textContent = 'Could not copy automatically. Select the password and copy it manually.'
    }
})

generateEl.addEventListener('click', gerar)
gerar()
