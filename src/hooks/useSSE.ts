"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useSSE<T = unknown>(url: string | null) {
  const [events, setEvents] = useState<T[]>([]);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!url) return;
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const es = new EventSource(url);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        setLastEvent(data);
        setEvents((prev) => [...prev.slice(-200), data]); // keep last 200
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3s
      setTimeout(() => connect(), 3000);
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [connect]);

  const clear = () => {
    setEvents([]);
    setLastEvent(null);
  };

  return { events, lastEvent, connected, clear };
}
