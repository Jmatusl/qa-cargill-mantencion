/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceUserId` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - Added the required column `responsibleId` to the `MaintenanceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_assignedToId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceRequest" DROP COLUMN "assignedToId",
DROP COLUMN "maintenanceUserId",
ADD COLUMN     "responsibleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Responsible"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
