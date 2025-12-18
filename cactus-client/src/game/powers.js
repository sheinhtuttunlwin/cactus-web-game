export const SELF_PEEK = "SELF_PEEK";

export function getPowerForCard(card) {
  if (!card || card.rank == null) return null;
  const rank = String(card.rank);
  if (rank === "6" || rank === "7" || rank === "8") return SELF_PEEK;
  return null;
}
