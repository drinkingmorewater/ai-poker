import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("ai_poker_user")?.value;

  if (!userDataCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const userData = JSON.parse(
      Buffer.from(userDataCookie, "base64").toString("utf-8")
    );

    // Try to get latest data from database
    try {
      const { prisma } = await import("@/lib/db");
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userData.id },
            { secondmeUserId: userData.id },
          ],
        },
      });
      if (dbUser) {
        return NextResponse.json({
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          avatarUrl: dbUser.avatarUrl,
          beans: dbUser.beans,
          totalWins: dbUser.totalWins,
          totalGames: dbUser.totalGames,
        });
      }
    } catch {
      // DB not available, fall through to cookie data
    }

    // Return cookie data as fallback
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      beans: userData.beans ?? 10000,
      totalWins: userData.totalWins ?? 0,
      totalGames: userData.totalGames ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
