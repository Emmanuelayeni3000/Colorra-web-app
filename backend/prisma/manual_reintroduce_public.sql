-- Manual schema alignment: reintroduce isPublic, category columns and bookmarked_palettes table
-- Columns (will error harmlessly if already exist)
ALTER TABLE palettes ADD COLUMN isPublic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE palettes ADD COLUMN category TEXT;

-- Bookmarked palettes table
CREATE TABLE IF NOT EXISTS "bookmarked_palettes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "paletteId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookmarked_palettes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "bookmarked_palettes_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "palettes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "bookmarked_palettes_userId_paletteId_key" ON "bookmarked_palettes" ("userId", "paletteId");
