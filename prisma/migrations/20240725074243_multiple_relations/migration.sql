/*
  Warnings:

  - You are about to drop the `NotificationGroupOnUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `EstimatedSolution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NotificationGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotificationGroupOnUser" DROP CONSTRAINT "NotificationGroupOnUser_notificationGroupId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationGroupOnUser" DROP CONSTRAINT "NotificationGroupOnUser_userId_fkey";

-- AlterTable
ALTER TABLE "Equipment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EstimatedSolution" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GeneratedNotification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "NotificationGroup" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Responsible" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ships" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationGroupId" INTEGER;

-- DropTable
DROP TABLE "NotificationGroupOnUser";

-- CreateTable
CREATE TABLE "NotificationGroupRole" (
    "notificationGroupId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationGroupRole_pkey" PRIMARY KEY ("notificationGroupId","roleId")
);

-- CreateIndex
CREATE INDEX "idx_ngr_roleId" ON "NotificationGroupRole"("roleId");

-- CreateIndex
CREATE INDEX "idx_ngr_notificationGroupId" ON "NotificationGroupRole"("notificationGroupId");

-- CreateIndex
CREATE INDEX "idx_ur_notificationGroupId" ON "UserRole"("notificationGroupId");

-- AddForeignKey
ALTER TABLE "NotificationGroupRole" ADD CONSTRAINT "NotificationGroupRole_notificationGroupId_fkey" FOREIGN KEY ("notificationGroupId") REFERENCES "NotificationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroupRole" ADD CONSTRAINT "NotificationGroupRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_notificationGroupId_fkey" FOREIGN KEY ("notificationGroupId") REFERENCES "NotificationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
