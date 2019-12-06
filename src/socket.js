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
                return socket.emit('server-alert', 'Type your name!')
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
            socket.emit('show-game-container')

            sendGameStatus(rooms[id])
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
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            const room = rooms[roomId]
            const playerTurn = verifyTurn(room, socket.id)

            if (!playerTurn) {
                return socket.emit('server-alert', 'Wait for your turn to play!')
            }

            const card = rooms[roomId].drawCard()

            if (!card) {
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            rooms[roomId].players[socket.id].cards.push(card)

            sendGameStatus(rooms[roomId])
        })

        socket.on('choose-wild-color', data => {
            const colors = ['blue', 'red', 'yellow', 'green']
            const { cardPosition } = data
            const { suit } = data
            let wrongColor = true

            const roomId = findPlayerRoom(socket.id)
            const room = rooms[roomId]

            if (!room) {
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            const player = room.players[socket.id]
            const card = player.cards[cardPosition]

            for (let i = 0; i < 4; i++) {
                if (suit == colors[i]) {
                    wrongColor = false
                }
            }

            if (!card.wild || wrongColor || !suit) {
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            rooms[roomId].players[socket.id].cards[cardPosition].suit = suit

            socket.emit('hide-wild-buttons')
            return makePlay(cardPosition)
        })

        socket.on('send-play', cardPosition => {
            makePlay(cardPosition)
        })

        function makePlay(cardPosition) {
            const roomId = findPlayerRoom(socket.id)
            const room = rooms[roomId]

            if (!room) {
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            const player = room.players[socket.id]

            if (!player || !player.cards[cardPosition]) {
                return socket.emit('server-alert', 'Unexpected error, try again!')
            }

            const playerTurn = verifyTurn(room, socket.id)
            const card = player.cards[cardPosition]

            if (!playerTurn) {
                return socket.emit('server-alert', 'Wait for your turn to play!')
            }

            if (card.wild && !card.suit) {
                return socket.emit('show-wild-buttons', cardPosition)
            }

            const normalCondition = (((room.topCard.suit == card.suit) || (room.topCard.value == card.value)) && !card.wild)
            const wildCondition = ((card.wild && card.suit) || (room.topCard.wild && (room.topCard.suit == card.suit)))

            if (!normalCondition && !wildCondition) {
                return socket.emit('server-alert', 'Choose a valid card!')
            }

            rooms[roomId].players[socket.id].cards.splice(cardPosition, 1)
            rooms[roomId].returnCard(rooms[roomId].topCard)
            rooms[roomId].topCard = card

            gamePattern(roomId)
            sendGameStatus(rooms[roomId])
        }

        function gamePattern(roomId) {
            const room = rooms[roomId]
            const { topCard } = rooms[roomId]

            if (topCard.value == 'draw') {
                rooms[roomId].nextPlayer()

                const position = rooms[roomId].currentPlayer
                const players = Object.keys(room.players)

                for (let i = 0; i < players.length; i++) {
                    const playerId = players[position]
                    const card = rooms[roomId].drawCard()

                    if (!card) {
                        return socket.emit('server-alert', 'Unexpected error, try again!')
                    }

                    rooms[roomId].players[playerId].cards.push(card)
                }
            }

            if (topCard.value == 'reverse') {
                rooms[roomId].reverse()
            }

            if (topCard.value == 'skip') {
                rooms[roomId].nextPlayer()
            }

            rooms[roomId].nextPlayer()
            sendGameStatus(rooms[roomId])
        }

        function sendGameStatus(room) {
            if (!room) {
                return false
            }

            const publicInfo = {
                players: [],
                topCard: room.topCard
            }

            const players = Object.keys(room.players)

            for (let i = 0; i < players.length; i++) {
                const socket = players[i]
                const player = room.players[socket]

                publicInfo.players.push({
                    id: socket,
                    name: player.name,
                    cardQuantity: player.cards.length
                })

                io.to(socket).emit('player-state', { player })
            }

            const currentPlayerPosition = room.currentPlayer
            const currentPlayerId = players[currentPlayerPosition]
            const currentPlayer = room.players[currentPlayerId]

            publicInfo.currentPlayer = {
                id: currentPlayerId,
                name: currentPlayer.name
            }

            socket.emit('public-info', publicInfo)
            socket.broadcast.emit('public-info', publicInfo)
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