import type { Card, Rank, Suit } from "./types";

const SUITS: Suit[] = ["s", "h", "d", "c"];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export class Deck {
  private cards: Card[];
  private index: number;

  constructor() {
    this.cards = shuffleDeck(createDeck());
    this.index = 0;
  }

  deal(count: number = 1): Card[] {
    const dealt = this.cards.slice(this.index, this.index + count);
    this.index += count;
    return dealt;
  }

  dealOne(): Card {
    return this.deal(1)[0];
  }

  burn(): void {
    this.index++;
  }

  remaining(): number {
    return this.cards.length - this.index;
  }
}
