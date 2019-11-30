const express = require('express')
const routes = express.Router()

routes.get('/script', (req, res) => res.sendFile(__dirname + '/public/script.js'))
routes.get('/style', (req, res) => res.sendFile(__dirname + '/public/style.css'))
routes.get('/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'))
routes.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'))

module.exports = routes