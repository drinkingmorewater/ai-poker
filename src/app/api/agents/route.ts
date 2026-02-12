import { NextResponse } from "next/server";
import { getAvailableAgents } from "@/agents/registry";

export async function GET() {
  return NextResponse.json(getAvailableAgents());
}
