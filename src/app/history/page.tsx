"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface GameItem {
  id: string;
  name: string;
  status: string;
  currentHand: number;
  createdAt: string;
  finishedAt: string | null;
  players: { agentName: string; agentType: string; currentChips: number }[];
}

export default function HistoryPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => {
        const allGames = data.games || data || [];
        setGames(allGames.filter((g: GameItem) => g.status === "finished"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
      <header className="border-b border-white/10 backdrop-blur-sm px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold hover:text-emerald-400 transition-colors">
              AI 德扑
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">历史记录</span>
          </div>
          <LoginButton variant="dark" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">已结束的游戏</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-gray-400 mb-4">暂无历史记录</p>
            <Link href="/game/create" className="text-emerald-400 hover:underline text-sm">
              开始一局游戏
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="p-5 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{game.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {game.players?.length || 0} 名玩家 | {game.currentHand} 手 | {new Date(game.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-600/30 text-gray-400">已结束</span>
                </div>
                {game.players && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {game.players
                      .sort((a, b) => b.currentChips - a.currentChips)
                      .map((p, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs ${
                            i === 0 ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {i === 0 ? "\u{1F3C6} " : ""}{p.agentName}: {p.currentChips}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
