-- Update tickets table to allow null values for AI-generated fields
ALTER TABLE tickets ADD COLUMN name_new TEXT;
ALTER TABLE tickets ADD COLUMN importance_new INTEGER;
ALTER TABLE tickets ADD COLUMN assignee_new TEXT;

-- Copy existing data
UPDATE tickets SET name_new = name WHERE name IS NOT NULL;
UPDATE tickets SET importance_new = importance WHERE importance IS NOT NULL;
UPDATE tickets SET assignee_new = assignee WHERE assignee IS NOT NULL;

-- Drop old columns
ALTER TABLE tickets DROP COLUMN name;
ALTER TABLE tickets DROP COLUMN importance;
ALTER TABLE tickets DROP COLUMN assignee;

-- Rename new columns
ALTER TABLE tickets RENAME COLUMN name_new TO name;
ALTER TABLE tickets RENAME COLUMN importance_new TO importance;
ALTER TABLE tickets RENAME COLUMN assignee_new TO assignee;
