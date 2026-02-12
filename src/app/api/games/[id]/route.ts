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
    include: { players: true, hands: { orderBy: { handNumber: "desc" }, take: 10 } },
  });

  if (!game) {
    return NextResponse.json({ error: "游戏不存在" }, { status: 404 });
  }

  return NextResponse.json(game);
}
