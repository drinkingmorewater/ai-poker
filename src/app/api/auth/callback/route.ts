import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getUserInfo } from "@/lib/secondme";
import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", req.nextUrl.origin)
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get user info
    const userInfo = await getUserInfo(tokens.accessToken);

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { secondmeUserId: userInfo.route || userInfo.email || "unknown" },
      update: {
        name: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
      create: {
        secondmeUserId: userInfo.route || userInfo.email || "unknown",
        name: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    // Set session cookie
    await setSession(user.id);

    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=auth_failed", req.nextUrl.origin)
    );
  }
}
