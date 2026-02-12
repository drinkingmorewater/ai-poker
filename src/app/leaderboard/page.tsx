"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface LeaderboardEntry {
  name: string;
  avatarUrl: string | null;
  beans: number;
  totalWins: number;
  totalGames: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getMedal = (i: number) => {
    if (i === 0) return { icon: "\u{1F947}", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };
    if (i === 1) return { icon: "\u{1F948}", color: "text-gray-300", bg: "bg-gray-400/10 border-gray-400/30" };
    if (i === 2) return { icon: "\u{1F949}", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" };
    return { icon: `${i + 1}`, color: "text-gray-500", bg: "bg-white/5 border-white/10" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold hover:text-emerald-400 transition-colors">
              AI 德扑
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">欢乐豆排行榜</span>
          </div>
          <LoginButton variant="dark" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">欢乐豆排行榜</h2>
          <p className="text-gray-400">赢得更多欢乐豆，登上榜首！</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
            <div className="text-5xl mb-4">{"\u{1F3C6}"}</div>
            <p className="text-gray-400 mb-4">暂无排名数据</p>
            <p className="text-sm text-gray-500 mb-6">登录 SecondMe 并完成游戏后即可上榜</p>
            <Link
              href="/game/create"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
            >
              开始游戏
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => {
              const medal = getMedal(i);
              const winRate = entry.totalGames > 0 ? ((entry.totalWins / entry.totalGames) * 100).toFixed(1) : "0.0";

              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${medal.bg} transition-all`}
                >
                  <span className={`w-10 text-center text-2xl font-bold ${medal.color}`}>
                    {medal.icon}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      (entry.name || "?")[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate">{entry.name || "匿名玩家"}</div>
                    <div className="text-sm text-gray-400">
                      {entry.totalGames} 场游戏 | {entry.totalWins} 胜 | 胜率 {winRate}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{entry.beans.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">欢乐豆</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
