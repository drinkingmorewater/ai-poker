"use client";

const ACTION_LABELS: Record<string, string> = {
  fold: "弃牌", check: "过牌", call: "跟注", bet: "下注", raise: "加注", all_in: "全下",
};

const PHASE_LABELS: Record<string, string> = {
  preflop: "翻前", flop: "翻牌", turn: "转牌", river: "河牌",
};

interface ActionEntry {
  seat: number;
  action: string;
  amount?: number;
  reasoning?: string;
  phase: string;
}

export function ActionLog({ actions, playerNames }: {
  actions: ActionEntry[];
  playerNames: Record<number, string>;
}) {
  if (actions.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        等待行动...
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {actions.map((entry, i) => (
        <div key={i} className="text-xs flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
          <span className="text-gray-400 shrink-0">{PHASE_LABELS[entry.phase] || entry.phase}</span>
          <span className="font-medium text-gray-700 shrink-0">
            {playerNames[entry.seat] || `座位${entry.seat}`}
          </span>
          <span className="text-gray-600">
            {ACTION_LABELS[entry.action] || entry.action}
            {entry.amount ? ` ${entry.amount}` : ""}
          </span>
          {entry.reasoning && (
            <span className="text-gray-400 italic truncate">{entry.reasoning}</span>
          )}
        </div>
      ))}
    </div>
  );
}
