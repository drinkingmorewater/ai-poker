"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface Stats {
  totalGames: number;
  agentStats: Record<string, { games: number; wins: number; totalProfit: number }>;
}

const AGENT_LABELS: Record<string, string> = {
  random: "随机策略",
  secondme: "SecondMe AI",
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
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
            <span className="text-sm text-gray-400">统计分析</span>
          </div>
          <LoginButton variant="dark" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">统计分析</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : !stats || stats.totalGames === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-gray-400 mb-4">暂无统计数据，完成一些游戏后再来查看</p>
            <Link href="/game/create" className="text-emerald-400 hover:underline text-sm">
              开始游戏
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-gray-300 mb-4">总览</h3>
              <div className="text-3xl font-bold text-emerald-400">{stats.totalGames}</div>
              <div className="text-sm text-gray-500">已完成游戏</div>
            </div>

            {/* Agent comparison */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-gray-300 mb-4">策略对比</h3>
              <div className="space-y-4">
                {Object.entries(stats.agentStats).map(([type, data]) => {
                  const winRate = data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : "0.0";
                  const avgProfit = data.games > 0 ? Math.round(data.totalProfit / data.games) : 0;

                  return (
                    <div key={type} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {AGENT_LABELS[type] || type}
                        </span>
                        <span className="text-sm text-gray-500">{data.games} 场</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-emerald-400">{winRate}%</div>
                          <div className="text-xs text-gray-500">胜率</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">{data.wins}</div>
                          <div className="text-xs text-gray-500">胜场</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${avgProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {avgProfit >= 0 ? "+" : ""}{avgProfit}
                          </div>
                          <div className="text-xs text-gray-500">场均盈亏</div>
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
