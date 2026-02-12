-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secondme_user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "starting_chips" INTEGER NOT NULL DEFAULT 1000,
    "small_blind" INTEGER NOT NULL DEFAULT 10,
    "big_blind" INTEGER NOT NULL DEFAULT 20,
    "current_hand" INTEGER NOT NULL DEFAULT 0,
    "speed_multiplier" REAL NOT NULL DEFAULT 1.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "finished_at" DATETIME
);

-- CreateTable
CREATE TABLE "game_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "game_id" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "agent_type" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL,
    "user_id" TEXT,
    "current_chips" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "hands_won" INTEGER NOT NULL DEFAULT 0,
    "total_profit" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "game_players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "game_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hand_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "game_id" TEXT NOT NULL,
    "hand_number" INTEGER NOT NULL,
    "dealer_seat" INTEGER NOT NULL,
    "community_cards" TEXT NOT NULL,
    "pot_total" INTEGER NOT NULL,
    "actions" TEXT NOT NULL,
    "winners" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hand_history_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_secondme_user_id_key" ON "users"("secondme_user_id");
