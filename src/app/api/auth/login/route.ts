import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/secondme";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const authUrl = buildAuthUrl(origin);

  console.log("[auth/login] origin:", origin);
  console.log("[auth/login] OAuth URL:", authUrl);

  if (!authUrl || !authUrl.startsWith("http")) {
    return NextResponse.json(
      { error: "OAuth configuration error. Please check environment variables." },
      { status: 500 }
    );
  }

  return new NextResponse(null, {
    status: 302,
    headers: { Location: authUrl },
  });
}
