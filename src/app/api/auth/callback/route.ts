import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getUserInfo, getRedirectUri } from "@/lib/secondme";

const SESSION_COOKIE = "ai_poker_session";
const USER_DATA_COOKIE = "ai_poker_user";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", req.nextUrl.origin)
    );
  }

  try {
    const redirectUri = getRedirectUri(req.nextUrl.origin);

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code, redirectUri);

    // Get user info from SecondMe
    const userInfo = await getUserInfo(tokens.accessToken);

    const userId = userInfo.route || userInfo.email || "unknown";

    // Store user data in cookie (base64 encoded JSON)
    const userData = {
      id: userId,
      name: userInfo.name || null,
      email: userInfo.email || null,
      avatarUrl: userInfo.avatarUrl || null,
      beans: 10000,
      totalWins: 0,
      totalGames: 0,
      accessToken: tokens.accessToken,
    };

    // Try to save to database (best-effort, may fail on Vercel serverless with SQLite)
    try {
      const { prisma } = await import("@/lib/db");
      const dbUser = await prisma.user.upsert({
        where: { secondmeUserId: userId },
        update: {
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
        create: {
          secondmeUserId: userId,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
      });
      // Use DB values if available
      userData.id = dbUser.id;
      userData.beans = dbUser.beans;
      userData.totalWins = dbUser.totalWins;
      userData.totalGames = dbUser.totalGames;
    } catch (dbError) {
      console.warn("Database save failed (expected on Vercel with SQLite):", dbError);
    }

    const userDataEncoded = Buffer.from(JSON.stringify(userData)).toString("base64");

    const response = NextResponse.redirect(new URL("/", req.nextUrl.origin));

    // Set session cookie
    response.cookies.set(SESSION_COOKIE, userData.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Set user data cookie (readable by server)
    response.cookies.set(USER_DATA_COOKIE, userDataEncoded, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=auth_failed", req.nextUrl.origin)
    );
  }
}
