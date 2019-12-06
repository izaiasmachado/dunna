const newDeck = require('../deck.js')

class Room {
    constructor() {
        this.deck = newDeck()
        this.players = []
        this.chooseTopCard()
        this.currentPlayer = 0
        this.orientation = '+'
        this.winner = false
    }

    addPlayer(name, SocketId) {
        if (!this.players[SocketId]) {
            this.players[SocketId] = {
                name,
                cards: this.dealCards()
            }
        }
    }

    removePlayer(SocketId) {
        const player = this.players[SocketId]

        if (player) {
            this.returnCards(player.cards)
            delete this.players[SocketId]
        }
    }

    chooseTopCard() {
        const card = this.drawCard()
        const invalid = (card.wild || card.value == 'draw' || card.value == 'skip' || card.value == 'reverse')

        if (invalid) {
            this.returnCard(card)
            return this.chooseTopCard()
        } else if (card) {
            this.topCard = card
        }
    }

    drawCard() {
        const size = this.deck.length
        const temp = Math.floor(Math.random() * size)
        const card = this.deck[temp]

        if (card) {
            this.deck.splice(temp, 1)
            return card
        }

        if (this.deck.length == 0) {
            return false
        }
        
        this.drawCard()
    }

    dealCards() {
        let cards = []
        let i = 0

        while (i < 7) {
            const card = this.drawCard()

            if (card) {
                cards.push(card)
                i++
            }
        }

        return cards
    }

    returnCard(card) {
        if (card) {
            card.suit = (card.wild) ? undefined : card.suit
            this.deck.push(card)
        }
    }

    returnCards(cards) {
        const size = cards.length

        for (let i = 0; i < size; i++) {
            this.returnCard(cards[i])
        }
    }

    reverse() {
        this.orientation = (this.orientation == '+') ? '-' : '+'
    }

    nextPlayer() {
        const players = Object.keys(this.players)
        const lastPosition = players.length - 1

        this.currentPlayer = (this.orientation == '+') ? this.currentPlayer + 1 : this.currentPlayer - 1
        this.currentPlayer = (this.currentPlayer > lastPosition) ? 0 : this.currentPlayer
        this.currentPlayer = (this.currentPlayer < 0) ? lastPosition : this.currentPlayer
    }

    restartGame() {
        const players = Object.keys(this.players)
        const size = players.length
        this.returnCard(this.topCard)
                
        for (let i = 0; i < size; i++) {
            const playerId = players[i]
            
            this.returnCards(this.players[playerId].cards)
            this.players[playerId].cards = this.dealCards()
        }
        
        this.deck = newDeck()
        this.topCard = this.chooseTopCard()
        this.currentPlayer = 0
        this.orientation = '+'
        this.winner = false
    }
}

module.exports = Room