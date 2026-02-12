-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("access_token", "avatar_url", "created_at", "email", "id", "name", "refresh_token", "secondme_user_id", "token_expires_at", "updated_at") SELECT "access_token", "avatar_url", "created_at", "email", "id", "name", "refresh_token", "secondme_user_id", "token_expires_at", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_secondme_user_id_key" ON "users"("secondme_user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
