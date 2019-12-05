const socket = io()
const nameInput = document.getElementById('name-input')
const joinButton = document.getElementById('join-button')
const drawButton = document.getElementById('draw-button')
const exitButton = document.getElementById('exit-button')

window.addEventListener('load', pageInitialization)
nameInput.addEventListener('change', storageName)
joinButton.addEventListener('click', submitNameForm)
drawButton.addEventListener('click', () => socket.emit('draw-from-deck'))
exitButton.addEventListener('click', () => {
    window.location.href = window.location.origin
})

function pageInitialization() {
    socket.emit('ask-for-room', getCurrentRoom())

    if (localStorage.name) {
        nameInput.value = localStorage.name
    }
}

function getCurrentRoom() {
    const roomId = window.location.href.split('/')[3]

    return roomId
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

function deleteWildButtons() {
    const wildButtonsContent = document.getElementById('wild-buttons')
    wildButtonsContent.innerHTML = ''
}

socket.on('show-wild-buttons', data => {
    deleteWildButtons()

    const cardPosition = data
    const wildButtonsContent = document.getElementById('wild-buttons')

    const colors = ['blue', 'red', 'yellow', 'green']

    for (let i = 0; i < 4; i++) {
        const newButton = document.createElement("button")
        newButton.onclick = () => {
            socket.emit('choose-wild-color', {
                suit: colors[i],
                cardPosition
            })
        }

        newButton.innerText = colors[i]
        wildButtonsContent.appendChild(newButton)
    }
})

socket.on('hide-wild-buttons', () => {
    deleteWildButtons()
})

socket.on('server-alert', data => alert(data))

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

socket.on('show-game-container', () => {
    document.getElementById('game-container').style.display = 'block'
})