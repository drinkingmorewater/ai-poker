import type { Card, Rank } from "./types";

/**
 * Hand rankings from highest to lowest:
 * 9 - Royal Flush (subset of straight flush)
 * 8 - Straight Flush
 * 7 - Four of a Kind
 * 6 - Full House
 * 5 - Flush
 * 4 - Straight
 * 3 - Three of a Kind
 * 2 - Two Pair
 * 1 - One Pair
 * 0 - High Card
 */

export interface HandRank {
  rank: number;       // 0-8
  name: string;       // human readable
  values: number[];   // for comparison (primary, kickers)
}

const HAND_NAMES = [
  "高牌", "一对", "两对", "三条", "顺子",
  "同花", "葫芦", "四条", "同花顺",
];

/**
 * Evaluate the best 5-card hand from 7 cards (2 hole + 5 community)
 */
export function evaluateHand(cards: Card[]): HandRank {
  if (cards.length < 5) {
    return { rank: 0, name: "高牌", values: cards.map(c => c.rank).sort((a, b) => b - a) };
  }

  // Generate all 5-card combinations from available cards
  const combos = combinations(cards, 5);
  let bestHand: HandRank = { rank: -1, name: "", values: [] };

  for (const combo of combos) {
    const hand = evaluate5(combo);
    if (compareHands(hand, bestHand) > 0) {
      bestHand = hand;
    }
  }

  return bestHand;
}

function evaluate5(cards: Card[]): HandRank {
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);

  // Count rank occurrences
  const counts = new Map<Rank, number>();
  for (const r of ranks) {
    counts.set(r, (counts.get(r) || 0) + 1);
  }

  const groups = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // by count desc
    return b[0] - a[0]; // by rank desc
  });

  // Straight flush (including royal flush)
  if (isFlush && isStraight) {
    const highCard = getStraightHigh(ranks);
    return { rank: 8, name: highCard === 14 ? "皇家同花顺" : "同花顺", values: [highCard] };
  }

  // Four of a kind
  if (groups[0][1] === 4) {
    return {
      rank: 7, name: "四条",
      values: [groups[0][0], groups[1][0]],
    };
  }

  // Full house
  if (groups[0][1] === 3 && groups[1][1] === 2) {
    return {
      rank: 6, name: "葫芦",
      values: [groups[0][0], groups[1][0]],
    };
  }

  // Flush
  if (isFlush) {
    return { rank: 5, name: "同花", values: ranks };
  }

  // Straight
  if (isStraight) {
    return { rank: 4, name: "顺子", values: [getStraightHigh(ranks)] };
  }

  // Three of a kind
  if (groups[0][1] === 3) {
    const kickers = groups.slice(1).map(g => g[0]);
    return { rank: 3, name: "三条", values: [groups[0][0], ...kickers] };
  }

  // Two pair
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups[2][0];
    return { rank: 2, name: "两对", values: [highPair, lowPair, kicker] };
  }

  // One pair
  if (groups[0][1] === 2) {
    const kickers = groups.slice(1).map(g => g[0]).sort((a, b) => b - a);
    return { rank: 1, name: "一对", values: [groups[0][0], ...kickers] };
  }

  // High card
  return { rank: 0, name: "高牌", values: ranks };
}

function checkStraight(ranks: number[]): boolean {
  const sorted = [...new Set(ranks)].sort((a, b) => b - a);
  if (sorted.length < 5) return false;

  // Normal straight
  if (sorted[0] - sorted[4] === 4) return true;

  // Ace-low straight (A-2-3-4-5)
  if (sorted[0] === 14 && sorted[1] === 5 && sorted[2] === 4 && sorted[3] === 3 && sorted[4] === 2) {
    return true;
  }

  return false;
}

function getStraightHigh(ranks: number[]): number {
  const sorted = [...new Set(ranks)].sort((a, b) => b - a);
  // Ace-low straight
  if (sorted[0] === 14 && sorted[1] === 5) return 5;
  return sorted[0];
}

/**
 * Compare two hands. Returns > 0 if a is better, < 0 if b is better, 0 if tie.
 */
export function compareHands(a: HandRank, b: HandRank): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const result: T[][] = [];

  const [first, ...rest] = arr;
  // Include first
  for (const combo of combinations(rest, k - 1)) {
    result.push([first, ...combo]);
  }
  // Exclude first
  for (const combo of combinations(rest, k)) {
    result.push(combo);
  }

  return result;
}
