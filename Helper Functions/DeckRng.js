// Deck Class --------------------------------------------------------------------------

/** Deck class.
 * @constructor
 * @param {int} size - Deck size - number of items to cycle through.
 */
function deck(size) {
    this.maxSize = size;
    this.deck = new Array(size);
    this.fillDeck();
}

/** Get a random item from the deck
 * @returns {int}
 */
deck.prototype.getRandom = function() {
    if(this.deck.length < 1) this.reset();
    return this.deck.splice(Math.floor(Math.random() * (this.deck.length - 0 )) + 0, 1);
}

/** Gets the next item from the deck
 * @returns {int}
 */
deck.prototype.getNext = function() {
    if(this.deck.length < 1) this.reset();
    return this.deck.pop();
}

/** Resets the deck to its original size
 */
deck.prototype.reset = function() {
    this.deck = new Array(this.maxSize);
    this.fillDeck();
}

/** Fills the deck with numbers
 */
deck.prototype.fillDeck = function() {
    for(i = 0; i < this.maxSize; i++) this.deck[i] = i;
}

// --------------------------------------------------------------------------