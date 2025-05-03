/*
  Warnings:

  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId";

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE INDEX "idx_ur_roleId" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "idx_ur_userId" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "idx_equipment_shipId" ON "Equipment"("shipId");

-- CreateIndex
CREATE INDEX "idx_equipment_responsibleId" ON "Equipment"("responsibleId");

-- CreateIndex
CREATE INDEX "idx_gn_contentTypeId" ON "GeneratedNotification"("contentTypeId");

-- CreateIndex
CREATE INDEX "idx_gn_maintenanceRequestId" ON "GeneratedNotification"("maintenanceRequestId");

-- CreateIndex
CREATE INDEX "idx_maintenance_shipId" ON "MaintenanceRequest"("shipId");

-- CreateIndex
CREATE INDEX "idx_maintenance_equipmentId" ON "MaintenanceRequest"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_responsible_userId" ON "Responsible"("userId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_estimatedSolutionRequestId" RENAME TO "idx_es_maintenanceRequestId";

-- RenameIndex
ALTER INDEX "idx_maintenanceRequestId" RENAME TO "idx_mru_maintenanceRequestId";

-- RenameIndex
ALTER INDEX "idx_userId_unique" RENAME TO "idx_mru_userId";

-- RenameIndex
ALTER INDEX "idx_notificationGroupId" RENAME TO "idx_ngu_notificationGroupId";

-- RenameIndex
ALTER INDEX "idx_userId" RENAME TO "idx_ngu_userId";
