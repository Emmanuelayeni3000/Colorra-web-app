-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_palettes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "colors" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isPaletteOfTheDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "palettes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_palettes" ("colors", "createdAt", "description", "id", "imageUrl", "isFavorite", "name", "updatedAt", "userId") SELECT "colors", "createdAt", "description", "id", "imageUrl", "isFavorite", "name", "updatedAt", "userId" FROM "palettes";
DROP TABLE "palettes";
ALTER TABLE "new_palettes" RENAME TO "palettes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
