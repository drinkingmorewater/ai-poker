import { NextRequest, NextResponse } from "next/server";
import { activeGames } from "@/lib/game-events";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, speed } = body;

  const game = activeGames.get(id);
  if (!game) {
    return NextResponse.json({ error: "游戏未在运行" }, { status: 404 });
  }

  switch (action) {
    case "pause":
      game.pause();
      return NextResponse.json({ status: "paused" });
    case "resume":
      game.resume();
      return NextResponse.json({ status: "running" });
    case "stop":
      game.stop();
      return NextResponse.json({ status: "stopping" });
    case "speed":
      if (typeof speed === "number") {
        game.setSpeed(speed);
        return NextResponse.json({ speed });
      }
      return NextResponse.json({ error: "缺少 speed 参数" }, { status: 400 });
    default:
      return NextResponse.json({ error: "未知操作" }, { status: 400 });
  }
}
