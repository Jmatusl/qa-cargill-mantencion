import { PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Eliminar relaciones de muchos a muchos y solicitudes de Mantención
  await prisma.MaintenanceRequestOnUser.deleteMany({});
  await prisma.MaintenanceRequest.deleteMany({});
  await prisma.maintenanceEquipment.deleteMany({});

  await prisma.maintenanceSystem.deleteMany({});

  // Eliminar usuarios con correos example.com
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@example.org',
      },
    },
  });

  // Crear usuarios de prueba
  const users = await prisma.user.createMany({
    data: [
      { email: 'Alcantara@example.org', username: 'Alcántara', password: 'password2', role: 'NAVE', verified: true },
      { email: 'DonMauro@example.org', username: 'Don Mauro', password: 'password3', role: 'NAVE', verified: true },
      { email: 'Queilen@example.org', username: 'Queilen', password: 'password4', role: 'NAVE', verified: true },
      { email: 'CasiqueI@example.org', username: 'Casique I', password: 'password6', role: 'NAVE', verified: true },
      { email: 'Bucalemu@example.org', username: 'Bucalemu', password: 'password8', role: 'NAVE', verified: true },
      { email: 'Paniahue@example.org', username: 'Paniahue', password: 'password9', role: 'NAVE', verified: true },
      { email: 'jackie.anderson@example.org', username: 'jackie.anderson', password: 'password10', role: 'MANTENCION', verified: true },
    ],
  });

  const allUsers = await prisma.user.findMany();
  const userIds = allUsers.map(user => user.id);
  console.log(userIds)
  const maintenanceSystems = await prisma.maintenanceSystem.createMany({
    data: [
      { name: 'Bombas Aceite' },
      { name: 'Bombas Agua' },
      { name: 'Eje' },
      { name: 'Generadores' },
      { name: 'Miscelaneos' },
      { name: 'Motores a combustión' },
      { name: 'Motores Eléctricos' },
      { name: 'Navegación' },
      { name: 'Telecomunicaciones' },
      { name: 'Traslado Peces' },
    ],
    skipDuplicates: true,
  });
  console.log(maintenanceSystems)
// Obtener IDs de sistemas de Mantención
const allSystems = await prisma.maintenanceSystem.findMany();
const systemIdMap = allSystems.reduce((acc, system) => {
  acc[system.name] = system.id;
  return acc;
}, {});
console.log(systemIdMap);

// Crear equipos de Mantención
await prisma.maintenanceEquipment.createMany({
  data: [
    { name: 'Aceite caja reductora', system_id: systemIdMap['Bombas Aceite'] },
    { name: 'Aceite sucio', system_id: systemIdMap['Bombas Aceite'] },
  ],
  skipDuplicates: true,
});

// Obtener IDs de equipos de Mantención
const allEquipments = await prisma.maintenanceEquipment.findMany();
const equipmentIdMap = allEquipments.reduce((acc, equipment) => {
  acc[equipment.name] = equipment.id;
  return acc;
}, {});
console.log(equipmentIdMap);
  // const maintenanceRequestsData = [
  //   {
  //     system_id: 1,
  //     equipment_id: 1,
  //     faultType: 'ordinaria',
  //     description: 'El refrigerador no enfría adecuadamente.',
  //     status: 'SOLICITADO',
  //     assignedToId: userIds[0], // Reemplaza con un userId válido
  //     estimatedSolution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  //     estimatedSolution2: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  //     estimatedSolution3: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  //     userRelations: [userIds[0], userIds[1]], // Reemplaza con userIds válidos
  //   },
  //   {
  //     system_id: 1,
  //     equipment_id: 2,
  //     faultType: 'equipo', // Falla Equipo
  //     description: 'El ventilador no gira.',
  //     status: 'EN_PROCESO',
  //     assignedToId: userIds[1],
  //     estimatedSolution: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  //     estimatedSolution2: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  //     estimatedSolution3: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //     userRelations: [userIds[2], userIds[3]],
  //   },
  // ];

//   for (const requestData of maintenanceRequestsData) {
//     await prisma.maintenanceRequest.create({
//       data: {
//         system_id: requestData.system_id,
//         equipment_id: requestData.equipment_id,
//         faultType: requestData.faultType,
//         description: requestData.description,
//         status: requestData.status,
//         assignedToId: requestData.assignedToId,
//         estimatedSolution: requestData.estimatedSolution,
//         estimatedSolution2: requestData.estimatedSolution2,
//         estimatedSolution3: requestData.estimatedSolution3,
//         users: {
//           create: requestData.userRelations.map(userId => ({
//             user: {
//               connect: { id: userId },
//             },
//           })),
//         },
//       },
//     });
//   }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
