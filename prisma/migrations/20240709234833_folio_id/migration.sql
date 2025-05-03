/*
  Warnings:

  - A unique constraint covering the columns `[folio_id]` on the table `Ships` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ships" ADD COLUMN     "folio_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ships_folio_id_key" ON "Ships"("folio_id");
