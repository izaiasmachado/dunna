module.exports = (io) => {
    const Room = require('./models/Room')
    const playerLimit = 6
    const rooms = []

    io.on('connection', socket => {
        socket.on('ask-for-room', roomId => {
            if (!rooms[roomId] && roomId !== '') {
                socket.emit('show-invalid-room-message')
                socket.emit('hide-login-container')
            }
        })

        socket.on('game-connect', data => {
            socket.emit('show-login-container')
            socket.emit('hide-max-limit')

            let { name, id } = data

            if (!name) {
                return // Type your name
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
            // Send game status
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

            // Send game status
        })

        socket.on('send-play', cardPosition => {
            makePlay(cardPosition)
        })
        
        function makePlay(cardPosition) {
            const roomId = findPlayerRoom(socket.id)
            const room = rooms[roomId]
            
            if (!room) {
                return // Unexpected ERROR
            }

            const player = room.players[socket.id]

            if (!player) {
                return // Unexpected ERROR
            }

            const playerTurn = verifyTurn(room, socket.id)
            const card = player.cards[cardPosition]

            if (!playerTurn) {
                return // Wait for your turn to play
            }

            if (card.wild && !card.suit) {
                return  // Show wild buttons
            }

            const normalCondition = (((room.topCard.suit == card.suit) || (room.topCard.value == card.value)) && !card.wild)
            const wildCondition = ((card.wild && card.suit) || (room.topCard.wild && (room.topCard.suit == card.suit)))

            if (!normalCondition && !wildCondition) {
                return // Choose a valid card
            }

            rooms[roomId].players[socket.id].cards.splice(cardPosition, 1)
            rooms[roomId].returnCard(rooms[roomId].topCard)
            rooms[roomId].topCard = card

            gamePattern(roomId)
            // Send game status
        }

        function gamePattern(roomId) {
            const room = rooms[roomId]
            const { topCard } = rooms[roomId]

            if (topCard.value == 'draw') {
                rooms[roomId].nextPlayer()

                const quantity = game.topCard.quantity
                const position = rooms[roomId].currentPlayer
                const players = Object.keys(room.players)

                for (let i = 0; i < quantity; i++) {
                    const playerId = players[position]
                    const card = drawCard()

                    if (!card) {
                        return // Unexpected ERROR
                    }

                    rooms[roomId].player[playerId].push(card)
                }
            }

            if (topCard.value == 'reverse') {
                rooms[roomId].reverse()
            }

            if (topCard.value == 'skip') {
                rooms[roomId].nextPlayer()
            }

            rooms[roomId].nextPlayer()
        }
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