-- Update existing reservations to set locationId based on location name
UPDATE reservations
SET "locationId" = locations.id
FROM locations
WHERE reservations.location = locations.name
  AND reservations."locationId" IS NULL;
