"use client";

import { useState } from "react";

export function GameControls({ onControl, connected }: {
  onControl: (action: string, speed?: number) => void;
  connected: boolean;
}) {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);

  const handlePause = () => {
    if (paused) {
      onControl("resume");
      setPaused(false);
    } else {
      onControl("pause");
      setPaused(true);
    }
  };

  const handleSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    onControl("speed", newSpeed);
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-200">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-xs text-gray-500">{connected ? "已连接" : "断开"}</span>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Pause/Resume */}
      <button
        onClick={handlePause}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${paused
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
      >
        {paused ? "继续" : "暂停"}
      </button>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 mr-1">速度:</span>
        {[0.5, 1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => handleSpeed(s)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors
              ${speed === s
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Stop */}
      <button
        onClick={() => onControl("stop")}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        终止
      </button>
    </div>
  );
}
