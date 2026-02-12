import { Deck } from "./card";
import { evaluateHand, compareHands, type HandRank } from "./evaluator";
import { calculatePots, totalPotSize } from "./pot";
import type {
  Card, PlayerState, PotInfo, GameConfig, GameSnapshot,
  HandResult, RoundPhase, PokerAction, ActionType, DecisionContext,
} from "./types";
import { cardToCode } from "./types";

export interface EnginePlayer {
  seatNumber: number;
  agentType: string;
  agentName: string;
  userId?: string;
  chips: number;
}

export interface ActionRequest {
  seat: number;
  context: DecisionContext;
}

export type ActionCallback = (request: ActionRequest) => Promise<PokerAction>;
export type EventCallback = (event: string, data: unknown) => void;

export class GameEngine {
  private config: GameConfig;
  private players: PlayerState[];
  private communityCards: Card[] = [];
  private deck: Deck = new Deck();
  private dealerSeat: number = 0;
  private handNumber: number = 0;
  private phase: RoundPhase = "preflop";
  private handActions: ({ seat: number; phase: RoundPhase } & PokerAction)[] = [];
  private totalBetsThisHand: Map<number, number> = new Map();
  private currentBet: number = 0;
  private minRaise: number = 0;
  private lastRaiseSeat: number = -1;

  // Callbacks
  private onAction: ActionCallback;
  private onEvent: EventCallback;

  // Control
  private _paused: boolean = false;
  private _stopped: boolean = false;
  private _speed: number = 1;
  private _pauseResolve: (() => void) | null = null;

  constructor(
    enginePlayers: EnginePlayer[],
    config: GameConfig,
    onAction: ActionCallback,
    onEvent: EventCallback
  ) {
    this.config = config;
    this.onAction = onAction;
    this.onEvent = onEvent;

    this.players = enginePlayers.map((p) => ({
      seatNumber: p.seatNumber,
      agentType: p.agentType,
      agentName: p.agentName,
      userId: p.userId,
      chips: config.startingChips,
      holeCards: [],
      currentBet: 0,
      totalBetThisHand: 0,
      status: "active" as const,
    }));
  }

  // ─── Control ───

  pause() { this._paused = true; }
  resume() {
    this._paused = false;
    if (this._pauseResolve) { this._pauseResolve(); this._pauseResolve = null; }
  }
  stop() { this._stopped = true; this.resume(); }
  setSpeed(speed: number) { this._speed = Math.max(0.1, Math.min(10, speed)); }

  private async waitIfPaused() {
    if (this._paused) {
      await new Promise<void>((resolve) => { this._pauseResolve = resolve; });
    }
  }

  private async delay(ms: number = 800) {
    await this.waitIfPaused();
    if (this._stopped) return;
    await new Promise((r) => setTimeout(r, ms / this._speed));
  }

  // ─── Snapshot ───

  getSnapshot(revealAll: boolean = false): GameSnapshot {
    return {
      gameId: "",
      handNumber: this.handNumber,
      phase: this.phase,
      communityCards: [...this.communityCards],
      players: this.players.map((p) => ({
        ...p,
        holeCards: revealAll || this.phase === "showdown" ? [...p.holeCards] : [],
      })),
      pots: this.getPots(),
      dealerSeat: this.dealerSeat,
      currentPlayerSeat: null,
      lastAction: this.handActions.length > 0
        ? { ...this.handActions[this.handActions.length - 1] }
        : undefined,
    };
  }

  private getPots(): PotInfo[] {
    return calculatePots(this.totalBetsThisHand, this.activePlayers().map(p => p.seatNumber));
  }

  private activePlayers() {
    return this.players.filter(p => p.status === "active" || p.status === "all_in");
  }

  private actionablePlayers() {
    return this.players.filter(p => p.status === "active" && p.chips > 0);
  }

  // ─── Main loop ───

  async run(): Promise<void> {
    this.onEvent("game_start", { players: this.players.map(p => ({ seat: p.seatNumber, name: p.agentName, chips: p.chips })) });

    while (!this._stopped) {
      const alive = this.players.filter(p => p.chips > 0);
      if (alive.length <= 1) break;
      if (this.config.maxHands && this.handNumber >= this.config.maxHands) break;

      await this.playHand();
      await this.delay(1500);
    }

    this.onEvent("game_over", {
      winner: this.players.reduce((a, b) => a.chips > b.chips ? a : b),
      standings: [...this.players].sort((a, b) => b.chips - a.chips),
    });
  }

  // ─── Hand ───

  private async playHand(): Promise<void> {
    this.handNumber++;
    this.deck = new Deck();
    this.communityCards = [];
    this.handActions = [];
    this.totalBetsThisHand = new Map();
    this.currentBet = 0;

    // Reset players for new hand
    for (const p of this.players) {
      p.holeCards = [];
      p.currentBet = 0;
      p.totalBetThisHand = 0;
      p.lastAction = undefined;
      if (p.chips > 0) {
        p.status = "active";
      } else {
        p.status = "eliminated";
      }
    }

    // Move dealer
    this.advanceDealer();

    this.onEvent("new_hand", {
      handNumber: this.handNumber,
      dealerSeat: this.dealerSeat,
      snapshot: this.getSnapshot(),
    });

    // Post blinds
    await this.postBlinds();
    await this.delay(500);

    // Deal hole cards
    for (const p of this.activePlayers()) {
      p.holeCards = this.deck.deal(2);
    }
    this.onEvent("deal_hole_cards", { snapshot: this.getSnapshot(true) });
    await this.delay(800);

    // Betting rounds
    this.phase = "preflop";
    this.onEvent("game_state", this.getSnapshot(true));

    const preflopDone = await this.bettingRound("preflop");
    if (!preflopDone || this._stopped) return this.finishHand();

    // Flop
    this.phase = "flop";
    this.deck.burn();
    this.communityCards.push(...this.deck.deal(3));
    this.onEvent("deal_community", { phase: "flop", cards: this.communityCards.slice(0, 3), snapshot: this.getSnapshot(true) });
    await this.delay(800);

    const flopDone = await this.bettingRound("flop");
    if (!flopDone || this._stopped) return this.finishHand();

    // Turn
    this.phase = "turn";
    this.deck.burn();
    this.communityCards.push(this.deck.dealOne());
    this.onEvent("deal_community", { phase: "turn", cards: [this.communityCards[3]], snapshot: this.getSnapshot(true) });
    await this.delay(800);

    const turnDone = await this.bettingRound("turn");
    if (!turnDone || this._stopped) return this.finishHand();

    // River
    this.phase = "river";
    this.deck.burn();
    this.communityCards.push(this.deck.dealOne());
    this.onEvent("deal_community", { phase: "river", cards: [this.communityCards[4]], snapshot: this.getSnapshot(true) });
    await this.delay(800);

    const riverDone = await this.bettingRound("river");
    if (this._stopped) return this.finishHand();

    // Showdown
    if (riverDone) {
      this.phase = "showdown";
      await this.showdown();
    } else {
      this.finishHand();
    }
  }

  private advanceDealer() {
    const alive = this.players.filter(p => p.chips > 0).map(p => p.seatNumber);
    if (alive.length === 0) return;

    let next = (this.dealerSeat + 1) % this.players.length;
    while (!alive.includes(next)) {
      next = (next + 1) % this.players.length;
    }
    this.dealerSeat = next;
  }

  private async postBlinds() {
    const alive = this.players.filter(p => p.status === "active").map(p => p.seatNumber);
    if (alive.length < 2) return;

    const dealerIdx = alive.indexOf(this.dealerSeat);
    const sbIdx = alive[(dealerIdx + 1) % alive.length];
    const bbIdx = alive[(dealerIdx + 2) % alive.length];

    this.placeBet(sbIdx, Math.min(this.config.smallBlind, this.getPlayer(sbIdx)!.chips));
    this.placeBet(bbIdx, Math.min(this.config.bigBlind, this.getPlayer(bbIdx)!.chips));
    this.currentBet = this.config.bigBlind;
    this.minRaise = this.config.bigBlind;
  }

  private placeBet(seat: number, amount: number) {
    const player = this.getPlayer(seat)!;
    const actualAmount = Math.min(amount, player.chips);
    player.chips -= actualAmount;
    player.currentBet += actualAmount;
    player.totalBetThisHand += actualAmount;
    this.totalBetsThisHand.set(seat, (this.totalBetsThisHand.get(seat) || 0) + actualAmount);
    if (player.chips === 0 && player.status === "active") {
      player.status = "all_in";
    }
  }

  // ─── Betting Round ───

  /**
   * Returns true if showdown should happen, false if only one player remains
   */
  private async bettingRound(phase: RoundPhase): Promise<boolean> {
    // Reset current bets for new round (except preflop which has blinds)
    if (phase !== "preflop") {
      for (const p of this.players) {
        p.currentBet = 0;
      }
      this.currentBet = 0;
    }

    const actionable = this.actionablePlayers();
    if (actionable.length <= 1) {
      return this.activePlayers().length > 1;
    }

    // Determine starting position
    const alive = this.players.filter(p => p.status === "active").map(p => p.seatNumber);
    let startIdx: number;

    if (phase === "preflop") {
      // Start after BB
      const dealerPos = alive.indexOf(this.dealerSeat);
      startIdx = (dealerPos + 3) % alive.length;
      this.lastRaiseSeat = alive[(dealerPos + 2) % alive.length]; // BB is last raiser
    } else {
      // Start after dealer
      const dealerPos = alive.indexOf(this.dealerSeat);
      startIdx = (dealerPos + 1) % alive.length;
      this.lastRaiseSeat = -1;
    }

    let actedCount = 0;
    let currentIdx = startIdx;
    const needToAct = new Set(actionable.map(p => p.seatNumber));

    while (needToAct.size > 0 && !this._stopped) {
      const seat = alive[currentIdx % alive.length];
      const player = this.getPlayer(seat)!;

      if (player.status === "active" && player.chips > 0 && needToAct.has(seat)) {
        const context = this.buildContext(seat);
        const snapshot = this.getSnapshot(true);
        snapshot.currentPlayerSeat = seat;
        this.onEvent("game_state", snapshot);

        await this.delay(600);

        const action = await this.onAction({ seat, context });
        this.executeAction(seat, action, phase);

        needToAct.delete(seat);
        actedCount++;

        // If someone raised, everyone needs to act again
        if (action.action === "raise" || action.action === "bet") {
          this.lastRaiseSeat = seat;
          for (const p of this.actionablePlayers()) {
            if (p.seatNumber !== seat) {
              needToAct.add(p.seatNumber);
            }
          }
        }

        this.onEvent("player_action", {
          seat,
          action,
          phase,
          snapshot: this.getSnapshot(true),
        });

        // Check if only one active player remains
        if (this.activePlayers().length <= 1) {
          this.awardPotToLastPlayer();
          return false;
        }
      } else {
        needToAct.delete(seat);
      }

      currentIdx++;
      if (actedCount > 100) break; // safety valve
    }

    return this.activePlayers().length > 1;
  }

  private buildContext(seat: number): DecisionContext {
    const player = this.getPlayer(seat)!;
    const potSize = totalPotSize(this.getPots()) + this.players.reduce((s, p) => s + p.currentBet, 0);
    const toCall = this.currentBet - player.currentBet;

    const legalActions: ActionType[] = [];

    // Can always fold (unless nothing to call)
    if (toCall > 0) {
      legalActions.push("fold");
      legalActions.push("call");
    } else {
      legalActions.push("check");
    }

    // Can raise if has enough chips
    if (player.chips > toCall) {
      legalActions.push(this.currentBet === 0 ? "bet" : "raise");
    }

    // All-in is always available
    if (player.chips > 0) {
      legalActions.push("all_in");
    }

    const opponents = this.players
      .filter(p => p.seatNumber !== seat && (p.status === "active" || p.status === "all_in"))
      .map(p => ({ seat: p.seatNumber, chips: p.chips, status: p.status, currentBet: p.currentBet }));

    return {
      holeCards: player.holeCards,
      communityCards: [...this.communityCards],
      potSize,
      currentBet: this.currentBet,
      myCurrentBet: player.currentBet,
      myChips: player.chips,
      legalActions,
      minRaise: this.currentBet + this.minRaise,
      maxRaise: player.chips + player.currentBet,
      position: this.getPosition(seat),
      handHistory: [...this.handActions],
      opponents,
    };
  }

  private getPosition(seat: number): string {
    const alive = this.players.filter(p => p.status !== "eliminated").map(p => p.seatNumber);
    const dealerIdx = alive.indexOf(this.dealerSeat);
    const playerIdx = alive.indexOf(seat);
    const relPos = (playerIdx - dealerIdx + alive.length) % alive.length;

    if (relPos === 0) return "dealer";
    if (relPos === 1) return "small_blind";
    if (relPos === 2) return "big_blind";
    if (relPos <= alive.length / 3) return "early";
    if (relPos <= (alive.length * 2) / 3) return "middle";
    return "late";
  }

  private executeAction(seat: number, action: PokerAction, phase: RoundPhase) {
    const player = this.getPlayer(seat)!;

    switch (action.action) {
      case "fold":
        player.status = "folded";
        break;

      case "check":
        // Nothing to do
        break;

      case "call": {
        const toCall = Math.min(this.currentBet - player.currentBet, player.chips);
        this.placeBet(seat, toCall);
        break;
      }

      case "bet":
      case "raise": {
        const raiseAmount = action.amount || this.currentBet + this.minRaise;
        const totalNeeded = Math.min(raiseAmount - player.currentBet, player.chips);
        const oldBet = this.currentBet;
        this.placeBet(seat, totalNeeded);
        this.currentBet = player.currentBet;
        this.minRaise = Math.max(this.minRaise, this.currentBet - oldBet);
        break;
      }

      case "all_in": {
        const allInAmount = player.chips;
        this.placeBet(seat, allInAmount);
        if (player.currentBet > this.currentBet) {
          this.minRaise = Math.max(this.minRaise, player.currentBet - this.currentBet);
          this.currentBet = player.currentBet;
        }
        break;
      }
    }

    player.lastAction = action;
    this.handActions.push({ seat, phase, ...action });
  }

  // ─── Showdown & Awards ───

  private async showdown() {
    this.phase = "showdown";

    const active = this.activePlayers();
    const handRanks = new Map<number, HandRank>();

    for (const p of active) {
      const allCards = [...p.holeCards, ...this.communityCards];
      handRanks.set(p.seatNumber, evaluateHand(allCards));
    }

    const pots = this.getPots();
    const winners: { seat: number; amount: number; handName: string }[] = [];

    for (const pot of pots) {
      const eligible = pot.eligibleSeats.filter(s => {
        const p = this.getPlayer(s);
        return p && (p.status === "active" || p.status === "all_in");
      });

      if (eligible.length === 0) continue;

      // Find best hand among eligible
      let bestSeats: number[] = [eligible[0]];
      let bestRank = handRanks.get(eligible[0])!;

      for (let i = 1; i < eligible.length; i++) {
        const rank = handRanks.get(eligible[i])!;
        const cmp = compareHands(rank, bestRank);
        if (cmp > 0) {
          bestSeats = [eligible[i]];
          bestRank = rank;
        } else if (cmp === 0) {
          bestSeats.push(eligible[i]);
        }
      }

      // Split pot among winners
      const share = Math.floor(pot.amount / bestSeats.length);
      const remainder = pot.amount - share * bestSeats.length;

      for (let i = 0; i < bestSeats.length; i++) {
        const winAmount = share + (i === 0 ? remainder : 0);
        const p = this.getPlayer(bestSeats[i])!;
        p.chips += winAmount;
        winners.push({
          seat: bestSeats[i],
          amount: winAmount,
          handName: handRanks.get(bestSeats[i])!.name,
        });
      }
    }

    const result: HandResult = {
      handNumber: this.handNumber,
      winners,
      communityCards: [...this.communityCards],
      actions: [...this.handActions],
    };

    this.onEvent("showdown", {
      result,
      hands: Object.fromEntries(
        active.map(p => [p.seatNumber, {
          cards: p.holeCards.map(cardToCode),
          rank: handRanks.get(p.seatNumber),
        }])
      ),
      snapshot: this.getSnapshot(true),
    });

    await this.delay(2000);
    this.finishHand();
  }

  private awardPotToLastPlayer() {
    const active = this.activePlayers();
    if (active.length !== 1) return;

    const winner = active[0];
    const totalPot = Array.from(this.totalBetsThisHand.values()).reduce((a, b) => a + b, 0);
    winner.chips += totalPot;

    this.onEvent("showdown", {
      result: {
        handNumber: this.handNumber,
        winners: [{ seat: winner.seatNumber, amount: totalPot, handName: "其他人弃牌" }],
        communityCards: [...this.communityCards],
        actions: [...this.handActions],
      },
      snapshot: this.getSnapshot(true),
    });
  }

  private finishHand() {
    // Nothing extra needed - hand cleanup happens at start of next hand
  }

  private getPlayer(seat: number): PlayerState | undefined {
    return this.players.find(p => p.seatNumber === seat);
  }
}
