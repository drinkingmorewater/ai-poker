"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GameItem {
  id: string;
  name: string;
  status: string;
  playerCount: number;
  currentHand: number;
  createdAt: string;
  finishedAt: string | null;
}

export default function HistoryPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data: GameItem[]) => setGames(data.filter((g) => g.status === "finished")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-gray-800 hover:text-emerald-600 transition-colors">
            AI 德扑
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">历史记录</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">已结束的游戏</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无历史记录</p>
            <Link href="/game/create" className="text-emerald-600 hover:underline text-sm">
              开始一局游戏
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{game.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {game.playerCount} 名玩家 · {game.currentHand} 手 · {new Date(game.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <span className="text-sm text-blue-600">查看详情 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
