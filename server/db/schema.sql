-- Run this in psql (or any PostgreSQL client) to create tables

CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Room" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT,
  "creatorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Room_creatorId_idx" ON "Room"("creatorId");

CREATE TABLE IF NOT EXISTS "Round" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" UUID NOT NULL REFERENCES "Room"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "Round_roomId_idx" ON "Round"("roomId");

CREATE TABLE IF NOT EXISTS "Question" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roundId" UUID NOT NULL REFERENCES "Round"(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "Question_roundId_order_idx" ON "Question"("roundId", "order");
