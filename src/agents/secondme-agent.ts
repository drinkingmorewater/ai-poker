import type { PokerAgent } from "./base-agent";
import type { DecisionContext, PokerAction } from "@/lib/engine/types";
import { callActAPI, callChatAPI } from "@/lib/secondme";
import { cardToString } from "@/lib/engine/types";

export class SecondMeAgent implements PokerAgent {
  type = "secondme";
  name: string;
  private accessToken: string;

  constructor(name: string, accessToken: string) {
    this.name = name;
    this.accessToken = accessToken;
  }

  async makeDecision(context: DecisionContext): Promise<PokerAction> {
    const message = this.formatContext(context);
    const actionControl = `仅输出合法JSON对象，不要解释。
结构: {"action": "fold"|"check"|"call"|"raise"|"all_in", "amount": number, "reasoning": string}
规则:
- action 必须是以下之一: ${context.legalActions.join(", ")}
- amount 仅在 action 为 "raise" 或 "bet" 时需要，范围 ${context.minRaise} 到 ${context.maxRaise}
- reasoning 用一句话解释决策理由
根据牌局信息做出最佳德州扑克决策。`;

    try {
      const result = await callActAPI(this.accessToken, message, actionControl);
      const parsed = JSON.parse(result);

      // Validate the action
      if (!context.legalActions.includes(parsed.action)) {
        // Fallback to a safe action
        return this.fallbackAction(context);
      }

      return {
        action: parsed.action,
        amount: parsed.amount,
        reasoning: parsed.reasoning || "SecondMe AI 决策",
      };
    } catch (error) {
      console.error("SecondMe Act API error:", error);
      return this.fallbackAction(context);
    }
  }

  async getComment(context: DecisionContext): Promise<string | null> {
    try {
      const message = `你正在打德州扑克。当前情况：手牌 ${context.holeCards.map(cardToString).join(" ")}，公共牌 ${context.communityCards.map(cardToString).join(" ") || "无"}，底池 ${context.potSize}。用一句简短的话评论当前牌局（可以嘲讽、自信或紧张）。`;
      const { content } = await callChatAPI(this.accessToken, message);
      return content || null;
    } catch {
      return null;
    }
  }

  private formatContext(context: DecisionContext): string {
    const lines = [
      `=== 德州扑克牌局 ===`,
      `你的手牌: ${context.holeCards.map(cardToString).join(" ")}`,
      `公共牌: ${context.communityCards.length > 0 ? context.communityCards.map(cardToString).join(" ") : "（尚未发牌）"}`,
      `底池: ${context.potSize} 筹码`,
      `当前下注: ${context.currentBet}`,
      `你已下注: ${context.myCurrentBet}`,
      `需要跟注: ${context.currentBet - context.myCurrentBet}`,
      `你的筹码: ${context.myChips}`,
      `你的位置: ${context.position}`,
      `可选操作: ${context.legalActions.join(", ")}`,
      `最小加注: ${context.minRaise}`,
      ``,
      `对手信息:`,
    ];

    for (const opp of context.opponents) {
      lines.push(`  座位${opp.seat}: 筹码${opp.chips}, 状态${opp.status}, 已下注${opp.currentBet}`);
    }

    if (context.handHistory.length > 0) {
      lines.push(``, `本手行动历史:`);
      for (const h of context.handHistory.slice(-8)) {
        lines.push(`  座位${h.seat} ${h.phase}: ${h.action}${h.amount ? ` ${h.amount}` : ""}`);
      }
    }

    return lines.join("\n");
  }

  private fallbackAction(context: DecisionContext): PokerAction {
    if (context.legalActions.includes("check")) {
      return { action: "check", reasoning: "SecondMe API 异常，安全过牌" };
    }
    if (context.legalActions.includes("call")) {
      return { action: "call", reasoning: "SecondMe API 异常，安全跟注" };
    }
    return { action: "fold", reasoning: "SecondMe API 异常，弃牌" };
  }
}
