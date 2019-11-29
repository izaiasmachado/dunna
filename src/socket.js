module.exports = (io) => {
    io.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnected', () => {
            console.log(`${socket.id} disconnected`)
        })
    })
}