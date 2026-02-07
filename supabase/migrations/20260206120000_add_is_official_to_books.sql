-- Add is_official column to digital_library_books table
ALTER TABLE "public"."digital_library_books" 
ADD COLUMN IF NOT EXISTS "is_official" boolean DEFAULT false;

-- Update all existing books to be official (as they are part of the initial seed)
UPDATE "public"."digital_library_books" 
SET "is_official" = true 
WHERE "is_official" IS FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS "digital_library_books_is_official_idx" 
ON "public"."digital_library_books" ("is_official");
