/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `MaintenanceRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folio` to the `MaintenanceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "folio" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceRequest_folio_key" ON "MaintenanceRequest"("folio");
