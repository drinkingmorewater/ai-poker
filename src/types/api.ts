export interface SecondMeTokenResponse {
  code: number;
  data?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    scope: string[];
  };
  message?: string;
}

export interface SecondMeUserInfo {
  email?: string;
  name?: string;
  avatarUrl?: string;
  route?: string;
}

export interface SecondMeApiResponse<T = unknown> {
  code: number;
  data?: T;
  message?: string;
}

export interface GameCreateRequest {
  name: string;
  players: { agentType: string; agentName: string; userId?: string }[];
  startingChips?: number;
  smallBlind?: number;
  bigBlind?: number;
}

export interface GameListItem {
  id: string;
  name: string;
  status: string;
  playerCount: number;
  currentHand: number;
  createdAt: string;
}

export interface SSEMessage {
  type: "game_state" | "player_action" | "new_hand" | "deal_community" | "showdown" | "chat_message" | "game_over";
  data: unknown;
}
