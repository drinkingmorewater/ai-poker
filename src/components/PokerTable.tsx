"use client";

import type { GameSnapshot } from "@/lib/engine/types";
import { PlayerSeat } from "./PlayerSeat";
import { CommunityCards } from "./CommunityCards";

// Seat positions around an oval table (up to 9 seats)
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: "85%", left: "50%" },   // 0: bottom center
  { top: "75%", left: "15%" },   // 1: bottom left
  { top: "45%", left: "5%" },    // 2: mid left
  { top: "15%", left: "15%" },   // 3: top left
  { top: "5%", left: "35%" },    // 4: top left-center
  { top: "5%", left: "65%" },    // 5: top right-center
  { top: "15%", left: "85%" },   // 6: top right
  { top: "45%", left: "95%" },   // 7: mid right
  { top: "75%", left: "85%" },   // 8: bottom right
];

const PHASE_LABELS: Record<string, string> = {
  preflop: "翻前", flop: "翻牌", turn: "转牌", river: "河牌", showdown: "摊牌",
};

export function PokerTable({ snapshot }: { snapshot: GameSnapshot }) {
  const totalPot = snapshot.pots.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ paddingBottom: "65%" }}>
      {/* Table background */}
      <div className="absolute inset-4 rounded-[50%] bg-gradient-to-b from-emerald-700 to-emerald-800 border-8 border-amber-900 shadow-2xl shadow-black/30">
        {/* Inner felt */}
        <div className="absolute inset-4 rounded-[50%] border-2 border-emerald-600/30">
          {/* Center area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            {/* Community cards */}
            <CommunityCards cards={snapshot.communityCards} />

            {/* Pot display */}
            {totalPot > 0 && (
              <div className="bg-black/30 rounded-full px-4 py-1">
                <span className="text-yellow-300 text-sm font-bold">
                  底池: {totalPot.toLocaleString()}
                </span>
              </div>
            )}

            {/* Phase indicator */}
            <span className="text-emerald-300/60 text-xs">
              第{snapshot.handNumber}手 · {PHASE_LABELS[snapshot.phase] || snapshot.phase}
            </span>
          </div>
        </div>
      </div>

      {/* Player seats */}
      {snapshot.players.map((player) => (
        <PlayerSeat
          key={player.seatNumber}
          player={player}
          isActive={snapshot.currentPlayerSeat === player.seatNumber}
          isDealer={snapshot.dealerSeat === player.seatNumber}
          position={SEAT_POSITIONS[player.seatNumber % SEAT_POSITIONS.length]}
        />
      ))}
    </div>
  );
}
