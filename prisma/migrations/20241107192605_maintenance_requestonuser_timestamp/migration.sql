/*
  Warnings:

  - The primary key for the `MaintenanceRequestOnUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MaintenanceRequestOnUser" DROP CONSTRAINT "MaintenanceRequestOnUser_pkey",
ADD COLUMN     "actionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "MaintenanceRequestOnUser_pkey" PRIMARY KEY ("id");
