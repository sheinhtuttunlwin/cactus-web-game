/**
 * Scoring rules for the Cactus card game.
 * 
 * Card values:
 * - Ace (A) = 1 point
 * - 2-10 = face value (2 points, 3 points, etc.)
 * - Jack (J) = 10 points
 * - Queen (Q) = 10 points
 * - King (K) in black suits (♠ spades, ♣ clubs) = 10 points
 * - King (K) in red suits (♥ hearts, ♦ diamonds) = 0 points
 */

/**
 * Get the point value of a single card.
 * @param {Object} card - Card object with rank, suit, and color properties
 * @returns {number} Point value of the card
 */
export function getCardValue(card) {
  const { rank, color } = card;

  // Handle numeric cards (2-10)
  const numericValue = parseInt(rank, 10);
  if (!isNaN(numericValue)) {
    return numericValue;
  }

  // Handle face cards
  switch (rank) {
    case 'A':
      return 1;
    case 'J':
      return 10;
    case 'Q':
      return 10;
    case 'K':
      // Red kings (hearts ♥, diamonds ♦) are worth 0
      // Black kings (spades ♠, clubs ♣) are worth 10
      return color === 'red' ? 0 : 10;
    default:
      return 0;
  }
}

/**
 * Calculate the total score for a hand of cards.
 * @param {Array} hand - Array of card objects
 * @returns {number} Total point value of all cards in hand
 */
export function calculateHandScore(hand) {
  if (!hand || hand.length === 0) {
    return 0;
  }
  return hand.reduce((total, card) => total + getCardValue(card), 0);
}

/**
 * Compare two player scores and determine the winner.
 * Lower score wins in Cactus.
 * @param {number} score1 - Player 1's score
 * @param {number} score2 - Player 2's score
 * @returns {Object} Result object with winner (1, 2, or null for tie) and scores
 */
export function determineWinner(score1, score2) {
  if (score1 < score2) {
    return { 
      winner: 1, 
      loser: 2, 
      winningScore: score1, 
      losingScore: score2 
    };
  } else if (score2 < score1) {
    return { 
      winner: 2, 
      loser: 1, 
      winningScore: score2, 
      losingScore: score1 
    };
  } else {
    return { 
      winner: null, 
      loser: null, 
      winningScore: score1, 
      losingScore: score2 
    };
  }
}
