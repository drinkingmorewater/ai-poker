import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const prisma = await getDb();
  const users = await prisma.user.findMany({
    orderBy: { beans: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      beans: true,
      totalWins: true,
      totalGames: true,
    },
  });

  return NextResponse.json({
    leaderboard: users.map((u) => ({
      name: u.name,
      avatarUrl: u.avatarUrl,
      beans: u.beans,
      totalWins: u.totalWins,
      totalGames: u.totalGames,
    })),
  });
}
