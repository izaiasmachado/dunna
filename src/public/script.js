const socket = io()
const nameInput = document.getElementById('name-input')
const joinButton = document.getElementById('join-button')

window.addEventListener('load', pageInitialization)
nameInput.addEventListener('change', storageName)
joinButton.addEventListener('click', submitNameForm)

function pageInitialization() {
    socket.emit('ask-for-room', getCurrentRoom())

    if (localStorage.name)
        nameInput.value = localStorage.name
}

function getCurrentRoom() {
    const room = window.location.href.split('/')[3]

    return room
}

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

socket.on('show-invalid-room-message', () => {
    document.getElementById('invalid-room').style.display = 'block'
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
