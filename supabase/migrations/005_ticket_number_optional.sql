-- Make ticket_number optional (nullable)
ALTER TABLE participants ALTER COLUMN ticket_number DROP NOT NULL;
