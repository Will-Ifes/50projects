const header = document.getElementById('header')
const title = document.getElementById('title')
const excerpt = document.getElementById('excerpt')
const profile_img = document.getElementById('profile-img')
const name1 = document.getElementById('name')
const date = document.getElementById('date')

const animated_bgs = document.querySelectorAll('animated-bg') 
const animated_bg_texts= document.querySelectorAll('animated-bg-text') 

setTimeout(getDate, 1500)

function getDate()  {
    header.innerHTML = '<img src="https://s2.glbimg.com/GrK5pKKr7-2BDMiwlM2X_qgpTto=/0x0:1280x720/924x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2020/d/D/m4GCDJSHArcWvSqUw2Ag/computador-de-mesa-o-que-observar.png" alt="imagem de um computadpr sobre uma mesa">'
    title.innerHTML = 'Lorem ipsum dolor sit amet.'
    excerpt.innerHTML = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, nesciunt!'
    profile_img.innerHTML = '<img src="https://randomuser.me/api/portraits/men/45.jpg" alt="">'
    name1.innerHTML = 'John Doe'
    date.innerHTML = 'Oct 08, 2020'

    animated_bgs.forEach(bg => bg.classList.remove('animated-bg'))
    animated_bg_texts.forEach(bg => bg.classList.remove('animated-bg-text'))
}