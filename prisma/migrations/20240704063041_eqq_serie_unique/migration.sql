/*
  Warnings:

  - A unique constraint covering the columns `[series]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipment_series_key" ON "Equipment"("series");
