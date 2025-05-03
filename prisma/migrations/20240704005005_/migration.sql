-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ships" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "shipId" INTEGER NOT NULL,
    "faultType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionsTaken" TEXT,
    "maintenanceUserId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SOLICITADO',
    "realSolution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" INTEGER,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shipId" INTEGER NOT NULL,
    "responsibleId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "series" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsible" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "Name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Responsible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequestOnUser" (
    "userId" INTEGER NOT NULL,
    "maintenanceRequestId" INTEGER NOT NULL,

    CONSTRAINT "MaintenanceRequestOnUser_pkey" PRIMARY KEY ("userId","maintenanceRequestId")
);

-- CreateTable
CREATE TABLE "EstimatedSolution" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "maintenanceRequestId" INTEGER NOT NULL,

    CONSTRAINT "EstimatedSolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationGroupOnUser" (
    "userId" INTEGER NOT NULL,
    "notificationGroupId" INTEGER NOT NULL,

    CONSTRAINT "NotificationGroupOnUser_pkey" PRIMARY KEY ("userId","notificationGroupId")
);

-- CreateTable
CREATE TABLE "NotificationContentType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationContentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedNotification" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "contentTypeId" INTEGER NOT NULL,
    "maintenanceRequestId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationGroupId" INTEGER,

    CONSTRAINT "GeneratedNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "idx_token_userId" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Responsible_userId_key" ON "Responsible"("userId");

-- CreateIndex
CREATE INDEX "idx_maintenanceRequestId" ON "MaintenanceRequestOnUser"("maintenanceRequestId");

-- CreateIndex
CREATE INDEX "idx_userId_unique" ON "MaintenanceRequestOnUser"("userId");

-- CreateIndex
CREATE INDEX "idx_estimatedSolutionRequestId" ON "EstimatedSolution"("maintenanceRequestId");

-- CreateIndex
CREATE INDEX "idx_notificationGroupId" ON "NotificationGroupOnUser"("notificationGroupId");

-- CreateIndex
CREATE INDEX "idx_userId" ON "NotificationGroupOnUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Responsible"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsible" ADD CONSTRAINT "Responsible_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequestOnUser" ADD CONSTRAINT "MaintenanceRequestOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequestOnUser" ADD CONSTRAINT "MaintenanceRequestOnUser_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimatedSolution" ADD CONSTRAINT "EstimatedSolution_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroupOnUser" ADD CONSTRAINT "NotificationGroupOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroupOnUser" ADD CONSTRAINT "NotificationGroupOnUser_notificationGroupId_fkey" FOREIGN KEY ("notificationGroupId") REFERENCES "NotificationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedNotification" ADD CONSTRAINT "GeneratedNotification_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "NotificationContentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedNotification" ADD CONSTRAINT "GeneratedNotification_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedNotification" ADD CONSTRAINT "GeneratedNotification_notificationGroupId_fkey" FOREIGN KEY ("notificationGroupId") REFERENCES "NotificationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
