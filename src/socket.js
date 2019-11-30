module.exports = (io) => {
    const Room = require('./models/Room')
    const playerLimit = 6
    const rooms = []

    io.on('connection', socket => {
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

            console.log(rooms)
        })

        socket.on('disconnect', () => {
            for (const RoomId in rooms.length) {
                if (rooms[RoomId].players[socket.id]) {
                    delete rooms[RoomId].players[socket.id]
                }
            }
        })
    })

    function makeId() {
        let result = ''

        for (let i = 0; i < 5; i++)
            result += Math.floor(Math.random() * 10);

        return result
    }
}