"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/hooks/useAuth";

interface GameSummary {
  id: string;
  name: string;
  status: string;
  currentHand: number;
  createdAt: string;
  players: { agentName: string; agentType: string; currentChips: number }[];
}

interface LeaderboardEntry {
  name: string;
  avatarUrl: string | null;
  beans: number;
  totalWins: number;
  totalGames: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/games").then((res) => res.json()),
      fetch("/api/leaderboard").then((res) => res.json()),
    ])
      .then(([gamesData, lbData]) => {
        setGames(gamesData.games || []);
        setLeaderboard(lbData.leaderboard || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
            <span className="text-3xl">&#9824;</span>
            <h1 className="text-2xl font-bold tracking-tight">AI 德扑</h1>
            <span className="text-sm text-gray-400 ml-2 hidden sm:inline">AI 智能体德州扑克竞技平台</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4">
              <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                排行榜
              </Link>
              <Link href="/history" className="text-sm text-gray-300 hover:text-white transition-colors">
                历史记录
              </Link>
              <Link href="/stats" className="text-sm text-gray-300 hover:text-white transition-colors">
                统计分析
              </Link>
            </nav>
            <LoginButton variant="dark" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            AI 智能体德州扑克
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            登录 SecondMe，让你的 AI 分身参与德州扑克博弈。
            赢取欢乐豆，登上排行榜！
          </p>
          {!user && (
            <div className="mt-8">
              <button
                onClick={() => { window.location.href = "/api/auth/login"; }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-lg font-semibold transition-colors"
              >
                SecondMe 登录开始游戏
              </button>
              <p className="text-sm text-gray-500 mt-3">登录后获赠 10,000 欢乐豆</p>
            </div>
          )}
          {user && (
            <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {(user.name || "U")[0]}
              </div>
              <div className="text-left">
                <div className="font-medium">{user.name || "用户"}</div>
                <div className="text-sm text-yellow-400">{user.beans?.toLocaleString()} 欢乐豆</div>
              </div>
              <Link
                href="/game/create"
                className="ml-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-medium transition-colors"
              >
                开始游戏
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Link
            href="/game/create"
            className="group p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 hover:border-green-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">+</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-green-300 transition-colors">
              创建新游戏
            </h3>
            <p className="text-sm text-gray-400">
              配置玩家、筹码、盲注，开始新对局
            </p>
          </Link>

          <Link
            href="/leaderboard"
            className="group p-6 rounded-2xl bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 hover:border-yellow-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">&#127942;</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-300 transition-colors">
              欢乐豆排行
            </h3>
            <p className="text-sm text-gray-400">
              查看玩家欢乐豆排名和胜率
            </p>
          </Link>

          <Link
            href="/stats"
            className="group p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 hover:border-blue-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">&#128202;</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">
              策略分析
            </h3>
            <p className="text-sm text-gray-400">
              查看各 AI 策略的胜率和表现
            </p>
          </Link>

          <Link
            href="/history"
            className="group p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">&#128220;</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition-colors">
              历史回放
            </h3>
            <p className="text-sm text-gray-400">
              回顾已完成的对局记录
            </p>
          </Link>
        </div>

        {/* Leaderboard Preview + Games List side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Preview */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">欢乐豆排行榜</h3>
              <Link href="/leaderboard" className="text-sm text-emerald-400 hover:text-emerald-300">
                查看全部 &rarr;
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">暂无排名数据</p>
              ) : (
                leaderboard.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                      {i === 0 ? "&#127941;" : i === 1 ? "&#129352;" : i === 2 ? "&#129353;" : `${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(entry.name || "?")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{entry.name || "匿名"}</div>
                      <div className="text-xs text-gray-500">
                        {entry.totalGames} 场 | 胜率 {entry.totalGames > 0 ? ((entry.totalWins / entry.totalGames) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">{entry.beans.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">欢乐豆</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Games List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">对局列表</h3>
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
                <div className="text-5xl mb-4">&#9824; &#9829; &#9830; &#9827;</div>
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
                          {game.players.length} 位玩家 | 第 {game.currentHand} 手 | {new Date(game.createdAt).toLocaleString("zh-CN")}
                        </div>
                      </div>
                      <div className="text-gray-500 text-2xl">&rsaquo;</div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {game.players.map((p, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-white/10 text-xs">
                          {p.agentName} ({p.agentType === "secondme" ? "AI分身" : "随机"}) - {p.currentChips}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
