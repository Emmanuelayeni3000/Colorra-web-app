-- Add isFavorite column to Palette table if it does not already exist
-- SQLite lacks IF NOT EXISTS for adding columns, so we need to redefine table.
-- However, since schema.prisma already includes isFavorite, this migration is only
-- necessary if the current database was created after the column was removed.
-- We'll perform a safe redefine copying existing data.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Palette" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "colors" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "isPaletteOfTheDay" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Palette_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Palette_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PaletteCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Palette" ("id", "name", "colors", "isPublic", "userId", "createdAt", "updatedAt", "categoryId", "isPaletteOfTheDay")
  SELECT "id", "name", "colors", "isPublic", "userId", "createdAt", "updatedAt", "categoryId", "isPaletteOfTheDay" FROM "Palette";
DROP TABLE "Palette";
ALTER TABLE "new_Palette" RENAME TO "Palette";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
