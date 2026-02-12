import { GameEngine, type EnginePlayer } from "@/lib/engine/game-engine";
import type { GameConfig, PokerAction } from "@/lib/engine/types";
import { createAgent, type AgentConfig } from "@/agents/registry";
import type { PokerAgent } from "@/agents/base-agent";
import { gameEventBus, activeGames, type ActiveGame } from "@/lib/game-events";
import { prisma } from "@/lib/db";

export async function startGame(gameId: string, agentConfigs: AgentConfig[]) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: true },
  });

  if (!game) throw new Error("Game not found");
  if (game.status === "running") throw new Error("Game already running");

  const config: GameConfig = {
    startingChips: game.startingChips,
    smallBlind: game.smallBlind,
    bigBlind: game.bigBlind,
  };

  // Create agents
  const agents = new Map<number, PokerAgent>();
  const enginePlayers: EnginePlayer[] = [];

  for (const player of game.players) {
    const agentConfig = agentConfigs.find(
      (a) => a.name === player.agentName && a.type === player.agentType
    ) || { type: player.agentType, name: player.agentName };

    agents.set(player.seatNumber, createAgent(agentConfig));
    enginePlayers.push({
      seatNumber: player.seatNumber,
      agentType: player.agentType,
      agentName: player.agentName,
      userId: player.userId || undefined,
      chips: config.startingChips,
    });
  }

  // Create engine
  const engine = new GameEngine(
    enginePlayers,
    config,
    // Action callback
    async (request) => {
      const agent = agents.get(request.seat);
      if (!agent) {
        return { action: "fold" as const, reasoning: "No agent found" };
      }

      const action: PokerAction = await agent.makeDecision(request.context);

      // Optionally get a chat comment from SecondMe agents
      if (agent.getComment && Math.random() < 0.3) {
        try {
          const comment = await agent.getComment(request.context);
          if (comment) {
            gameEventBus.emit(`game:${gameId}`, {
              type: "chat_message",
              data: { seat: request.seat, name: agent.name, message: comment },
            });
          }
        } catch {
          // Ignore chat errors
        }
      }

      return action;
    },
    // Event callback
    (event, data) => {
      gameEventBus.emit(`game:${gameId}`, { type: event, data });
    }
  );

  // Update game status
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "running", startedAt: new Date() },
  });

  // Register active game
  const activeGame: ActiveGame = {
    gameId,
    status: "running",
    pause: () => { engine.pause(); activeGame.status = "paused"; },
    resume: () => { engine.resume(); activeGame.status = "running"; },
    stop: () => engine.stop(),
    setSpeed: (speed: number) => engine.setSpeed(speed),
  };
  activeGames.set(gameId, activeGame);

  // Run game in background
  engine.run().then(async () => {
    activeGames.delete(gameId);
    await prisma.game.update({
      where: { id: gameId },
      data: { status: "finished", finishedAt: new Date() },
    });

    // Update player stats
    const snapshot = engine.getSnapshot(true);
    for (const p of snapshot.players) {
      await prisma.gamePlayer.updateMany({
        where: { gameId, seatNumber: p.seatNumber },
        data: {
          currentChips: p.chips,
          totalProfit: p.chips - config.startingChips,
          status: p.chips > 0 ? "active" : "eliminated",
        },
      });
    }
  }).catch(async (err) => {
    console.error(`Game ${gameId} error:`, err);
    activeGames.delete(gameId);
    await prisma.game.update({
      where: { id: gameId },
      data: { status: "finished", finishedAt: new Date() },
    });
  });

  return { status: "started" };
}
