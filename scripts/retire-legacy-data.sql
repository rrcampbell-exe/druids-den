-- DESTRUCTIVE: run only after an owner-approved export has been completed and
-- verified, and after confirming the target database is dedicated to this app.
-- Do not run against a shared database. This script deliberately avoids
-- CASCADE so unexpected external dependencies stop the transaction.

BEGIN;

DROP TABLE IF EXISTS "audit_log";
DROP TABLE IF EXISTS "messages";
DROP TABLE IF EXISTS "feedback";
DROP TABLE IF EXISTS "blackout_dates";
DROP TABLE IF EXISTS "reservations";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "_prisma_migrations";

DROP TYPE IF EXISTS "AccountStatus";
DROP TYPE IF EXISTS "MessageType";
DROP TYPE IF EXISTS "ReservationStatus";
DROP TYPE IF EXISTS "ContactMethod";
DROP TYPE IF EXISTS "Role";

COMMIT;
