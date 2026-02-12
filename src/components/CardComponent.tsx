"use client";

import type { Card } from "@/lib/engine/types";

const SUIT_COLORS: Record<string, string> = {
  s: "text-gray-800",
  c: "text-emerald-700",
  h: "text-red-500",
  d: "text-blue-500",
};

const SUIT_SYMBOLS: Record<string, string> = {
  s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663",
};

const RANK_DISPLAY: Record<number, string> = {
  2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10",
  11: "J", 12: "Q", 13: "K", 14: "A",
};

export function CardComponent({ card, faceDown = false, size = "md" }: {
  card?: Card;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-11 text-xs",
    md: "w-12 h-17 text-sm",
    lg: "w-16 h-22 text-base",
  };

  if (faceDown || !card) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400 shadow-md flex items-center justify-center`}>
        <div className="w-3/4 h-3/4 rounded border border-blue-400/50 bg-blue-700/50 flex items-center justify-center">
          <span className="text-blue-200 font-bold text-xs">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white border border-gray-300 shadow-md flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-105`}>
      <span className={`font-bold leading-none ${SUIT_COLORS[card.suit]}`}>
        {RANK_DISPLAY[card.rank]}
      </span>
      <span className={`leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

export function CardGroup({ cards, faceDown = false, size = "md" }: {
  cards: Card[];
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex gap-1">
      {cards.map((card, i) => (
        <CardComponent key={i} card={card} faceDown={faceDown} size={size} />
      ))}
    </div>
  );
}
