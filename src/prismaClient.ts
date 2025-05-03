import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  name: 'UserRoleExtension',
  query: {
    userRole: {
      async upsert({ args, query }) {
        const { userId, notificationGroupId } = args.create;

        // Buscar si existe una relación para el usuario y grupo
        const existingRelation = await prisma.userRole.findFirst({
          where: { userId, notificationGroupId },
        });

        // Copiar el valor de emailNotifications si existe una relación previa
        if (existingRelation) {
          args.create.emailNotifications = existingRelation.emailNotifications;
        } else if (!args.create.emailNotifications) {
          args.create.emailNotifications = true; // Valor predeterminado
        }

        // Ejecutar la consulta original
        return query(args);
      },
    },
  },
});

export default prisma;
