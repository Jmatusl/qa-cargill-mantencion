"use server";

import prisma from "@/prismaClient"
import db from "@/libs/db";
import { Role, Token, User, PrismaPromise } from "@prisma/client";
import bcrypt from "bcrypt";

interface UserRole {
  role: Role;
}
interface RoleData {
  role: {
    name: string;
  };
}

interface UserData {
  id: number;
  username: string;
  email: string;
  password?: string;
  roles: RoleData[];
}

type UserDataWithoutPassword = Omit<UserData, "password"> & { id: number };

export async function getRoles() {
  const roles = await db.role.findMany({
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });
  return roles;
}

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        roles: {
          include: {
            role: true, // Incluir el objeto Role completo.
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users.");
  }
}


export async function getUserRoles(userId: number) {
  try {
    const userRoles = await db.userRole.findMany({
      where: {
        userId: userId,
      },
      include: {
        notificationGroup: true, // Incluye los detalles de NotificationGroup
      },
    });

    // console.log("User roles with notification groups:", userRoles);
    return userRoles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw new Error("Error fetching user roles.");
  }
}


export const updateUserRoles = async (data: UserDataWithoutPassword) => {
  try {
    // Obtener los roles actuales del usuario
    const existingRoles = await prisma.userRole.findMany({
      where: { userId: data.id },
      select: { roleId: true },
    });

    const existingRoleIds = new Set(existingRoles.map((role) => role.roleId));

    // Convertir los nombres de roles proporcionados a IDs
    const newRoleIds = new Set(
      await Promise.all(
        data.roles.map(async (role) => {
          const roleData = await prisma.role.findUnique({
            where: { name: role.role.name },
          });

          if (!roleData) {
            throw new Error(`El rol '${role.role.name}' no existe.`);
          }

          return roleData.id;
        })
      )
    );

    // Identificar roles a agregar y roles a eliminar
    const rolesToAdd = Array.from(newRoleIds).filter((id) => !existingRoleIds.has(id));
    const rolesToRemove = Array.from(existingRoleIds).filter((id) => !newRoleIds.has(id));

    // Agregar nuevos roles y notificaciones
    const addOperations: PrismaPromise<any>[] = [];
    for (const roleId of rolesToAdd) {
      const notificationGroups = await prisma.notificationGroupRole.findMany({
        where: { roleId },
        select: { notificationGroupId: true },
      });

      if (notificationGroups.length === 0) {
        console.warn(`El rol ${roleId} no tiene grupos de notificación. Usando grupo predeterminado.`);
        notificationGroups.push({ notificationGroupId: 0 });
      }

      for (const group of notificationGroups) {
        addOperations.push(
          prisma.userRole.upsert({
            where: {
              userId_roleId_notificationGroupId: {
                userId: data.id,
                roleId,
                notificationGroupId: group.notificationGroupId,
              },
            },
            create: {
              userId: data.id,
              roleId,
              notificationGroupId: group.notificationGroupId,
              emailNotifications: true, // Middleware ajustará este valor
            },
            update: {
              emailNotifications: true, // Middleware ajustará este valor
            },
          })
        );
      }
    }

    // Eliminar roles obsoletos
    const deleteOperations = prisma.userRole.deleteMany({
      where: {
        userId: data.id,
        roleId: { in: rolesToRemove },
      },
    });

    // Ejecutar transacción
    await prisma.$transaction([...addOperations, deleteOperations]);

    // Actualizar otros datos del usuario
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: {
        username: data.username,
        email: data.email,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error al actualizar roles del usuario:', error);
    throw new Error('Error al actualizar roles del usuario');
  }
};


// export const createUser = async (data: Omit<UserData, "id">) => {
//   try {
//     const existingUser = await db.user.findUnique({
//       where: { email: data.email },
//     });
//     if (existingUser) {
//       throw new Error("El email ya está registrado.");
//     }

//     const hashedPassword = await bcrypt.hash(data.password!, 10);

//     const newUser = await db.user.create({
//       data: {
//         username: data.username,
//         email: data.email,
//         password: hashedPassword,
//         verified: true,
//         roles: {
//           create: data.roles.map((role) => ({
//             role: { connect: { name: role.role.name } },
//           })),
//         },
//       },
//     });

//     return newUser;
//   } catch (error) {
//     console.error("Error al crear usuario:", error);
//     throw new Error("Error al crear usuario.");
//   }
// };


export const deleteUser = async (userId: number) => {
  try {
    // Eliminar tokens asociados al usuario
    await db.token.deleteMany({ where: { userId } });

    // Eliminar relaciones en la tabla de roles de usuario
    await db.userRole.deleteMany({ where: { userId } });

    // Eliminar relaciones en MaintenanceRequestOnUser
    await db.maintenanceRequestOnUser.deleteMany({ where: { userId } });

    // Eliminar relación con Responsible si existe
    await db.responsible.deleteMany({ where: { userId } });

    // Eliminar al usuario de la tabla User
    const deletedUser = await db.user.delete({
      where: { id: userId },
    });

    return deletedUser;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw new Error("Error al eliminar usuario.");
  }
};


export const updateUserVerification = async ({
  userId,
  password,
}: {
  userId: number;
  password: string;
}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        verified: true,
        password: hashedPassword,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar verificación del usuario:", error);
    throw new Error("Error al actualizar verificación del usuario.");
  }
};
