import type { PotInfo } from "./types";

/**
 * Calculate pots including side pots when players are all-in with different amounts.
 *
 * @param bets - Map of seat number to total bet amount this hand
 * @param activeSeatNumbers - seats still eligible (not folded)
 * @returns array of pots
 */
export function calculatePots(
  bets: Map<number, number>,
  activeSeatNumbers: number[]
): PotInfo[] {
  const activeSet = new Set(activeSeatNumbers);
  // Sort unique bet amounts
  const betEntries = Array.from(bets.entries())
    .filter(([seat]) => activeSet.has(seat))
    .sort((a, b) => a[1] - b[1]);

  if (betEntries.length === 0) return [];

  const pots: PotInfo[] = [];
  let previousLevel = 0;

  // Collect unique bet levels from active players
  const levels = [...new Set(betEntries.map(([, amount]) => amount))].sort((a, b) => a - b);

  for (const level of levels) {
    const increment = level - previousLevel;
    if (increment <= 0) continue;

    let potAmount = 0;
    const eligible: number[] = [];

    for (const [seat, betAmount] of bets.entries()) {
      const contribution = Math.min(betAmount, level) - Math.min(betAmount, previousLevel);
      if (contribution > 0) {
        potAmount += contribution;
      }
      // Only active players (not folded) with enough bet are eligible
      if (activeSet.has(seat) && betAmount >= level) {
        eligible.push(seat);
      }
    }

    if (potAmount > 0 && eligible.length > 0) {
      pots.push({ amount: potAmount, eligibleSeats: eligible });
    }

    previousLevel = level;
  }

  // Merge pots with same eligible seats
  const merged: PotInfo[] = [];
  for (const pot of pots) {
    const key = pot.eligibleSeats.sort((a, b) => a - b).join(",");
    const existing = merged.find(
      (m) => m.eligibleSeats.sort((a, b) => a - b).join(",") === key
    );
    if (existing) {
      existing.amount += pot.amount;
    } else {
      merged.push({ ...pot });
    }
  }

  return merged;
}

/**
 * Get total pot size
 */
export function totalPotSize(pots: PotInfo[]): number {
  return pots.reduce((sum, p) => sum + p.amount, 0);
}
