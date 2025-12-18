export const suits = ['♠', '♥', '♦', '♣'];
export const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
//export const ranks = ['Q','Q','Q','Q','Q','Q','Q','Q','Q','Q','Q','Q','Q',];


// This function creates a standard 52 card deck
export function createDeck() {

  const deck = [];
  let id = 0;

  for (const suit of suits) {
    const isRedSuit = suit === '♥' || suit === '♦';  // is the suit red?
    for (const rank of ranks) {
      deck.push({
        id: id++,
        suit,
        rank,
        color: isRedSuit ? 'red' : 'black',  // if the suit is red, assign red
      });
    }
  }

  return deck;
}


// This function shuffles the deck
export function shuffleDeck(deck) {

  const copy = [...deck];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


// This function creates a shuffled deck
export function createShuffledDeck() {
    return shuffleDeck(createDeck());
}





