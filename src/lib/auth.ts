import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "ai_poker_session";

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return { userId: sessionId };
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Check if token is expired (with 5 min buffer)
  if (user.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    // Refresh the token
    const refreshed = await refreshAccessToken(user.refreshToken);
    if (!refreshed) return null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      },
    });

    return refreshed.accessToken;
  }

  return user.accessToken;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/oauth/token/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.SECONDME_CLIENT_ID!,
          client_secret: process.env.SECONDME_CLIENT_SECRET!,
        }),
      }
    );
    const result = await res.json();
    if (result.code !== 0 || !result.data) return null;
    return {
      accessToken: result.data.accessToken as string,
      refreshToken: result.data.refreshToken as string,
      expiresIn: result.data.expiresIn as number,
    };
  } catch {
    return null;
  }
}
