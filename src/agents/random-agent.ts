import type { PokerAgent } from "./base-agent";
import type { DecisionContext, PokerAction, ActionType } from "@/lib/engine/types";

export class RandomAgent implements PokerAgent {
  type = "random";
  name: string;

  constructor(name?: string) {
    this.name = name || "随机玩家";
  }

  async makeDecision(context: DecisionContext): Promise<PokerAction> {
    const { legalActions, currentBet, myCurrentBet, myChips, minRaise } = context;
    const toCall = currentBet - myCurrentBet;

    // Weighted random: 55% call/check, 25% raise, 20% fold
    const roll = Math.random();

    if (roll < 0.20 && legalActions.includes("fold") && toCall > 0) {
      return { action: "fold", reasoning: "随机决策：弃牌" };
    }

    if (roll < 0.75) {
      // Call or check
      if (toCall === 0 && legalActions.includes("check")) {
        return { action: "check", reasoning: "随机决策：过牌" };
      }
      if (legalActions.includes("call")) {
        return { action: "call", reasoning: "随机决策：跟注" };
      }
    }

    // Raise
    const canRaise = legalActions.includes("raise") || legalActions.includes("bet");
    if (canRaise && myChips > toCall) {
      const raiseAction: ActionType = currentBet === 0 ? "bet" : "raise";
      // Random raise between min and 3x min
      const raiseAmount = Math.min(
        minRaise + Math.floor(Math.random() * minRaise * 2),
        myChips + myCurrentBet
      );
      return {
        action: raiseAction,
        amount: raiseAmount,
        reasoning: `随机决策：加注到 ${raiseAmount}`,
      };
    }

    // Fallback: check or call
    if (legalActions.includes("check")) {
      return { action: "check", reasoning: "随机决策：过牌" };
    }
    if (legalActions.includes("call")) {
      return { action: "call", reasoning: "随机决策：跟注" };
    }

    return { action: "fold", reasoning: "随机决策：弃牌（无其他选项）" };
  }
}
