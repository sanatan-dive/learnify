-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'CREATED', 'ACTIVE', 'AUTHENTICATED', 'PENDING', 'HALTED', 'CANCELLED', 'EXPIRED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE';
