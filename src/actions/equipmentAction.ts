"use server";
import db from "@/libs/db";
import { getSession, extractRoles } from "@/lib/sessionRoles";
import { z } from "zod";
import { Equipment } from "@prisma/client";
import { ChangeRecord, EquipmentUpdatableFields } from "@/types/EquipmentType";

// Definir el esquema para los datos aplanados de equipment
const flatEquipmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  area: z.string(),
  subarea: z.string(),
  status: z.string().nullable(),
  active: z.boolean(),
  responsibleId: z.number().nullable(),
  responsibleName: z.string().nullable(),
  responsibleEmail: z.string().nullable(),
  shipId: z.number().nullable(),
  shipName: z.string().nullable(),
  brand: z.string(), // Agregado
  model: z.string(), // Agregado
  series: z.string(), // Agregado
  createdAt: z.date(),
  updatedAt: z.date(),
});


// Definir la interfaz de salida basada en el esquema
type FlatEquipment = z.infer<typeof flatEquipmentSchema>;

export async function getAreaList() {
  try {
    const uniqueAreas = await db.equipment.groupBy({
      by: ["area"],
      _count: {
        area: true,
      },
    });

    const uniqueSubareas = await db.equipment.groupBy({
      by: ["area", "subarea"],
      _count: {
        subarea: true,
      },
    });
    // console.log("uniqueAreas", uniqueAreas);
    // console.log("uniqueSubareas", uniqueSubareas);

    return {
      uniqueAreas,
      uniqueSubareas,
    };
  } catch (error) {
    console.error("Error fetching unique areas and subareas:", error);
    throw new Error("Error fetching unique areas and subareas.");
  }
}

export async function getEquipmentListByArea(subarea: string) {
  let equipment;
  // console.log("subarea", subarea);
  try {
    equipment = await db.equipment.findMany({
      where: {
        subarea: subarea,
        active: true,
      },
      include: {
        responsible: true,
        ship: true,
      },
    });

    return equipment;
  } catch (error) {
    console.error("Error fetching equipment list by area:", error);
    throw new Error("Error fetching equipment list by area.");
  }
}

export async function getEquipmentList(subarea?: string) {
  let equipment;
  // console.log("subarea", subarea);
  try {
    if (subarea) {
      equipment = await db.equipment.findMany({
        where: {
          subarea: subarea,
          active: true,
        },
        include: {
          responsible: true,
          ship: true,
        },
      });
    } else {
      equipment = await db.equipment.findMany({
        include: {
          responsible: true,
          ship: true,
        },
      });
    }
    // console.log("equipment", equipment);
    return equipment;
  } catch (error) {
    console.error("Error fetching equipment list:", error);
    throw new Error("Error fetching equipment list.");
  }
}

export async function getEquipmentListByShip(shipId: number) {
  let equipment;
  try {
    equipment = await db.equipment.findMany({
      where: {
        shipId: shipId,
        active: true,
      },
      include: {
        responsible: true,
        ship: true,
      },
    });

    return equipment;
  } catch (error) {
    console.error("Error fetching equipment list by ship:", error);
    throw new Error("Error fetching equipment list by ship.");
  }
}


export async function getFlatEquipmentList(): Promise<FlatEquipment[]> {
  try {
    const equipmentList = await db.equipment.findMany({
      include: {
        responsible: {
          include: {
            user: true,
          },
        },
        ship: true,
      },
      orderBy: { id: "asc" },
    });

    // Aplanar los datos de equipment
    const flatEquipmentList = equipmentList.map((equipment) => {
      const flatEquipment: FlatEquipment = {
        id: equipment.id,
        name: equipment.name,
        area: equipment.area,
        subarea: equipment.subarea,
        status: equipment.status ?? null,
        responsibleId: equipment.responsible?.id ?? null,
        responsibleName: equipment.responsible?.name ?? null,
        responsibleEmail: equipment.responsible?.user?.email ?? null,
        shipId: equipment.ship?.id ?? null,
        shipName: equipment.ship?.name ?? null,
        brand: equipment.brand, // Agregado
        model: equipment.model, // Agregado
        series: equipment.series, // Agregado
        active: equipment.active,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
      };

      // Validar el objeto aplanado usando zod
      flatEquipmentSchema.parse(flatEquipment);

      return flatEquipment;
    });

    return flatEquipmentList;
  } catch (error) {
    console.error("Error fetching flat equipment list:", error);
    throw new Error("Error fetching flat equipment list.");
  }
}

export async function createEquipment(data: {
  name: string;
  area: string;
  subarea: string;
  brand: string;
  model: string;
  series: string;
  extra?: string;
  status?: string;
  active?: boolean;
  shipId: number;
  responsibleId: number;
}) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role: any) =>
    [3, 6, 7, 8].includes(role.id)
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }
  try {
    const newEquipment = await db.equipment.create({
      data: {
        ...data,
        active: data.active ?? true, // Por defecto, el equipo estará activo si no se especifica lo contrario
      },
    });
    return newEquipment;
  } catch (error) {
    console.error("Error creating equipment:", error);
    throw new Error("Error creating equipment.");
  }
}

export async function updateEquipment(
  id: number,
  data: Partial<Pick<Equipment, EquipmentUpdatableFields>>
) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role: any) =>
    [3, 6, 7, 8].includes(role.id)
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Obtener el equipo existente
    const existingEquipment = await db.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      throw new Error("Equipo no encontrado");
    }

    const changes = [];

    // Comparar datos existentes con nuevos para encontrar cambios
    const keys = Object.keys(data) as EquipmentUpdatableFields[];
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== existingEquipment[key]) {
        changes.push({
          field: key,
          oldValue: existingEquipment[key],
          newValue: data[key],
        });
      }
    }

    // Si hay cambios, crear un registro de cambio
    if (changes.length > 0) {
      const userId = session.user.id;
      const username =
        session.user.username || session.user.name || "Desconocido";

      const changeRecord = {
        timestamp: new Date().toISOString(),
        userId: userId,
        username: username, // Agregar el username al registro
        changes: changes,
      };

      // Actualizar el equipo, incluyendo el registro de cambio
      const updatedEquipment = await db.equipment.update({
        where: { id },
        data: {
          ...data,
          changeLog: {
            push: changeRecord,
          },
        },
      });

      return updatedEquipment;
    } else {
      // Si no hay cambios, devolver el equipo existente
      return existingEquipment;
    }
  } catch (error) {
    console.error("Error actualizando el equipo:", error);
    throw new Error("Error actualizando el equipo.");
  }
}

export async function deactivateEquipment(id: number) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role: any) =>
    [3, 6, 7, 8].includes(role.id)
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Obtener el equipo existente
    const existingEquipment = await db.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      throw new Error("Equipo no encontrado");
    }

    if (existingEquipment.active === false) {
      // Si el equipo ya está desactivado, devolverlo sin cambios
      return existingEquipment;
    }

    const changes = [
      {
        field: "active",
        oldValue: existingEquipment.active,
        newValue: false,
      },
    ];

    const userId = session.user.id;
    const username =
      session.user.username || session.user.name || "Desconocido";

    const changeRecord = {
      timestamp: new Date().toISOString(),
      userId: userId,
      username: username,
      changes: changes,
    };

    // Actualizar el equipo y agregar el registro de cambio
    const deactivatedEquipment = await db.equipment.update({
      where: { id },
      data: {
        active: false,
        changeLog: {
          push: changeRecord,
        },
      },
    });

    return deactivatedEquipment;
  } catch (error) {
    console.error("Error desactivando el equipo:", error);
    throw new Error("Error desactivando el equipo.");
  }
}

export async function activateEquipment(id: number) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role: any) =>
    [3, 6, 7, 8].includes(role.id)
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Obtener el equipo existente
    const existingEquipment = await db.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      throw new Error("Equipo no encontrado");
    }

    if (existingEquipment.active === true) {
      // Si el equipo ya está activado, devolverlo sin cambios
      return existingEquipment;
    }

    const changes = [
      {
        field: "active",
        oldValue: existingEquipment.active,
        newValue: true,
      },
    ];

    const userId = session.user.id;
    const username =
      session.user.username || session.user.name || "Desconocido";

    const changeRecord = {
      timestamp: new Date().toISOString(),
      userId: userId,
      username: username,
      changes: changes,
    };

    // Actualizar el equipo y agregar el registro de cambio
    const activatedEquipment = await db.equipment.update({
      where: { id },
      data: {
        active: true,
        changeLog: {
          push: changeRecord,
        },
      },
    });

    return activatedEquipment;
  } catch (error) {
    console.error("Error activando el equipo:", error);
    throw new Error("Error activando el equipo.");
  }
}

// Acción para obtener un equipo específico por ID
export async function getEquipmentById(id: number) {
  try {
    const equipment = await db.equipment.findUnique({
      where: { id },
      include: {
        ship: true,
        responsible: true,
        requests: {
          where: {
            status: {
              notIn: ["COMPLETADO", "CANCELADO"],
            },
          },
          include: {
            responsible: true,
            ship: true,
            equipment: true,
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!equipment) {
      throw new Error("No se encontró el ID del equipo.");
    }

    return equipment;
  } catch (error: any) {
    throw new Error(error.message || "Ocurrió un error al buscar el equipo.");
  }
}

export async function getAreaListByShip(shipId: number) {
  try {
    const uniqueSubareasByShip = await db.equipment.groupBy({
      by: ["subarea"],
      where: {
        shipId: shipId,
        active: true,
      },
      _count: {
        subarea: true,
      },
    });
    // console.log("uniqueSubareasByShip", uniqueSubareasByShip);

    return uniqueSubareasByShip;
  } catch (error) {
    console.error("Error fetching unique areas and subareas by ship:", error);
    throw new Error("Error fetching unique areas and subareas by ship.");
  }
}

export async function getAreasByShip(shipId: number) {
  try {
    const areas = await db.equipment.groupBy({
      by: ["area"],
      _count: {
        area: true,
      },
      where: {
        shipId: shipId,
      },
    });

    const subareas = await db.equipment.groupBy({
      by: ["area", "subarea"],
      _count: {
        subarea: true,
      },
      where: {
        shipId: shipId,
      },
    });

    return { areas, subareas };
  } catch (error) {
    console.error("Error fetching areas and subareas:", error);
    throw new Error("Error fetching areas and subareas.");
  }
}

export async function getEquipmentChangeLog(
  id: number
): Promise<ChangeRecord[]> {
  try {
    const equipment = await db.equipment.findUnique({
      where: { id },
      select: {
        changeLog: true,
      },
    });
    if (!equipment) {
      throw new Error("No se encontró el equipo con el ID proporcionado.");
    }
    const changeLog = equipment.changeLog as ChangeRecord[];
    return changeLog;
  } catch (error) {
    console.error("Error fetching equipment changelog:", error);
    throw new Error("Error fetching equipment changelog.");
  }
}

export async function getNotificationsByEquipment(equipmentId: number) {
  try {
    const notifications = await db.generatedNotification.findMany({
      where: {
        maintenanceRequest: {
          equipment_id: equipmentId, // Relación con las solicitudes del equipo
        },
      },
      include: {
        maintenanceRequest: {
          select: {
            id: true,
            faultType: true,
            description: true,
          },
        },
        notificationGroup: {
          select: {
            name: true,
            details: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Ordena las notificaciones por fecha de creación
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error obteniendo notificaciones del equipo:", error);
    throw new Error("No se pudieron obtener las notificaciones");
  }
}

export async function getMaintenanceListByEquipment(equipmentId: number) {
  try {
    const maintenanceList = await db.maintenanceRequest.findMany({
      where: {
        equipment_id: equipmentId,
        status: {
          notIn: ["COMPLETADO", "CANCELADO"],
        },
      },
      include: {
        ship: true,
        estimatedSolutions: true,
        notifications: {
          include: {
            notificationGroup: true,
          },
        },
        responsible: true,
        users: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return maintenanceList;
  } catch (error) {
    console.error("Error fetching maintenance list by equipment:", error);
    throw new Error("Error fetching maintenance list by equipment.");
  }
}
