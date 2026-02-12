"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  beans: number;
  totalWins: number;
  totalGames: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/info");
      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = () => {
    window.location.href = "/api/auth/login";
  };

  const logout = () => {
    window.location.href = "/api/auth/logout";
  };

  return { user, loading, login, logout, refresh: fetchUser };
}
