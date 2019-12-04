const deck = require('../deck.json')

class Room {
    constructor() {
        this.players = []
        this.topCard = this.chooseTopCard()
    }

    addPlayer(name, SocketId) {
        if (this.players[SocketId])
            return

        this.players[SocketId] = {
            name,
            cards: this.dealCards()
        }
    }

    removePlayer(SocketId) {
        const player = this.players[SocketId]
        this.returnCards(player.cards)

        delete this.players[SocketId]
    }

    chooseTopCard() {
        const card = this.drawCard()
        const invalid = (card.wild || card.value == 'draw' || card.value == 'skip' || card.value == 'reverse')

        return (!card) ? false : (invalid) ? this.chooseTopCard() : card
    }

    drawCard() {
        const size = deck.length
        const temp = Math.floor(Math.random() * size)
        const card = deck[temp]

        deck.splice(temp, 1)

        return (card) ? card : (deck == 0) ? false : this.drawCard()
    }

    dealCards() {
        let cards = []
        let i = 0

        while (i < 7) {
            const card = this.drawCard()

            if (!card) {
                return false
            }

            cards.push(card)

            i++
        }

        return cards
    }

    returnCard(card) {
        deck.push(card)

        if (card.wild)
            card.suit = undefined
    }

    returnCards(cards) {
        const size = cards.length

        for (let i = 0; i < size; i++) {
            this.returnCard(cards[i])
        }
    }
}

module.exports = Room