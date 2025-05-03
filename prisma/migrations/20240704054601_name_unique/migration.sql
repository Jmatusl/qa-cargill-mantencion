/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Responsible` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Responsible_name_key" ON "Responsible"("name");
