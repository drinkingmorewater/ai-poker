"use client";

import { useParams } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { PokerTable } from "@/components/PokerTable";
import { ActionLog } from "@/components/ActionLog";
import { GameControls } from "@/components/GameControls";
import { LoginButton } from "@/components/LoginButton";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold hover:text-emerald-400 transition-colors">
              AI 德扑
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">游戏 #{gameId.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-4">
            <GameControls onControl={controlGame} connected={connected} />
            <LoginButton variant="dark" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!snapshot ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">等待游戏数据...</p>
              {!connected && <p className="text-red-400 text-sm mt-2">连接中断，正在重连...</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Poker table */}
            <div className="lg:col-span-2">
              <PokerTable snapshot={snapshot} />

              {gameOver && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                  <h3 className="font-bold text-yellow-300 text-lg">游戏结束</h3>
                  <p className="text-sm text-gray-400 mt-1">欢乐豆已根据盈亏自动结算</p>
                  <div className="mt-3 space-y-1">
                    {[...snapshot.players]
                      .sort((a, b) => b.chips - a.chips)
                      .map((p, i) => (
                        <div key={p.seatNumber} className="text-sm">
                          <span className={i === 0 ? "text-yellow-400" : "text-gray-400"}>
                            {i === 0 ? "\u{1F3C6} " : `#${i + 1} `}
                          </span>
                          <span className="text-white">{p.agentName}</span>
                          <span className="text-gray-500">: {p.chips.toLocaleString()} 筹码</span>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-3 justify-center mt-4">
                    <Link
                      href="/"
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      返回大厅
                    </Link>
                    <Link
                      href="/game/create"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
                    >
                      再来一局
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Log */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold text-gray-300 mb-2 text-sm">行动日志</h3>
                <ActionLog actions={actionLog} playerNames={playerNames} />
              </div>

              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-semibold text-gray-300 mb-2 text-sm">AI 对话</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {chatMessages.slice(-10).map((msg, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium text-emerald-400">{msg.name}:</span>{" "}
                        <span className="text-gray-400">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Player standings */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold text-gray-300 mb-2 text-sm">筹码排名</h3>
                <div className="space-y-2">
                  {[...snapshot.players]
                    .sort((a, b) => b.chips - a.chips)
                    .map((p, i) => (
                      <div key={p.seatNumber} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-4">{i + 1}.</span>
                          <span className={`font-medium ${p.agentType === "secondme" ? "text-emerald-400" : "text-gray-300"}`}>
                            {p.agentName}
                          </span>
                        </div>
                        <span className="font-mono text-gray-400">{p.chips.toLocaleString()}</span>
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
