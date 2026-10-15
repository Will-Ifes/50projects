const container = document.getElementById('container')
const colors = ['green', 'orange', 'yellow', 'red', 'blue', 'white', 'pick', 'gray', 'brwon', 'purple', 'aqua', 'aquamarine', 'palevioletred']
const SQUARES = 400

for(let i = 0; i < SQUARES; i++) {
    const square = document.createElement('div')
    square.classList.add('square')

    square.addEventListener('mouseover', () => setColor(square))

    square.addEventListener('mouseout', () => removeColor(square))

    container.appendChild(square)
}

function setColor(element) {
    const color = getRandomColr()
    element.style.background = color
    element.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`

}

function removeColor(element) {
    element.style.background = '#1d1d1d'
    element.style.boxShadow = '0 0 2px #000'
}

function getRandomColr() {
    return colors[Math.floor(Math.random() * colors.length)]
}