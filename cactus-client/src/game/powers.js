export const SELF_PEEK = "SELF_PEEK";
export const OPPONENT_PEEK = "OPPONENT_PEEK";

export function getPowerForCard(card) {
  if (!card || card.rank == null) return null;
  const rank = String(card.rank);
  if (rank === "6" || rank === "7" || rank === "8") return SELF_PEEK;
  if (rank === "9" || rank === "10" || rank === "J") return OPPONENT_PEEK;
  return null;
}
