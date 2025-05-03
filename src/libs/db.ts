import { PrismaClient } from "@prisma/client";

// Crear una función que siempre devuelva una nueva instancia de PrismaClient
const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  prisma.$extends({
    model: {
      maintenanceRequest: {
        async createWithFolio(data: any) {
          // Obtén el último ID insertado para crear un nuevo ID secuencial
          const lastRequest = await prisma.maintenanceRequest.findFirst({
            orderBy: { id: "desc" },
          });

          const newId = lastRequest ? lastRequest.id + 1 : 1;

          const ship = await prisma.ships.findUnique({
            where: { id: data.shipId },
          });

          if (!ship) {
            throw new Error(`Ship with id ${data.shipId} not found`);
          }

          const shipCode = data.shipId.toString().padStart(2, "0"); // ShipId con 2 dígitos
          const folio = `FF${shipCode}-${newId}`; // Formato FF01-id

          // Asigna el folio generado al campo folio
          data.folio = folio;

          // Crea la solicitud de mantenimiento con el folio generado
          return prisma.maintenanceRequest.create({ data });
        },
      },
    },
  });

  return prisma;
};

// Declara globalmente la variable 'prisma' si aún no está definida
declare global {
  var prisma: PrismaClient | undefined;
}

// Intenta recuperar la instancia de Prisma de global, si no existe, crea una nueva.
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// Guarda la instancia de prisma en global en modo de desarrollo para reutilizarla.
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
