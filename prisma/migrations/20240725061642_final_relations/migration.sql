/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `NotificationGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NotificationGroup" ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "NotificationGroupOnUser" ADD COLUMN     "sendEmail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shipId" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationGroup_name_key" ON "NotificationGroup"("name");

-- CreateIndex
CREATE INDEX "idx_user_shipId" ON "User"("shipId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
