/*
  Warnings:

  - A unique constraint covering the columns `[shipId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId]` on the table `Ships` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "shipId" INTEGER;

-- AlterTable
ALTER TABLE "Ships" ADD COLUMN     "roleId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Role_shipId_key" ON "Role"("shipId");

-- CreateIndex
CREATE UNIQUE INDEX "Ships_roleId_key" ON "Ships"("roleId");

-- AddForeignKey
ALTER TABLE "Ships" ADD CONSTRAINT "Ships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
