/*
  Warnings:

  - You are about to drop the column `contentTypeId` on the `GeneratedNotification` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `GeneratedNotification` table. All the data in the column will be lost.
  - You are about to drop the `NotificationContentType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `GeneratedNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `GeneratedNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GeneratedNotification" DROP CONSTRAINT "GeneratedNotification_contentTypeId_fkey";

-- DropIndex
DROP INDEX "idx_gn_contentTypeId";

-- AlterTable
ALTER TABLE "GeneratedNotification" DROP COLUMN "contentTypeId",
DROP COLUMN "typeId",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ships" ADD COLUMN     "state" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "state" TEXT NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "NotificationContentType";

-- RenameIndex
ALTER INDEX "idx_gn_maintenanceRequestId" RENAME TO "idx_notification_maintenanceRequestId";
