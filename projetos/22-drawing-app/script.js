const canvas = document.getElementById('canvas')
const increaseBtn = document.getElementById('increase')
const decreaseBtn = document.getElementById('decrease')
const sizeEl = document.getElementById('size')
const colorEl = document.getElementById('color')
const clearEl = document.getElementById('clear')
const saveEl = document.getElementById('save')

const ctx = canvas.getContext('2d')
ctx.lineCap = 'round'
ctx.lineJoin = 'round'

let size = 10
let color = colorEl.value || '#000000'
let anterior = null

// O canvas pode estar reduzido pelo CSS; converte a posição do ponteiro para pixels do canvas
function ponto(e) {
    const r = canvas.getBoundingClientRect()
    return {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height),
    }
}

function drawCircle({ x, y }) {
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
}

function drawLine(a, b) {
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.strokeStyle = color
    ctx.lineWidth = size * 2
    ctx.stroke()
}

// Pointer events cobrem mouse, toque e caneta com o mesmo código
canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId)
    anterior = ponto(e)
    drawCircle(anterior)
})

canvas.addEventListener('pointermove', (e) => {
    if (!anterior) return
    const atual = ponto(e)
    drawLine(anterior, atual)
    anterior = atual
})

const parar = () => { anterior = null }
canvas.addEventListener('pointerup', parar)
canvas.addEventListener('pointercancel', parar)

function mudarTamanho(delta) {
    size = Math.min(50, Math.max(5, size + delta))
    sizeEl.innerText = size
}

increaseBtn.addEventListener('click', () => mudarTamanho(5))
decreaseBtn.addEventListener('click', () => mudarTamanho(-5))
colorEl.addEventListener('input', (e) => { color = e.target.value })
clearEl.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height))

// Salva com fundo branco (o canvas é transparente onde não houve traço)
saveEl.addEventListener('click', () => {
    const copia = document.createElement('canvas')
    copia.width = canvas.width
    copia.height = canvas.height
    const c = copia.getContext('2d')
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, copia.width, copia.height)
    c.drawImage(canvas, 0, 0)
    const link = document.createElement('a')
    link.download = 'meu-desenho.png'
    link.href = copia.toDataURL('image/png')
    link.click()
})
