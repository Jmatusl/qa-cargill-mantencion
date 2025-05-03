const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log("Seeding data...");

  // 1. Crear NotificationGroup por defecto
  const defaultNotificationGroup = await prisma.notificationGroup.upsert({
    where: { id: 0 },
    update: {},
    create: {
      id: 0,
      name: "Default Group",
      details: "Grupo de notificación por defecto",
    },
  });

  console.log("Notification group por defecto creado");

  // 2. Crear Roles
  const roleNames = ["Mantención", "Instalación", "Jefe 1", "Jefe 2", "NEW_USER", "User", "Admin"];
  const createdRoles = {};

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Rol correspondiente a ${name}`,
      },
    });
    createdRoles[name] = role;
  }

  console.log("Roles creados: Mantención, Instalación, Jefe 1, Jefe 2, NEW_USER, User, Admin");

  // 3. Crear fábricas
  const factories = [];
  const factoryNames = ["Fabrica Norte", "Fabrica Centro", "Fabrica Sur"];

  for (const factoryName of factoryNames) {
    const factory = await prisma.ships.upsert({
      where: { name: factoryName },
      update: {},
      create: {
        name: factoryName,
        folio_id: faker.string.uuid(),
        description: `Descripción de ${factoryName}`,
        observations: `Observaciones de ${factoryName}`,
      },
    });
    factories.push(factory);
  }

  console.log("Fábricas creadas: 3");

  // 4. Crear usuarios para las fábricas con rol "Instalación"
  const hashedPassword = await hashPassword("admin123");

  for (const factory of factories) {
    const email = `${factory.name.toLowerCase().replace(" ", "_")}@sotex.app`;

    await prisma.user.create({
      data: {
        email,
        username: `${factory.name}_user`,
        password: hashedPassword,
        verified: true,
        state: "ACTIVE",
        shipId: factory.id,
        roles: {
          create: {
            roleId: createdRoles["Instalación"].id,
            notificationGroupId: defaultNotificationGroup.id,
          },
        },
      },
    });
  }

  console.log("Usuarios de fábricas con rol 'Instalación' creados.");

  // 5. Crear usuarios de "Mantención"
  const mantencionUsers = [];

  for (let i = 0; i < 6; i++) {
    const email = `user_mantencion${i + 1}@sotex.app`;

    const user = await prisma.user.create({
      data: {
        email,
        username: faker.person.fullName(),
        password: hashedPassword,
        verified: true,
        state: "ACTIVE",
        roles: {
          create: {
            roleId: createdRoles["Mantención"].id,
            notificationGroupId: defaultNotificationGroup.id,
          },
        },
      },
    });

    const responsible = await prisma.responsible.create({
      data: {
        userId: user.id,
        name: faker.person.fullName(),
        area: "Mantención",
      },
    });

    mantencionUsers.push(responsible);
  }

  console.log("Usuarios con rol 'Mantención' creados y responsables asignados.");

  // 6. Crear Equipos y asignar responsables
  const areas = ["Producción", "Almacén"];
  const subareas = {
    Producción: ["Línea 1", "Línea 2"],
    Almacén: ["Zona Alta", "Zona Baja"],
  };

  const equipmentNames = ["Torno CNC", "Fresa Industrial", "Cinta Transportadora", "Montacargas", "Empaquetadora", "Robot Soldador", "Carretilla Eléctrica"];

  for (const factory of factories) {
    for (const area of areas) {
      for (const subarea of subareas[area]) {
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          // 2 o 3 equipos
          const equipment = equipmentNames[Math.floor(Math.random() * equipmentNames.length)];
          const responsible = mantencionUsers[Math.floor(Math.random() * mantencionUsers.length)];

          await prisma.equipment.create({
            data: {
              area,
              subarea: `${area} - ${subarea}`,
              name: equipment,
              brand: "Marca Genérica",
              model: `Modelo-${Math.floor(100 + Math.random() * 900)}`,
              series: `SER-${faker.string.uuid().slice(0, 8).toUpperCase()}`,
              status: "Activo",
              ship: {
                connect: { id: factory.id },
              },
              responsible: {
                connect: { id: responsible.id },
              },
            },
          });
        }
      }
    }
  }

  console.log("Equipos creados y asignados a fábricas con responsables.");

  // 7. Crear usuario admin
  await prisma.user.create({
    data: {
      email: "admin@sotex.app",
      username: "admin",
      password: hashedPassword,
      verified: true,
      state: "ACTIVE",
      roles: {
        create: {
          roleId: createdRoles["Admin"].id,
          notificationGroupId: defaultNotificationGroup.id,
        },
      },
    },
  });

  console.log("Usuario admin creado");
  console.log("Seeding completado con éxito 🎉");
}

main()
  .catch((e) => {
    console.error("Error en el seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
