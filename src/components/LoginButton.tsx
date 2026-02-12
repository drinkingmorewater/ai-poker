"use client";

import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
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
          <span className="text-sm font-medium text-gray-700">
            {user.name || user.email || "用户"}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
    >
      SecondMe 登录
    </button>
  );
}
