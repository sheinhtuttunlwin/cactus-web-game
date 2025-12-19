export const suits = ['\u2660', '\u2665', '\u2666', '\u2663']; // ♠, ♥, ♦, ♣
export const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function createDeck() {
  const deck = [];
  let id = 0;
  for (const suit of suits) {
    const isRedSuit = suit === '\u2665' || suit === '\u2666';
    for (const rank of ranks) {
      deck.push({ id: id++, suit, rank, color: isRedSuit ? 'red' : 'black' });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createShuffledDeck() {
  return shuffleDeck(createDeck());
}
