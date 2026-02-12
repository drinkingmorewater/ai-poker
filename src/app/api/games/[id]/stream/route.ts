import { NextRequest } from "next/server";
import { gameEventBus } from "@/lib/game-events";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const encoder = new TextEncoder();
  let listenerCleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", data: { gameId: id } })}\n\n`));

      const listener = (event: { type: string; data: unknown }) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream closed
          cleanup();
        }
      };

      const cleanup = () => {
        gameEventBus.removeListener(`game:${id}`, listener);
        listenerCleanup = null;
      };

      listenerCleanup = cleanup;
      gameEventBus.on(`game:${id}`, listener);
    },
    cancel() {
      if (listenerCleanup) listenerCleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
