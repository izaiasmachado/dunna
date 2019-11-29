const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const { PORT } = process.env
const page = (__dirname + '/public/index.html')
const socket = require('./socket')(io)

app.get('/', (req, res) => res.sendFile(page))
server.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`))