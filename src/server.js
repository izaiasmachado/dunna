const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const { PORT } = process.env
const socket = require('./socket')(io)
const routes = require('./routes')

app.use(routes)

server.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`))