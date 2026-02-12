import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const games = await prisma.game.findMany({
    where: { status: "finished" },
    orderBy: { finishedAt: "desc" },
    include: { players: true },
    take: 50,
  });

  const stats = {
    totalGames: games.length,
    agentStats: {} as Record<string, { games: number; wins: number; totalProfit: number }>,
  };

  for (const game of games) {
    const winner = game.players.reduce((a, b) =>
      a.currentChips > b.currentChips ? a : b
    );

    for (const p of game.players) {
      if (!stats.agentStats[p.agentType]) {
        stats.agentStats[p.agentType] = { games: 0, wins: 0, totalProfit: 0 };
      }
      stats.agentStats[p.agentType].games++;
      stats.agentStats[p.agentType].totalProfit += p.totalProfit;
      if (p.id === winner.id) {
        stats.agentStats[p.agentType].wins++;
      }
    }
  }

  return NextResponse.json(stats);
}
