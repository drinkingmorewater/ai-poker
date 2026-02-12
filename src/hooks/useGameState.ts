"use client";

import { useState, useEffect, useCallback } from "react";
import { useSSE } from "./useSSE";
import type { GameSnapshot } from "@/lib/engine/types";

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

interface ChatMessage {
  seat: number;
  name: string;
  message: string;
  timestamp: number;
}

export function useGameState(gameId: string | null) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [actionLog, setActionLog] = useState<
    { seat: number; action: string; amount?: number; reasoning?: string; phase: string }[]
  >([]);

  const sseUrl = gameId ? `/api/games/${gameId}/stream` : null;
  const { lastEvent, connected } = useSSE<SSEEvent>(sseUrl);

  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.type) {
      case "game_state":
      case "deal_hole_cards":
      case "deal_community":
        if (lastEvent.data.snapshot) {
          setSnapshot(lastEvent.data.snapshot as unknown as GameSnapshot);
        }
        break;

      case "player_action":
        if (lastEvent.data.snapshot) {
          setSnapshot(lastEvent.data.snapshot as unknown as GameSnapshot);
        }
        if (lastEvent.data.action) {
          const act = lastEvent.data as {
            seat: number;
            action: { action: string; amount?: number; reasoning?: string };
            phase: string;
          };
          setActionLog((prev) => [
            ...prev.slice(-100),
            {
              seat: act.seat,
              action: act.action.action,
              amount: act.action.amount,
              reasoning: act.action.reasoning,
              phase: act.phase,
            },
          ]);
        }
        break;

      case "new_hand":
        if (lastEvent.data.snapshot) {
          setSnapshot(lastEvent.data.snapshot as unknown as GameSnapshot);
        }
        setActionLog([]);
        break;

      case "showdown":
        if (lastEvent.data.snapshot) {
          setSnapshot(lastEvent.data.snapshot as unknown as GameSnapshot);
        }
        break;

      case "chat_message": {
        const msg = lastEvent.data as { seat: number; name: string; message: string };
        setChatMessages((prev) => [
          ...prev.slice(-50),
          { ...msg, timestamp: Date.now() },
        ]);
        break;
      }

      case "game_over":
        setGameOver(true);
        break;
    }
  }, [lastEvent]);

  const controlGame = useCallback(
    async (action: string, speed?: number) => {
      if (!gameId) return;
      await fetch(`/api/games/${gameId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, speed }),
      });
    },
    [gameId]
  );

  return {
    snapshot,
    chatMessages,
    actionLog,
    gameOver,
    connected,
    controlGame,
  };
}
