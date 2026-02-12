import type { PokerAgent } from "./base-agent";
import { RandomAgent } from "./random-agent";
import { SecondMeAgent } from "./secondme-agent";

export interface AgentConfig {
  type: string;
  name: string;
  accessToken?: string; // required for secondme agent
}

const AGENT_INFO: Record<string, { name: string; description: string }> = {
  random: { name: "随机策略", description: "完全随机决策，作为基线对比。55% 跟注/过牌，25% 加注，20% 弃牌。" },
  secondme: { name: "SecondMe AI", description: "通过 SecondMe Act API 驱动的 AI 分身，基于用户个性做出扑克决策。" },
};

export function createAgent(config: AgentConfig): PokerAgent {
  switch (config.type) {
    case "random":
      return new RandomAgent(config.name);
    case "secondme":
      if (!config.accessToken) {
        throw new Error("SecondMe agent requires an access token");
      }
      return new SecondMeAgent(config.name, config.accessToken);
    default:
      return new RandomAgent(config.name || "未知策略");
  }
}

export function getAvailableAgents() {
  return Object.entries(AGENT_INFO).map(([type, info]) => ({
    type,
    ...info,
  }));
}
