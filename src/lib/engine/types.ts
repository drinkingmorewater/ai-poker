export type Suit = "s" | "h" | "d" | "c"; // spades, hearts, diamonds, clubs
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 2-10, J=11, Q=12, K=13, A=14

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type ActionType = "fold" | "check" | "call" | "bet" | "raise" | "all_in";

export interface PokerAction {
  action: ActionType;
  amount?: number;
  reasoning?: string;
}

export type RoundPhase = "preflop" | "flop" | "turn" | "river" | "showdown";
export type PlayerStatus = "active" | "folded" | "all_in" | "eliminated";

export interface PlayerState {
  seatNumber: number;
  agentType: string;
  agentName: string;
  userId?: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisHand: number;
  status: PlayerStatus;
  lastAction?: PokerAction;
}

export interface PotInfo {
  amount: number;
  eligibleSeats: number[];
}

export interface GameConfig {
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  maxHands?: number;
}

export interface GameSnapshot {
  gameId: string;
  handNumber: number;
  phase: RoundPhase;
  communityCards: Card[];
  players: PlayerState[];
  pots: PotInfo[];
  dealerSeat: number;
  currentPlayerSeat: number | null;
  lastAction?: { seat: number } & PokerAction;
}

export interface HandResult {
  handNumber: number;
  winners: { seat: number; amount: number; handName: string }[];
  communityCards: Card[];
  actions: ({ seat: number; phase: RoundPhase } & PokerAction)[];
}

export interface DecisionContext {
  holeCards: Card[];
  communityCards: Card[];
  potSize: number;
  currentBet: number;
  myCurrentBet: number;
  myChips: number;
  legalActions: ActionType[];
  minRaise: number;
  maxRaise: number;
  position: string;
  handHistory: ({ seat: number; phase: RoundPhase } & PokerAction)[];
  opponents: { seat: number; chips: number; status: PlayerStatus; currentBet: number }[];
}

export const SUIT_SYMBOLS: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
export const RANK_NAMES: Record<Rank, string> = {
  2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10",
  11: "J", 12: "Q", 13: "K", 14: "A",
};

export function cardToString(card: Card): string {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

export function cardToCode(card: Card): string {
  return `${RANK_NAMES[card.rank]}${{ s: "s", h: "h", d: "d", c: "c" }[card.suit]}`;
}
