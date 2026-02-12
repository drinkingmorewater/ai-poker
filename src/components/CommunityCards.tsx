"use client";

import type { Card } from "@/lib/engine/types";
import { CardComponent } from "./CardComponent";

export function CommunityCards({ cards }: { cards: Card[] }) {
  // Always show 5 slots
  const slots = Array(5).fill(null).map((_, i) => cards[i] || null);

  return (
    <div className="flex gap-2 items-center justify-center">
      {slots.map((card, i) => (
        <div key={i} className="transition-all duration-500">
          {card ? (
            <CardComponent card={card} size="lg" />
          ) : (
            <div className="w-16 h-22 rounded-lg border-2 border-dashed border-gray-300/50 bg-gray-100/30" />
          )}
        </div>
      ))}
    </div>
  );
}
