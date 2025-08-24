-- CreateTable
CREATE TABLE "bookmarked_palettes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "paletteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookmarked_palettes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmarked_palettes_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "palettes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarked_palettes_userId_paletteId_key" ON "bookmarked_palettes"("userId", "paletteId");
