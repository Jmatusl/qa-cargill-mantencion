import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Inserta un nuevo rol llamado "GERENCIA"
  const newRole = await prisma.role.create({
    data: {
      name: 'GERENCIA',
      description: 'Rol destinado a la gerencia de la empresa',
    },
  });

  console.log('Nuevo rol creado:', newRole);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
