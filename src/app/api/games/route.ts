import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/games - list games
export async function GET() {
  const prisma = await getDb();
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: { players: true },
  });

  return NextResponse.json({
    games: games.map((g) => ({
      id: g.id,
      name: g.name,
      status: g.status,
      playerCount: g.players.length,
      currentHand: g.currentHand,
      startingChips: g.startingChips,
      smallBlind: g.smallBlind,
      bigBlind: g.bigBlind,
      createdAt: g.createdAt.toISOString(),
      startedAt: g.startedAt?.toISOString(),
      finishedAt: g.finishedAt?.toISOString(),
      players: g.players.map(p => ({
        agentName: p.agentName,
        agentType: p.agentType,
        currentChips: p.currentChips,
      })),
    })),
  });
}

// POST /api/games - create game
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, players, startingChips = 1000, smallBlind = 10, bigBlind = 20 } = body;

    if (!name || !players || !Array.isArray(players) || players.length < 2) {
      return NextResponse.json(
        { error: "需要至少 2 个玩家" },
        { status: 400 }
      );
    }

    const prisma = await getDb();
    const game = await prisma.game.create({
      data: {
        name,
        startingChips,
        smallBlind,
        bigBlind,
        players: {
          create: players.map(
            (p: { agentType: string; agentName: string; userId?: string }, i: number) => ({
              seatNumber: i,
              agentType: p.agentType,
              agentName: p.agentName,
              userId: p.userId || null,
              currentChips: startingChips,
            })
          ),
        },
      },
      include: { players: true },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json(
      { error: "创建游戏失败" },
      { status: 500 }
    );
  }
}
