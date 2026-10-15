const contents = document.querySelectorAll('.content')
const listItems = document.querySelectorAll('nav ul li')

listItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
        hideAllContens()
        hideAllItems()

        item.classList.add('active')
        contents[idx].classList.add('show')
    })
})

function hideAllContens() {
    contents.forEach(content => content.classList.remove('show'))
}

function hideAllItems() {
    listItems.forEach(content => content.classList.remove('active'))
}