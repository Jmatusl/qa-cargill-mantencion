/*
  Warnings:

  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `notificationGroupId` on table `UserRole` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_notificationGroupId_fkey";

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
ALTER COLUMN "notificationGroupId" SET NOT NULL,
ALTER COLUMN "notificationGroupId" SET DEFAULT 0,
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId", "notificationGroupId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_notificationGroupId_fkey" FOREIGN KEY ("notificationGroupId") REFERENCES "NotificationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
