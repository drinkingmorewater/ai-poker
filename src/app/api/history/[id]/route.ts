import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prisma = await getDb();
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      players: true,
      hands: { orderBy: { handNumber: "asc" } },
    },
  });

  if (!game) {
    return NextResponse.json({ error: "游戏不存在" }, { status: 404 });
  }

  return NextResponse.json({
    game: {
      id: game.id,
      name: game.name,
      status: game.status,
      startingChips: game.startingChips,
      smallBlind: game.smallBlind,
      bigBlind: game.bigBlind,
    },
    players: game.players.map(p => ({
      seatNumber: p.seatNumber,
      agentType: p.agentType,
      agentName: p.agentName,
      currentChips: p.currentChips,
      handsWon: p.handsWon,
      totalProfit: p.totalProfit,
      status: p.status,
    })),
    hands: game.hands.map(h => ({
      handNumber: h.handNumber,
      dealerSeat: h.dealerSeat,
      communityCards: JSON.parse(h.communityCards || "[]"),
      potTotal: h.potTotal,
      actions: JSON.parse(h.actions || "[]"),
      winners: JSON.parse(h.winners || "[]"),
    })),
  });
}
