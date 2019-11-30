const socket = io()
const nameInput = document.getElementById('name-input')
const joinButton = document.getElementById('join-button')

if (localStorage.name) {
    nameInput.value = localStorage.name
}

nameInput.addEventListener('change', storageName);
joinButton.addEventListener('click', submitNameForm)

function storageName(e) {
    e.preventDefault()
    const { value } = nameInput

    if (!localStorage.name) {
        localStorage.setItem('name', '')
    }

    localStorage.name = value
}

function submitNameForm(e) {
    e.preventDefault()

    const { name } = localStorage
    const id = location.href.split('/')[3]

    const data = {
        name,
        id
    }

    socket.emit('game-connect', data)
}

socket.on('redirect', id => {
    window.history.pushState(false, false, `/${id}`) 
})

socket.on('show-login-container', () => {
    document.getElementById('login-container').style.display = 'block'
})

socket.on('hide-login-container', () => {
    document.getElementById('login-container').style.display = 'none'
})

socket.on('show-max-limit', () => {
    document.getElementById('max-limit').style.display = 'block'
})

socket.on('hide-max-limit', () => {
    document.getElementById('max-limit').style.display = 'none'
})