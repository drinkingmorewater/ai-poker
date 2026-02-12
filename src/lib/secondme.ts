import type { SecondMeApiResponse, SecondMeUserInfo } from "@/types/api";

const API_BASE = process.env.SECONDME_API_BASE_URL || "https://app.mindos.com/gate/lab";

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForToken(code: string) {
  const res = await fetch(`${API_BASE}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  });

  const result = await res.json();
  if (result.code !== 0 || !result.data) {
    throw new Error(`Token exchange failed: ${result.message || "Unknown error"}`);
  }

  return {
    accessToken: result.data.accessToken as string,
    refreshToken: result.data.refreshToken as string,
    expiresIn: result.data.expiresIn as number,
  };
}

/**
 * Get user info from SecondMe
 */
export async function getUserInfo(accessToken: string): Promise<SecondMeUserInfo> {
  const res = await fetch(`${API_BASE}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const result: SecondMeApiResponse<SecondMeUserInfo> = await res.json();
  if (result.code !== 0 || !result.data) {
    throw new Error(`Failed to get user info: ${result.message || "Unknown error"}`);
  }

  return result.data;
}

/**
 * Call SecondMe Act API for structured poker decisions (SSE stream)
 */
export async function callActAPI(
  accessToken: string,
  message: string,
  actionControl: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/secondme/act/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, actionControl }),
  });

  if (!res.ok) {
    throw new Error(`Act API failed: ${res.status}`);
  }

  // Parse SSE stream and concatenate delta content
  const text = await res.text();
  let content = "";

  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.choices?.[0]?.delta?.content) {
        content += data.choices[0].delta.content;
      }
    } catch {
      // skip non-JSON lines
    }
  }

  return content;
}

/**
 * Call SecondMe Chat API for AI commentary (SSE stream)
 */
export async function callChatAPI(
  accessToken: string,
  message: string,
  sessionId?: string
): Promise<{ content: string; sessionId?: string }> {
  const body: Record<string, unknown> = { message };
  if (sessionId) body.sessionId = sessionId;

  const res = await fetch(`${API_BASE}/api/secondme/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Chat API failed: ${res.status}`);
  }

  const text = await res.text();
  let content = "";
  let newSessionId: string | undefined;

  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ") && !line.startsWith("event: ")) continue;

    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.sessionId) {
          newSessionId = data.sessionId;
        }
        if (data.choices?.[0]?.delta?.content) {
          content += data.choices[0].delta.content;
        }
      } catch {
        // skip
      }
    }
  }

  return { content, sessionId: newSessionId };
}

/**
 * Build the OAuth authorization URL
 */
export function buildAuthUrl(state?: string): string {
  const oauthUrl = process.env.SECONDME_OAUTH_URL || "https://go.second.me/oauth/";
  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID!,
    redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    response_type: "code",
    ...(state ? { state } : {}),
  });
  return `${oauthUrl}?${params.toString()}`;
}
