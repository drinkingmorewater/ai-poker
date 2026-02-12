"use client";

import { useParams } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { PokerTable } from "@/components/PokerTable";
import { ActionLog } from "@/components/ActionLog";
import { GameControls } from "@/components/GameControls";
import Link from "next/link";

export default function GameViewPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { snapshot, chatMessages, actionLog, gameOver, connected, controlGame } = useGameState(gameId);

  const playerNames: Record<number, string> = {};
  if (snapshot) {
    for (const p of snapshot.players) {
      playerNames[p.seatNumber] = p.agentName;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-gray-800 hover:text-emerald-600 transition-colors">
              AI 德扑
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">游戏 #{gameId.slice(0, 8)}</span>
          </div>
          <GameControls onControl={controlGame} connected={connected} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!snapshot ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">等待游戏数据...</p>
              {!connected && <p className="text-red-400 text-sm mt-2">连接中断，正在重连...</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Poker table */}
            <div className="lg:col-span-2">
              <PokerTable snapshot={snapshot} />

              {gameOver && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <h3 className="font-bold text-yellow-800 text-lg">游戏结束</h3>
                  <div className="mt-2 space-y-1">
                    {[...snapshot.players]
                      .sort((a, b) => b.chips - a.chips)
                      .map((p, i) => (
                        <div key={p.seatNumber} className="text-sm text-gray-600">
                          {i === 0 ? "🏆 " : `#${i + 1} `}
                          {p.agentName}: {p.chips.toLocaleString()} 筹码
                        </div>
                      ))}
                  </div>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    返回大厅
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Log */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">行动日志</h3>
                <ActionLog actions={actionLog} playerNames={playerNames} />
              </div>

              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">AI 对话</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {chatMessages.slice(-10).map((msg, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium text-emerald-600">{msg.name}:</span>{" "}
                        <span className="text-gray-600">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Player standings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">筹码排名</h3>
                <div className="space-y-2">
                  {[...snapshot.players]
                    .sort((a, b) => b.chips - a.chips)
                    .map((p, i) => (
                      <div key={p.seatNumber} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-4">{i + 1}.</span>
                          <span className={`font-medium ${p.agentType === "secondme" ? "text-emerald-600" : "text-gray-700"}`}>
                            {p.agentName}
                          </span>
                        </div>
                        <span className="font-mono text-gray-600">{p.chips.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
