"use client";

import type { PlayerState } from "@/lib/engine/types";
import { CardGroup } from "./CardComponent";

const ACTION_LABELS: Record<string, string> = {
  fold: "弃牌", check: "过牌", call: "跟注", bet: "下注", raise: "加注", all_in: "全下",
};

const ACTION_COLORS: Record<string, string> = {
  fold: "bg-gray-500", check: "bg-blue-500", call: "bg-green-500",
  bet: "bg-yellow-500", raise: "bg-orange-500", all_in: "bg-red-500",
};

export function PlayerSeat({ player, isActive, isDealer, position }: {
  player: PlayerState;
  isActive: boolean;
  isDealer: boolean;
  position: { top: string; left: string };
}) {
  const isEliminated = player.status === "eliminated";
  const isFolded = player.status === "folded";

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
        ${isActive ? "scale-110 z-10" : "z-0"}
        ${isEliminated ? "opacity-40" : ""}
        ${isFolded ? "opacity-60" : ""}
      `}
      style={{ top: position.top, left: position.left }}
    >
      <div className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 min-w-[100px]
        ${isActive ? "border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-200/50" : "border-gray-200 bg-white shadow-sm"}
        ${isFolded ? "border-gray-300 bg-gray-50" : ""}
      `}>
        {/* Cards */}
        <div className="flex gap-0.5">
          {player.holeCards.length > 0 ? (
            <CardGroup cards={player.holeCards} faceDown={isFolded} size="sm" />
          ) : (
            <>
              {!isEliminated && <CardGroup cards={[]} faceDown={true} size="sm" />}
              {!isEliminated && <CardGroup cards={[]} faceDown={true} size="sm" />}
            </>
          )}
        </div>

        {/* Name + chip count */}
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            {isDealer && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-[10px] font-bold text-yellow-900">D</span>
            )}
            <span className={`text-xs font-semibold truncate max-w-[80px] ${player.agentType === "secondme" ? "text-emerald-600" : "text-gray-700"}`}>
              {player.agentName}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {player.chips.toLocaleString()}
          </div>
        </div>

        {/* Last action badge */}
        {player.lastAction && !isEliminated && (
          <div className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium ${ACTION_COLORS[player.lastAction.action] || "bg-gray-500"}`}>
            {ACTION_LABELS[player.lastAction.action] || player.lastAction.action}
            {player.lastAction.amount ? ` ${player.lastAction.amount}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
