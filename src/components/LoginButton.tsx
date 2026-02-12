"use client";

import { useAuth } from "@/hooks/useAuth";

export function LoginButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { user, loading, login, logout } = useAuth();

  const isDark = variant === "dark";

  if (loading) {
    return (
      <div className={`h-10 w-24 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded animate-pulse`} />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              {(user.name || "U")[0]}
            </div>
          )}
          <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-700"}`}>
            {user.name || user.email || "用户"}
          </span>
          {user.beans !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium">
              {user.beans.toLocaleString()} 欢乐豆
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDark
              ? "text-gray-300 hover:text-white border border-white/20 hover:bg-white/10"
              : "text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        isDark
          ? "bg-emerald-500 text-white hover:bg-emerald-400"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      SecondMe 登录
    </button>
  );
}
