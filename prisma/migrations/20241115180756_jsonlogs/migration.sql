-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "changeLog" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "actionsTakenlog" JSONB[] DEFAULT ARRAY[]::JSONB[];
