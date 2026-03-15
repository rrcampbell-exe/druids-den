-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'DENIED', 'REVOKED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
ADD COLUMN     "account_status_changed_at" TIMESTAMP(3),
ADD COLUMN     "account_status_changed_by" TEXT;

-- CreateIndex
CREATE INDEX "users_account_status_idx" ON "users"("account_status");
