import { PrismaClient } from "@prisma/client";

const isVercel = !!process.env.VERCEL;

// On Vercel serverless, SQLite must use /tmp (only writable directory)
if (isVercel && !process.env.DATABASE_URL?.includes("/tmp/")) {
  process.env.DATABASE_URL = "file:/tmp/ai-poker.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  dbInitialized: boolean;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Auto-init tables on module load (fire-and-forget)
ensureTables().catch(console.warn);

/** Ensure SQLite tables exist (needed on Vercel where /tmp is ephemeral) */
async function ensureTables() {
  if (globalForPrisma.dbInitialized) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "secondme_user_id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT,
        "avatar_url" TEXT,
        "access_token" TEXT NOT NULL,
        "refresh_token" TEXT NOT NULL,
        "token_expires_at" DATETIME NOT NULL,
        "beans" INTEGER NOT NULL DEFAULT 10000,
        "total_wins" INTEGER NOT NULL DEFAULT 0,
        "total_games" INTEGER NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_secondme_user_id_key" ON "users"("secondme_user_id")`
    );
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "games" (
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
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "game_players" (
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
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "hand_history" (
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
      )
    `);
    globalForPrisma.dbInitialized = true;
  } catch (e) {
    console.warn("ensureTables error:", e);
  }
}

/** Get prisma client with tables guaranteed to exist */
export async function getDb() {
  await ensureTables();
  return prisma;
}
