import db from "./db";
import { notificationMessages } from "@/data/notificationMessages";

// Datos iniciales para grupos de notificaciones y roles
const notificationGroupsData = [
  {
    name: "Ingreso de Requerimiento",
    roles: ["MANTENCION", "JEFE_AREA"],
    message: notificationMessages.IngresoRequerimiento,
  },
  {
    name: "Condiciones Críticas",
    roles: ["GERENTE_OOPP"],
    message: notificationMessages.CondicionesCriticas,
  },
  {
    name: "Plazo de Solución 75%",
    roles: ["JEFE_AREA", "GERENTE_OOPP"],
    message: notificationMessages.PlazoSolucion75,
  },
  {
    name: "Plazo de Solución Final",
    roles: ["JEFE_AREA", "GERENTE_OOPP"],
    message: notificationMessages.PlazoSolucionFinal,
  },
  {
    name: "Finalización de Requerimiento",
    roles: ["JEFE_AREA"],
    message: notificationMessages.FinalizacionRequerimiento,
  },
];

// Función para crear grupos de notificación y asociar roles
export async function initializeNotificationGroups() {
  let res = [];
  for (const group of notificationGroupsData) {
    const newGroup = await db.notificationGroup.create({
      data: {
        name: group.name,
        details: group.message,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.push(newGroup);

    for (const role of group.roles) {
      const roleData = await db.role.findUnique({
        where: { name: role },
      });

      if (roleData) {
        const newNotificationGroupRole = await db.notificationGroupRole.create({
          data: {
            notificationGroupId: newGroup.id,
            roleId: roleData.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        res.push(newNotificationGroupRole);
      }
    }
  }

  return res;
}
