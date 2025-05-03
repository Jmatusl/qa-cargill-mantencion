const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding grupos de notificación...");

  const notificationGroups = [
    { id: 1, name: "New Request", details: "Notificaciones para nuevas solicitudes" },
    { id: 6, name: "Responsible Changed", details: "Cambio de responsables" },
    { id: 7, name: "Status Changed", details: "Cambio de estado de solicitudes" },
    { id: 8, name: "Comments", details: "Comentarios en solicitudes" },
    { id: 9, name: "Completed", details: "Solicitudes completadas" },
  ];

  for (const group of notificationGroups) {
    await prisma.notificationGroup.upsert({
      where: { id: group.id },
      update: {},
      create: {
        id: group.id,
        name: group.name,
        details: group.details,
      },
    });
    console.log(`Grupo de notificación creado: ${group.name}`);
  }

  console.log("Seeding de grupos de notificación completado.");
}

main()
  .catch((e) => {
    console.error("Error en el seeding de notificaciones:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
