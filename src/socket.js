module.exports = (io) => {
    const Room = require('./models/Room')
    const playerLimit = 6
    const rooms = []

    io.on('connection', socket => {
        socket.on('ask-for-room', RoomId => {
            if (!rooms[RoomId] && RoomId !== '') {
                socket.emit('show-invalid-room-message')
                socket.emit('hide-login-container')
            }
        })

        socket.on('game-connect', data => {
            socket.emit('show-login-container')
            socket.emit('hide-max-limit')

            let { name, id } = data

            if (!name) {
                return socket.emit('redirect', '')
            }

            if (!rooms[id]) {
                id = makeId()
                rooms[id] = new Room
                socket.emit('redirect', id)
            }

            rooms[id].addPlayer(name, socket.id)

            const clientsCount = Object.keys(rooms[id].players).length

            if (playerLimit < clientsCount) {
                socket.emit('show-max-limit')
                socket.emit('hide-login-container')

                rooms[id].removePlayer(socket.id)
                return socket.conn.close()
            }

            socket.emit('hide-login-container')
        })

        socket.on('disconnect', () => {
            const roomId = findPlayerRoom(socket.id)

            if (roomId) {
                rooms[roomId].removePlayer(socket.id)
            }
        })

        socket.on('draw-card', () => {
            const roomId = findPlayerRoom(socket.id)
            
            if (!roomId) {
                return // Unexpected ERROR
            }

            const room = rooms[roomId]
            const playerTurn = verifyTurn(room, socket.id)

            if (!playerTurn) {
                return // Wait for your turn
            }

            const card = rooms[roomId].drawCard()
            rooms[roomId].players[socket.id].cards.push(card)
        })
    })

    function makeId() {
        let result = ''

        for (let i = 0; i < 5; i++) {
            result += Math.floor(Math.random() * 10)
        }

        return result
    }

    function findPlayerRoom(SocketId) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i] && rooms[i].players[SocketId]) {
                return i
            }
        }

        return false
    }

    function verifyTurn(room, SocketId) {
        const players = Object.keys(room.players)
        const currentPosition = room.currentPlayer
        const playerPosition = players.indexOf(SocketId)

        return (playerPosition == currentPosition)
    }
}