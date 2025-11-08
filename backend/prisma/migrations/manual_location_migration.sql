-- Step 1: Create locations table
CREATE TABLE IF NOT EXISTS "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Step 2: Add locationId column to reservations (nullable for now)
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "locationId" TEXT;

-- Step 3: Insert unique locations from existing reservations
INSERT INTO "locations" ("id", "name", "createdAt", "updatedAt")
SELECT
    gen_random_uuid() as id,
    DISTINCT location as name,
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "reservations"
WHERE location IS NOT NULL AND location != ''
ON CONFLICT (name) DO NOTHING;

-- Step 4: Update reservations to link to locations
UPDATE "reservations" r
SET "locationId" = l.id
FROM "locations" l
WHERE r.location = l.name AND r."locationId" IS NULL;

-- Step 5: Create index on locationId
CREATE INDEX IF NOT EXISTS "reservations_locationId_idx" ON "reservations"("locationId");

-- Step 6: Add foreign key constraint
-- Note: We keep locationId nullable for now to avoid breaking existing data
-- ALTER TABLE "reservations" ADD CONSTRAINT "reservations_locationId_fkey"
-- FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
