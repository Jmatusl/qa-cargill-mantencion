/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Ships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `area` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subarea` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "area" TEXT NOT NULL,
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "extra" TEXT,
ADD COLUMN     "subarea" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ships" ADD COLUMN     "observations" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ships_name_key" ON "Ships"("name");

-- CreateIndex
CREATE INDEX "idx_ships_name" ON "Ships"("name");
