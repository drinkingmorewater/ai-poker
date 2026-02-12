import type { DecisionContext, PokerAction } from "@/lib/engine/types";

export interface PokerAgent {
  type: string;
  name: string;
  makeDecision(context: DecisionContext): Promise<PokerAction>;
  getComment?(context: DecisionContext): Promise<string | null>;
}
