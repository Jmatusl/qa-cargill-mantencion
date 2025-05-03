"use server";
import db from "@/libs/db";
import { z } from "zod";
import { getSession, extractRoles } from '@/lib/sessionRoles';
// Esquema de GeneratedNotification
const generatedNotificationSchema = z.object({
  id: z.number(),
  maintenanceRequestId: z.number(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notificationGroupId: z.number().nullable(),
});

type NotificationSettingsData = {
  roleId: number;
  notificationGroupId: number;
  enabled: boolean;
};

interface UpdateNotificationsBatchInput {
  userId: number;
  changes: Array<{
    groupId: number;
    enabled: boolean;
  }>;
}


// Esquema de NotificationGroup
const notificationGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
});

// Esquema de NotificationGroupRole
const notificationGroupRoleSchema = z.object({
  notificationGroupId: z.number(),
  roleId: z.number(),
});

// Definir las interfaces de salida basadas en los esquemas
type GeneratedNotification = z.infer<typeof generatedNotificationSchema>;
type NotificationGroup = z.infer<typeof notificationGroupSchema>;
type NotificationGroupRole = z.infer<typeof notificationGroupRoleSchema>;

export async function createGeneratedNotification(data: GeneratedNotification) {
  try {
    const newGeneratedNotification = await db.generatedNotification.create({
      data: {
        maintenanceRequestId: data.maintenanceRequestId,
        type: data.type,
        title: data.title,
        message: data.message,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        notificationGroupId: data.notificationGroupId,
      },
    });
    console.log("Created generated notification:", newGeneratedNotification);
    return newGeneratedNotification;
  } catch (error) {
    console.error("Error creating generated notification:", error);
    throw new Error("Error creating generated notification.");
  }
}

export async function createNotificationGroup(data: NotificationGroup) {
  try {
    const newNotificationGroup = await db.notificationGroup.create({
      data: {
        name: data.name,
        createdAt: data.createdAt,
      },
    });
    console.log("Created notification group:", newNotificationGroup);
    return newNotificationGroup;
  } catch (error) {
    console.error("Error creating notification group:", error);
    throw new Error("Error creating notification group.");
  }
}

export async function createNotificationGroupRole(data: NotificationGroupRole) {
  try {
    const newNotificationGroupRole = await db.notificationGroupRole.create({
      data: {
        notificationGroupId: data.notificationGroupId,
        roleId: data.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(
      "Created notification group role association:",
      newNotificationGroupRole
    );
    return newNotificationGroupRole;
  } catch (error) {
    console.error("Error creating notification group role association:", error);
    throw new Error("Error creating notification group role association.");
  }
}

export async function getGeneratedNotifications() {
  try {
    const generatedNotifications = await db.generatedNotification.findMany({
      // include: {
      //   maintenanceRequest: true,
      //   // notificationGroup: {
      //   //   select: {
      //   //     name: true,
      //   //   },
      //   //   include: {
      //   //     roles: true,
      //   //   },
      //   },
      // },
      orderBy: { createdAt: "desc" },
    });
    //  console.log("Generated notifications:", generatedNotifications);
    return generatedNotifications;
  } catch (error) {
    console.error("Error fetching generated notifications:", error);
    throw new Error("Error fetching generated notifications.");
  }
}
// TODO: crear funcion para scroll infinito en el box de notificaciones Recientes
export async function getGeneratedNotificationsNested(page: number = 1) {
  const pageSize = 10; // Tamaño de la página
  const skip = (page - 1) * pageSize; // Cálculo para saltar elementos
  const take = pageSize; // Número de elementos por página

  try {
    const totalNotifications = await db.generatedNotification.count(); // Total de notificaciones
    const generatedNotifications = await db.generatedNotification.findMany({
      skip,
      take,
      include: {
        maintenanceRequest: {
          include: {
            ship: true,
            equipment: true,
            responsible: true,
            users: {
              include: {
                user: true,
              },
            },
            estimatedSolutions: true,
          },
        },
        notificationGroup: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    users: {
                      include: {
                        user: true, // Incluye información del usuario asociado al rol
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transformar los datos para incluir usuarios directamente en el resultado si es necesario
    const notificationsWithUsers = generatedNotifications.map(
      (notification) => {
        const users = notification.notificationGroup?.roles
          .flatMap((roleGroup) => roleGroup.role.users)
          .map((userRole) => userRole.user);

        return {
          ...notification,
          users,
        };
      }
    );

    // Calcular el índice de la próxima página
    const nextPage = skip + take < totalNotifications ? page + 1 : null;

    return {
      currentPage: page,
      nextPage,
      totalItems: totalNotifications,
      pageSize,
      data: notificationsWithUsers,
    };
  } catch (error) {
    console.error("Error fetching paginated notifications:", error);
    throw new Error("Error fetching paginated notifications.");
  }
}

export async function getNotificationGroups() {
  try {
    const notificationGroups = await db.notificationGroup.findMany({
      where: {
        id: {
          notIn: [0, 4, 6, 7, 8, 9],
        },
      },
    });
    // console.log("Notification groups:", notificationGroups);
    return notificationGroups;
  } catch (error) {
    console.error("Error fetching notification groups:", error);
    throw new Error("Error fetching notification groups.");
  }
}

export async function getUsersInNotificationGroup(notificationGroupId: number) {
  try {
    const usersInGroup = await db.userRole.findMany({
      where: {
        notificationGroupId: notificationGroupId,
        emailNotifications: true,
      },
      include: {
        user: true,
      },
    });
    const userEmails = usersInGroup.map((userRole) => userRole.user.email);
    // console.log("Users in notification group:", userEmails);
    return userEmails;
  } catch (error) {
    console.error("Error fetching users in notification group:", error);
    throw new Error("Error fetching users in notification group.");
  }
}

export async function getNotificationGroupRoles(notificationGroupId: number) {
  try {
    const notificationGroupRoles = await db.notificationGroupRole.findMany({
      where: {
        notificationGroupId: notificationGroupId,
      },
    });
    //  console.log("Notification group roles:", notificationGroupRoles);
    return notificationGroupRoles;
  } catch (error) {
    console.error("Error fetching notification group roles:", error);
    throw new Error("Error fetching notification group roles.");
  }
}

export async function getAllRolesWithNotificationSettings() {
  try {
    const rolesWithNotifications = await db.role.findMany({
      include: {
        users: {
          include: {
            user: true,
            notificationGroup: true,
          },
        },
        NotificationGroupRole: {
          include: {
            notificationGroup: true,
          },
        },
      },
    });

      // console.log("Roles with notification settings:", rolesWithNotifications);

    return rolesWithNotifications;
  } catch (error) {
    console.error("Error fetching roles with notification settings:", error);
    throw new Error("Error fetching roles with notification settings.");
  }
}

export async function getAllNotificattionByMaintenance(maintenanceId: number) {
  try {
    const notifications = await db.generatedNotification.findMany({
      where: {
        maintenanceRequestId: maintenanceId,
        notificationGroup: {
          id: {
            not: 0,
          },
        },
      },
      include: {
        notificationGroup: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // console.log("notifications", notifications);
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Error fetching notifications.");
  }
}

/* Esta funcion recibe el ide del barco y devuelve un objeto con los totales de fallas de cada tipo de falla 

{
    "shipId": 2,
    "shipName": "Queilen",
    "ordinaryFaultCount": 28,
    "equipmentFaultCount": 38,
    "operativeFaultCount": 0,
    "totalActiveFaults": 66
}
*/

export async function checkFaultsForOOPP(shipId: number) {
  console.log("checkFaultsForOOPP", shipId);

  try {
    const shipsWithFaults = await db.ships.findMany({
      where: {
        id: shipId,
        maintenanceRequests: {
          some: {
            status: { in: ["SOLICITADO", "EN PROCESO"] },
          },
        },
      },
      include: {
        maintenanceRequests: true,
      },
    });

    console.log("Ships with faults:", shipsWithFaults);
    if (shipsWithFaults.length === 0) {
      return {
        shipId: shipId,
        shipName: "No hay barcos con fallas",
        ordinaryFaultCount: 0,
        equipmentFaultCount: 0,
        operativeFaultCount: 0,
        totalActiveFaults: 0,
      };
    }

    const [result] = shipsWithFaults.map((ship) => {
      const ordinaryFaults = ship.maintenanceRequests.filter(
        (request) => request.faultType === "Ordinaria"
      );
      const equipmentFaults = ship.maintenanceRequests.filter(
        (request) => request.faultType === "Equipo"
      );

      const operativeFaults = ship.maintenanceRequests.filter(
        (request) => request.status === "Operativa"
      );

      const totalActiveFaults =
        ordinaryFaults.length + equipmentFaults.length + operativeFaults.length;

      console.log("Ordinary faults:", ordinaryFaults);
      console.log("Equipment faults:", equipmentFaults);

      // Optionally generate notifications here

      return {
        shipId: ship.id,
        shipName: ship.name,
        ordinaryFaultCount: ordinaryFaults.length,
        equipmentFaultCount: equipmentFaults.length,
        operativeFaultCount: operativeFaults.length,
        totalActiveFaults: totalActiveFaults,
      };
    });

    return result;
  } catch (error) {
    //console.error("Error checking OOPP faults:", error);
    throw new Error("Error checking OOPP faults:" + error);
  }
}

export async function updateNotificationSettings(data: {
  changes: NotificationSettingsData[];
}) {
  const session = await getSession();
  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role) => [3, 6, 7, 8].includes(role.id));
  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Procesa cada cambio
      for (const change of data.changes) {
        if (change.enabled) {
          // Crear o actualizar la relación en `notificationGroupRole`
          await tx.notificationGroupRole.upsert({
            where: {
              notificationGroupId_roleId: {
                notificationGroupId: change.notificationGroupId,
                roleId: change.roleId,
              },
            },
            update: {},
            create: {
              notificationGroupId: change.notificationGroupId,
              roleId: change.roleId,
            },
          });

          // Buscar todos los userId asociados al roleId
          const users = await tx.user.findMany({
            where: {
              roles: {
                some: { roleId: change.roleId },
              },
            },
            select: { id: true },
          });

          // Crear / actualizar userRole para cada user
          for (const user of users) {
            const existingNotification = await tx.userRole.findFirst({
              where: {
                userId: user.id,
                notificationGroupId: change.notificationGroupId,
              },
              select: { emailNotifications: true },
            });

            // Determinar el valor de emailNotifications
            const emailNotifications = existingNotification
              ? existingNotification.emailNotifications
              : true; // Valor predeterminado si no existía

            await tx.userRole.upsert({
              where: {
                userId_roleId_notificationGroupId: {
                  userId: user.id,
                  roleId: change.roleId,
                  notificationGroupId: change.notificationGroupId,
                },
              },
              update: {
                emailNotifications: emailNotifications,
              },
              create: {
                userId: user.id,
                roleId: change.roleId,
                notificationGroupId: change.notificationGroupId,
                emailNotifications: emailNotifications,
              },
            });
          }
        } else {
          // Eliminar la relación de `notificationGroupRole`
          await tx.notificationGroupRole.delete({
            where: {
              notificationGroupId_roleId: {
                notificationGroupId: change.notificationGroupId,
                roleId: change.roleId,
              },
            },
          });
          // Buscar y eliminar relaciones en `UserRole`
          await tx.userRole.deleteMany({
            where: {
              roleId: change.roleId,
              notificationGroupId: change.notificationGroupId,
            },
          });
        }
      }

      // 2. Limpieza final en bloque (el mismo paso que tenías)
      const notificationGroupRoles = await tx.notificationGroupRole.findMany({});
      const validUserRoles = await tx.userRole.findMany({});

      const validMappings = new Set(
        notificationGroupRoles.map((ngr) => `${ngr.roleId}-${ngr.notificationGroupId}`)
      );

      const orphanedUserRoles = validUserRoles.filter(
        (ur) => !validMappings.has(`${ur.roleId}-${ur.notificationGroupId}`)
      );

      if (orphanedUserRoles.length > 0) {
        const orphanedIds = orphanedUserRoles.map((ur) => ({
          userId: ur.userId,
          roleId: ur.roleId,
          notificationGroupId: ur.notificationGroupId,
        }));
        await tx.userRole.deleteMany({
          where: {
            OR: orphanedIds,
          },
        });
      }
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Error updating notification settings.");
  }
}





export async function getNotificationGroupsByRole(roleIds: number[]) { //TODO: AQUI
  try {
    const notificationGroups = await db.userRole.findMany({
      where: {
        roleId: { in: roleIds }, // Filtra por múltiples roles
        notificationGroup: {
          id: {
            notIn: [0, 4, 6, 7, 8, 9],
          },
        },
      },
      include: {
        notificationGroup: true, // Incluye los detalles de NotificationGroup
      },
      orderBy: {
        notificationGroup: {
          id: 'asc', // Ordena por id ascendentemente
        },
      },
    });

    // Extrae y combina los grupos de notificaciones
    const result = notificationGroups.map((userRole) => ({
      ...userRole.notificationGroup,
      emailNotifications: userRole.emailNotifications,
    }));

    // console.log("Notification groups by roles:", result);
    return result;
  } catch (error) {
    console.error("Error fetching notification groups by roles:", error);
    throw new Error("Error fetching notification groups by roles.");
  }
}


export async function enableEmailNotification(data: {
  userId: number;
  changes: Array<{ groupId: number; emailNotifications: boolean }>;
}) {
  try {
    await db.$transaction(
      data.changes.map(({ groupId, emailNotifications }) =>
        db.userRole.updateMany({
          where: { userId: data.userId, notificationGroupId: groupId },
          data: { emailNotifications },
        })
      )
    );
  } catch (error) {
    console.error(error);
    throw new Error("Error actualizando configuración de notificaciones.");
  }
}