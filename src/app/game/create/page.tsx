"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface PlayerConfig {
  agentType: string;
  agentName: string;
}

const DEFAULT_NAMES = ["小明", "小红", "小李", "小张", "小王", "小赵", "小刘", "小陈", "小杨"];

export default function CreateGamePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("AI 德扑对局");
  const [startingChips, setStartingChips] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { agentType: "random", agentName: "随机玩家 A" },
    { agentType: "random", agentName: "随机玩家 B" },
    { agentType: "random", agentName: "随机玩家 C" },
    { agentType: "random", agentName: "随机玩家 D" },
  ]);
  const [loading, setLoading] = useState(false);
  const [autoStart, setAutoStart] = useState(true);

  const addPlayer = () => {
    if (players.length >= 9) return;
    const idx = players.length;
    setPlayers([...players, {
      agentType: "random",
      agentName: DEFAULT_NAMES[idx] || `玩家 ${idx + 1}`,
    }]);
  };

  const removePlayer = (idx: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const updatePlayer = (idx: number, field: keyof PlayerConfig, value: string) => {
    const updated = [...players];
    updated[idx] = { ...updated[idx], [field]: value };
    setPlayers(updated);
  };

  const addMyAgent = () => {
    if (!user) return;
    if (players.length >= 9) return;
    setPlayers([...players, {
      agentType: "secondme",
      agentName: `${user.name || "我"} 的AI分身`,
    }]);
  };

  const handleSubmit = async () => {
    if (players.length < 2) return;
    setLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          players: players.map(p => ({
            ...p,
            userId: p.agentType === "secondme" ? user?.id : undefined,
          })),
          startingChips,
          smallBlind,
          bigBlind,
        }),
      });

      const game = await res.json();
      if (game.error) {
        alert(game.error);
        return;
      }

      if (autoStart) {
        await fetch(`/api/games/${game.id}/start`, { method: "POST" });
      }

      router.push(`/game/${game.id}`);
    } catch (error) {
      console.error(error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-gray-800 hover:text-emerald-600 transition-colors">
            AI 德扑
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">创建新游戏</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Game name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">游戏名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>

          {/* Game settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">初始筹码</label>
              <input
                type="number"
                value={startingChips}
                onChange={(e) => setStartingChips(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">小盲注</label>
              <input
                type="number"
                value={smallBlind}
                onChange={(e) => setSmallBlind(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">大盲注</label>
              <input
                type="number"
                value={bigBlind}
                onChange={(e) => setBigBlind(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">玩家 ({players.length}/9)</label>
              <div className="flex gap-2">
                {user && (
                  <button
                    onClick={addMyAgent}
                    disabled={players.length >= 9}
                    className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    + 我的 AI 分身
                  </button>
                )}
                <button
                  onClick={addPlayer}
                  disabled={players.length >= 9}
                  className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  + 随机玩家
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-400 w-8">#{i + 1}</span>
                  <select
                    value={p.agentType}
                    onChange={(e) => updatePlayer(i, "agentType", e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="random">随机策略</option>
                    {user && <option value="secondme">SecondMe AI</option>}
                  </select>
                  <input
                    type="text"
                    value={p.agentName}
                    onChange={(e) => updatePlayer(i, "agentName", e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="玩家名称"
                  />
                  <button
                    onClick={() => removePlayer(i)}
                    disabled={players.length <= 2}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 text-sm"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-start toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoStart"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="autoStart" className="text-sm text-gray-600">创建后自动开始</label>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || players.length < 2}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "创建中..." : "创建游戏"}
          </button>
        </div>
      </main>
    </div>
  );
}
