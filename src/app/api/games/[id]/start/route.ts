import { NextRequest, NextResponse } from "next/server";
import { startGame } from "@/lib/game-runner";
import { getValidAccessToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const prisma = await getDb();
    const game = await prisma.game.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ error: "游戏不存在" }, { status: 404 });
    }

    if (game.status === "running") {
      return NextResponse.json({ error: "游戏已在运行中" }, { status: 400 });
    }

    // Build agent configs with access tokens for SecondMe agents
    const agentConfigs = [];
    for (const player of game.players) {
      const config: { type: string; name: string; accessToken?: string } = {
        type: player.agentType,
        name: player.agentName,
      };

      if (player.agentType === "secondme" && player.userId) {
        const token = await getValidAccessToken(player.userId);
        if (token) {
          config.accessToken = token;
        }
      }

      agentConfigs.push(config);
    }

    const result = await startGame(id, agentConfigs);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "启动游戏失败" },
      { status: 500 }
    );
  }
}
