"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GameSummary {
  id: string;
  name: string;
  status: string;
  currentHand: number;
  createdAt: string;
  players: { agentName: string; agentType: string; currentChips: number }[];
}

export default function HomePage() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusLabel = (s: string) => {
    switch (s) {
      case "waiting": return "等待中";
      case "running": return "进行中";
      case "paused": return "已暂停";
      case "finished": return "已结束";
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "waiting": return "bg-yellow-100 text-yellow-800";
      case "running": return "bg-green-100 text-green-800";
      case "paused": return "bg-blue-100 text-blue-800";
      case "finished": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">♠</span>
            <h1 className="text-2xl font-bold tracking-tight">AI 德扑</h1>
            <span className="text-sm text-gray-400 ml-2">AI 智能体德州扑克竞技平台</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/history" className="text-sm text-gray-300 hover:text-white transition-colors">
              历史记录
            </Link>
            <Link href="/stats" className="text-sm text-gray-300 hover:text-white transition-colors">
              统计分析
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            AI 智能体德州扑克
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            创建游戏，选择 AI 策略，观看多个智能体自主对局。
            支持 SecondMe AI 分身与预设策略混合对战。
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/game/create"
            className="group p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 hover:border-green-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">+</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-green-300 transition-colors">
              创建新游戏
            </h3>
            <p className="text-sm text-gray-400">
              配置玩家数量、筹码、盲注，选择 AI 策略开始新对局
            </p>
          </Link>

          <Link
            href="/stats"
            className="group p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 hover:border-blue-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">&#x1F4CA;</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">
              策略分析
            </h3>
            <p className="text-sm text-gray-400">
              查看各 AI 策略的胜率、盈亏和表现对比
            </p>
          </Link>

          <Link
            href="/history"
            className="group p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">&#x1F4DC;</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition-colors">
              历史回放
            </h3>
            <p className="text-sm text-gray-400">
              回顾已完成的对局记录和详细手牌历史
            </p>
          </Link>
        </div>

        {/* Games List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">对局列表</h3>
            <Link
              href="/game/create"
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
              + 新建对局
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-5xl mb-4">♠ ♥ ♦ ♣</div>
              <p className="text-gray-400 mb-6">还没有任何对局，创建第一个游戏开始吧！</p>
              <Link
                href="/game/create"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
              >
                创建新游戏
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={game.status === "finished" ? `/history` : `/game/${game.id}`}
                  className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-lg">{game.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(game.status)}`}>
                          {statusLabel(game.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {game.players.length} 位玩家 | 第 {game.currentHand} 手 | 创建于 {new Date(game.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <div className="text-gray-500 text-2xl">&#x203A;</div>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {game.players.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-white/10 text-xs"
                      >
                        {p.agentName} ({p.agentType}) - {p.currentChips} chips
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          AI 德扑 - Powered by SecondMe AI | Next.js + TypeScript + Prisma
        </div>
      </footer>
    </div>
  );
}
