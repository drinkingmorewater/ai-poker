import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/secondme";

export async function GET() {
  const authUrl = buildAuthUrl();
  return NextResponse.redirect(authUrl);
}
