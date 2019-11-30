class Room {
    constructor() {
        this.players = []
    }

    addPlayer(name, SocketId) {
        if (this.players[SocketId])
            return 
        
        this.players[SocketId] = {
            name
        }
    }

    removePlayer(player) {
        const { SocketId } = player
        delete this.players[SocketId]
    }
}

module.exports = Room