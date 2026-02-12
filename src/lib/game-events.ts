import { EventEmitter } from "events";

// Global event emitter for game events (singleton)
class GameEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
}

const globalForEvents = globalThis as unknown as { gameEventBus: GameEventBus };
export const gameEventBus = globalForEvents.gameEventBus || new GameEventBus();
if (process.env.NODE_ENV !== "production") {
  globalForEvents.gameEventBus = gameEventBus;
}

// Active game runners stored in memory
export interface ActiveGame {
  gameId: string;
  status: "running" | "paused";
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
}

const globalForGames = globalThis as unknown as { activeGames: Map<string, ActiveGame> };
export const activeGames = globalForGames.activeGames || new Map<string, ActiveGame>();
if (process.env.NODE_ENV !== "production") {
  globalForGames.activeGames = activeGames;
}
