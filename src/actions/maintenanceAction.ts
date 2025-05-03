"use server";
import {
  getSession,
  extractRoles,
  extractShipIdsRoles,
} from "@/lib/sessionRoles";
import prisma from "@/libs/db";
import { MaintenanceRequest, Equipment, Prisma } from "@prisma/client";
import { ActionsTakenLog } from "@/types/MaintenanceRequestType";
import { z } from "zod";
import { categorizeMaintenanceRequests, extractUniqueUsers } from "./helpers";
import { maintenanceReportEmailHtml } from "@/emailContent/email75100";
import { generateEmailHtmlForResponsible } from "@/emailContent/generateEmailHtmlForResponsible";
import { sendEmail } from "@/apiServices/emailServices";
import { generateEmailHtmlForCriticalConditions } from "@/emailContent/generateEmailHtmlForCriticalConditions";
import { generateCompletionEmailHtml } from "@/emailContent/generateCompletionEmailHtml";
import { createMaintenanceExcel } from "@/libs/excelEmail";
import { createCriticalConditionsExcel } from "@/libs/createCriticalConditionsExcel";
import fs from "fs";
import { format } from 'date-fns'; // Usa date-fns o una librería similar para formatear fechas
import { es } from 'date-fns/locale';


const actionsTakenLogSchema = z.object({
  id: z.number(),
  comentario: z.string(),
  equipo: z.string(),
  fecha: z
    .union([z.date(), z.string()])
    .transform((value) =>
      typeof value === "string" ? new Date(value) : value
    ),
  userId: z.number(),
  user: z.string(),
  shipName: z.string(),
  shipId: z.number(),
});

export async function getMaintenanceList(statuses: string[], userSession: any) {
  // Obteniendo la sesión del usuario logueado
  const session = await getSession();
  console.log("Sesión obtenida:", session);

  try {
    if (!session) {
      console.error("No se encontró la sesión del usuario");
      throw new Error("No se encontró la sesión del usuario");
    }

    const shipIds = extractShipIdsRoles(session);
    console.log("Ship IDs extraídos:", shipIds);

    const roles = extractRoles(session.user);
    console.log("Roles extraídos:", roles);

    // Determinar si el usuario es un administrador
    const isAdmin = roles.some(
      (role: any) =>
        role.id === 6 ||
        role.id === 7 ||
        role.id === 8 ||
        role.id === 5 ||
        role.id === 3
    );

    console.log("¿Es administrador?", isAdmin);

    if (isAdmin) {
      console.log("El usuario es administrador, obteniendo todas las solicitudes...");
      const maintenance: MaintenanceRequest[] = await prisma.maintenanceRequest.findMany({
        where: {
          status: {
            in: statuses,
          },
        },
        include: {
          ship: true,
          equipment: true,
          responsible: true,
          photos: true,
          users: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true,
                  id: true,
                  verified: true,
                  lastLogin: true,
                  lastActivity: true,
                  state: true,
                },
              },
            },
          },
          estimatedSolutions: {
            orderBy: { date: "desc" },
          },
        },
        orderBy: { id: "desc" },
      });

      console.log("Solicitudes de mantenimiento obtenidas (Admin):", maintenance);
      return maintenance;
    } else if (shipIds.length > 0) {
      console.log("El usuario tiene acceso restringido, obteniendo solicitudes filtradas por shipIds:", shipIds);
      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          status: {
            in: statuses,
          },
          OR: shipIds.map((shipId) => ({
            shipId: shipId,
          })),
        },
        include: {
          ship: true,
          equipment: true,
          responsible: true,
          photos: true,  
          users: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true,
                  id: true,
                  verified: true,
                  lastLogin: true,
                  lastActivity: true,
                  state: true,
                },
              },
            },
          },
          estimatedSolutions: true,
        },
        orderBy: { id: "desc" },
      });

      console.log("Solicitudes de mantenimiento obtenidas (Filtrado por shipIds):", maintenance);
      return maintenance;
    } else {
      console.warn("El usuario no tiene permisos para ver ninguna solicitud de mantenimiento.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    throw new Error("Error fetching maintenance.");
  }
}


export async function createMaintenanceRequest(data: any) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);

  // Verificamos si el usuario tiene el rol 3 admin o 4 nave
  const hasPermission = roles.some(
    (role: any) =>
      role.id === 3 ||
      role.id === 4 ||
      role.id === 6 ||
      role.id === 7 ||
      role.id === 8
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Ejecutar la transacción para crear la solicitud de mantenimiento
    const maintenance = await prisma.$transaction(async (prisma) => {
      const eqq = await prisma.equipment.findUnique({
        where: { id: data.equipment_id },
        include: {
          ship: true,
        },
      });

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

      const shipCode = ship.folio_id; // ShipId con 2 dígitos
      const folio = `${shipCode}-${newId}`; // Formato FF01-id

      // Asigna el folio generado al campo folio
      data.folio = folio;

      const usersData = data.users.map((userId: number) => ({
        user: { connect: { id: userId } },
      }));

      // Crear solicitud de mantenimiento
      const createdRequest = await prisma.maintenanceRequest.create({
        data: {
          equipment_id: data.equipment_id,
          faultType: data.faultType,
          description: data.description,
          shipId: data.shipId,
          folio: data.folio,
          users: { create: usersData },
          responsibleId: data.responsibleId,
          // en lugar de `photoUrl`:
          photos: {
            create: data.photos.map((p: any) => ({
              url: p.url,
              filename: p.publicId, // opcional
            })),
          },
        },
        include: {
          photos: true,
          equipment: true,
          ship: true,
          responsible: true,
        },
      });



      return createdRequest;
    });

    // Generar la notificación después de que la transacción se complete
    const change = {
      field: "newRequest",
      oldValue: null, // No hay estado anterior porque es una nueva solicitud
      newValue: "SOLICITADO",
    };

    const notification = await generateNotification(change, maintenance);

    if (data.shipId) {
      await evaluateCriticalConditions(data.shipId);
    }

    if (data.responsibleId) {
      await requirementIncome(data.responsibleId, maintenance);
      console.log("correo enviado a responsible: ", data.responsibleId)
      await notifyAreaHeadByName(data.responsibleId, maintenance);
    }



    return { ...maintenance, notification };
  } catch (error: any) {
    console.error("Error creating maintenance request:", error.message);
    throw new Error("Error creating maintenance request.");
  }
}

async function notifyAreaHeadByName(responsibleId: number, maintenance: any) {
  try {
    // 1) Obtener información del responsable desde la BD
    const responsible = await prisma.responsible.findUnique({
      where: { id: responsibleId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!responsible || !responsible.user?.email) {
      console.log("No se encontró el responsable o su correo electrónico.");
      return;
    }

    const responsibleEmail = responsible.user.email.toLowerCase();

    // 2) Determinar si el responsable pertenece a Bahía o Flota
    const isBahiaEmail = (email: string): boolean =>
      email.includes("user_mantencion1") ||
      email.includes("user_mantencion2") ||
      email.includes("user_mantencion3");

    const isFlotaEmail = (email: string): boolean =>
      email.includes("user_mantencion4") ||
      email.includes("user_mantencion5") ||
      email.includes("user_mantencion6");

    const area = isBahiaEmail(responsibleEmail)
      ? "Bahía"
      : isFlotaEmail(responsibleEmail)
        ? "Flota"
        : null;

    if (!area) {
      console.log("No se pudo determinar el área (Bahía o Flota) del responsable.");
      return;
    }

    const areaRoleId = area === "Bahía" ? 6 : 8;

    // 3) Obtener usuarios con rol de jefe del área correspondiente
    const areaUsers = await prisma.userRole.findMany({
      where: {
        roleId: areaRoleId,
        notificationGroupId: 1,
        emailNotifications: true,
      },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (areaUsers.length === 0) {
      console.log(`No se encontraron usuarios para el área ${area}.`);
      return;
    }

    const areaEmails = Array.from(
      new Set(areaUsers.map((u) => u.user.email))
    );

    // 4) Crear el contenido del correo
    const responsibleName = responsible.name;
    const emailHtml = generateEmailHtmlForResponsible(maintenance, responsibleName);

    console.log(`Enviando notificación al/los jefe(s) del área ${area}:`, areaEmails);
    const currentDate = format(new Date(), 'dd-MM-yyyy');

    // 5) Enviar los correos uno por uno
    for (const email of areaEmails) {
      await sendEmail({
        user: { email }, // Un solo correo en cada iteración
        emailHtml,
        content: `Nuevo Requerimiento de Mantención Área ${area} ${currentDate}`,
      });
      console.log(`Correo enviado exitosamente a: ${email}`);
    }
  } catch (error) {
    console.error("Error notificando al jefe de área:", error);
    throw new Error("Error notificando al jefe de área.");
  }
}







async function evaluateCriticalConditions(shipId: number) {
  console.log(`Iniciando evaluación de condiciones críticas para la instalación con ID: ${shipId}.`);

  // 1. Obtener el nombre del barco
  console.log("Obteniendo información del barco...");
  const ship = await prisma.ships.findUnique({
    where: { id: shipId },
    select: { name: true },
  });

  if (!ship) {
    console.error(`No se encontró un barco con ID: ${shipId}.`);
    return;
  }

  const shipName = ship.name;
  console.log(`Nombre del barco obtenido: ${shipName}.`);

  // 2. Obtener las fallas pendientes para este barco
  console.log("Obteniendo fallas pendientes...");
  const faults = await prisma.maintenanceRequest.findMany({
    where: {
      shipId,
      status: { in: ["EN_PROCESO", "SOLICITADO"] },
    },
    include: {
      estimatedSolutions: { orderBy: { date: "desc" } },
      equipment: true,
      responsible: true,
    },
    orderBy: {
      createdAt: "desc", // Se ordena de la más reciente a la más antigua
    },
  });

  console.log(`Fallas obtenidas: ${faults.length}. Detalles:`, faults);
  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: es });

  // 3. Calculamos la cantidad de fallas por tipo
  console.log("Calculando fallas por tipo...");
  const ordinaryFaults = faults.filter((f) => f.faultType === "Ordinaria");
  const equipmentFaults = faults.filter((f) => f.faultType === "Equipo");
  const operationalFaults = faults.filter((f) => f.faultType === "Operativa");

  console.log(`Fallas ordinarias: ${ordinaryFaults.length}.`);
  console.log(`Fallas de equipo: ${equipmentFaults.length}.`);
  console.log(`Fallas operativas: ${operationalFaults.length}.`);

  const criticalConditions: string[] = [];

  // 4. Verificar cada condición e ir recopilando los mensajes
  console.log("Verificando condiciones críticas...");
  if (ordinaryFaults.length >= 15) {
    criticalConditions.push(
      `Fallas ordinarias: Se ha superado el límite de 15 fallas, registrándose un total de ${ordinaryFaults.length}.`
    );
  }

  if (equipmentFaults.length >= 5) {
    criticalConditions.push(
      `Fallas de equipo: Se ha superado el límite de 5 fallas, registrándose un total de ${equipmentFaults.length}.`
    );
  }

  if (operationalFaults.length > 0) {
    criticalConditions.push(
      `Fallas operativas: Se ha superado el límite de 1 falla, registrándose un total de ${operationalFaults.length}.`
    );
  }

  console.log("Condiciones críticas recopiladas:", criticalConditions);

  // 5. En caso de haber condiciones críticas:
  if (criticalConditions.length > 0) {
    // console.warn(
    //   `Alerta Condiciones Críticas barco "${shipName}". Razones:\n- ${criticalConditions.join(
    //     "\n- "
    //   )}`
    // );

    // // 6. Obtener los usuarios que deben ser notificados
    // console.log("Obteniendo usuarios para notificación...");
    const usersInGroup = await prisma.userRole.findMany({
      where: {
        notificationGroupId: 2,
        emailNotifications: true,
      },
      include: {
        user: true,
      },
    });

    const emails = usersInGroup.map((ur) => ur.user.email);
    // console.log(`Usuarios encontrados para notificación: ${emails.length}. Detalles:`, emails);

    // 7. Si hay usuarios, enviamos la notificación
    if (emails.length > 0) {
      // console.log("Preparando notificación de correo...");

      const emailHtml = generateEmailHtmlForCriticalConditions(
        shipName,
        criticalConditions
      );

      const ordinaryData = ordinaryFaults.length >= 15 ? ordinaryFaults : [];
      const equipmentData = equipmentFaults.length >= 5 ? equipmentFaults : [];
      const operationalData = operationalFaults.length > 0 ? operationalFaults : [];

      const filePath = await createCriticalConditionsExcel(
        ordinaryData,
        equipmentData,
        operationalData,
        shipName
      );

      // console.log("Archivo Excel generado:", filePath);
      const currentDate = format(new Date(), 'dd-MM-yyyy');

      for (const email of emails) {
        // console.log(`Enviando correo a: ${email}...`);
        await sendEmail({
          user: { email },
          content: `Alerta Condiciones Críticas Instalación ${shipName} ${currentDate}.`,
          emailHtml: emailHtml,
          attachmentPath: filePath,
        });
        // console.log(`Correo enviado a: ${email}.`);
      }

      if (fs.existsSync(filePath)) {
        // console.log(`Eliminando archivo temporal: ${filePath}.`);
        fs.unlinkSync(filePath);
      }
    } else {
      console.log("No se encontraron usuarios en el grupo NotificationGroupId = 2.");
    }
  } else {
    console.log(`No se detectaron condiciones críticas para el barco "${shipName}".`);
  }
}





// Función requirementIncome
async function requirementIncome(responsibleId: number, maintenance: any) {
  try {
    const responsible = await prisma.responsible.findUnique({
      where: { id: responsibleId },
      include: {
        user: {
          select: {
            email: true,
            roles: {
              where: { notificationGroupId: 1 }, // Filtramos por NotificationGroupId 1
              select: { emailNotifications: true },
            },
          },
        },
      },
    });

    if (!responsible || !responsible.user?.email) {
      console.log("No se encontró el responsable o su correo electrónico.");
      return;
    }

    const allEmailNotificationsTrue = responsible.user.roles.every(
      (role) => role.emailNotifications
    );

    // Si alguna instancia no tiene emailNotifications en true, no se envía el correo
    if (!allEmailNotificationsTrue || responsible.user.roles.length === 0) {
      console.log(
        "El responsable no cumple con los requisitos para recibir notificaciones."
      );
      return;
    }

    const responsibleEmail = responsible.user.email;
    const responsibleName = responsible.name;
    const emailHtml = generateEmailHtmlForResponsible(maintenance, responsibleName);
    const currentDate = format(new Date(), 'dd-MM-yyyy');

    console.log(`Enviando correo a: ${responsible.user.email}`);
    await sendEmail({
      user: { email: responsibleEmail },
      // user: { email: "pedro.ulloa@sotex.cl" },
      emailHtml,
      content: `Nuevo Requerimiento de Mantención ${currentDate}`,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating maintenance request:", error.message);
      throw new Error("Error creating maintenance request.");
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unknown error occurred.");
    }
  }
}




export async function updateMaintenanceRequest(data: any) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const currentUserId = (session.user as { id: number }).id;
  const roles = extractRoles(session.user);
  const hasPermission = roles.some((role: any) =>
    [3, 5, 6, 7, 8].includes(role.id)
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Búsquedas previas fuera de la transacción
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: data.id as number },
      include: { estimatedSolutions: true, equipment: true, ship: true },
    });

    if (!existingRequest) {
      throw new Error("Maintenance request not found.");
    }

    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const updateData: any = {};
    let faultTypeChanged = false;

    if (data.status !== undefined && existingRequest.status !== data.status) {
      changes.push({
        field: "status",
        oldValue: existingRequest.status,
        newValue: data.status,
      });
      updateData.status = data.status;

      // Si el estado cambia a COMPLETADO, registrar la fecha actual como realSolution
      if (data.status === "COMPLETADO") {
        const currentDate = new Date();
        changes.push({
          field: "realSolution",
          oldValue: existingRequest.realSolution,
          newValue: currentDate,
        });
        updateData.realSolution = currentDate;

        if (existingRequest.responsibleId) {
          await notifyResponsibleOnCompletion(
            existingRequest.responsibleId,
            existingRequest
          );
        }
      }
    }

    // Comparar `responsibleId`
    if (data.responsibleId !== undefined) {
      const newResponsible = await prisma.responsible.findUnique({
        where: { id: data.responsibleId as number },
      });

      if (!newResponsible) {
        throw new Error("Responsible not found.");
      }

      // Solo notificar si hay un cambio real de responsable
      if (existingRequest.responsibleId !== data.responsibleId) {
        changes.push({
          field: "responsibleId",
          oldValue: existingRequest.responsibleId,
          newValue: data.responsibleId,
        });

        updateData.responsibleId = data.responsibleId;

      }
    }

    // Lógica para actualizar `faultType`
    if (data.faultType !== undefined && existingRequest.faultType !== data.faultType) {
      changes.push({
        field: "faultType",
        oldValue: existingRequest.faultType,
        newValue: data.faultType,
      });
      updateData.faultType = data.faultType;
      faultTypeChanged = true; // Marcar que el tipo de falla ha cambiado
    }

    // Comparar otros campos
    const fieldsToUpdate: (keyof typeof existingRequest)[] = [
      "actionsTaken",
      "description",
    ];

    fieldsToUpdate.forEach((field) => {
      if (data[field] !== undefined && existingRequest[field] !== data[field]) {
        changes.push({
          field,
          oldValue: existingRequest[field],
          newValue: data[field],
        });
        updateData[field] = data[field];
      }
    });

    // Solución real y fechas estimadas
    if (data.realSolution !== undefined) {
      if (
        existingRequest.realSolution?.toISOString() !==
        new Date(data.realSolution).toISOString()
      ) {
        changes.push({
          field: "realSolutionDate",
          oldValue: existingRequest.realSolution,
          newValue: data.realSolution,
        });
        updateData.realSolution = new Date(data.realSolution);
        updateData.status = data.status;
      }
    }

    if (data.estimatedSolutions && Array.isArray(data.estimatedSolutions)) {
      const existingDates = existingRequest.estimatedSolutions.map((sol) =>
        sol.date.toISOString()
      );

      const newSolutions = data.estimatedSolutions.filter(
        (sol: any) => !existingDates.includes(new Date(sol.date).toISOString())
      );

      if (newSolutions.length > 0) {
        changes.push({
          field: "estimatedSolutions",
          oldValue: existingDates,
          newValue: newSolutions.map((sol: any) => sol.date),
        });

        updateData.estimatedSolutions = {
          create: newSolutions.map((sol: any) => ({
            date: new Date(sol.date),
            comment: sol.comment || "Estimación agregada desde el formulario",
          })),
        };

      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();

      console.log("updateData", updateData);

      // Actualización principal dentro de la transacción
      const maintenance = await prisma.$transaction(async (tx) => {
        return tx.maintenanceRequest.update({
          where: { id: data.id as number },
          data: {
            ...updateData,
            users: {
              create: [{ user: { connect: { id: currentUserId } } }],
            },
          },
          include: { estimatedSolutions: true, equipment: true, ship: true },
        });
      });

      if (faultTypeChanged && maintenance.ship?.id) {
        await evaluateCriticalConditions(maintenance.ship.id);
      }

      console.log("Changes detected:", changes);


      // Notificaciones generadas fuera de la transacción
      for (const change of changes) {
        await generateNotification(change, maintenance);
      }

      return maintenance;
    } else {
      throw new Error("No hay datos para actualizar.");
    }
  } catch (error: any) {
    console.error("Error updating maintenance request:", error.message);
    throw new Error("Error updating maintenance request.");
  }
}

async function notifyResponsibleOnCompletion(responsibleId: number, maintenance: any) {
  try {
    // 1) Obtener información del responsable desde la BD
    const responsible = await prisma.responsible.findUnique({
      where: { id: responsibleId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!responsible || !responsible.user?.email) {
      console.log("No se encontró el responsable o su correo electrónico.");
      return;
    }

    const responsibleEmail = responsible.user.email.toLowerCase();

    // 2) Determinar si el responsable pertenece a Bahía o Flota
    const isBahiaEmail = (email: string): boolean =>
      email.includes("user_mantencion1") ||
      email.includes("user_mantencion2") ||
      email.includes("user_mantencion3");

    const isFlotaEmail = (email: string): boolean =>
      email.includes("user_mantencion4") ||
      email.includes("user_mantencion5") ||
      email.includes("user_mantencion6");

    const area = isBahiaEmail(responsibleEmail)
      ? "Bahía"
      : isFlotaEmail(responsibleEmail)
        ? "Flota"
        : null;

    if (!area) {
      console.log("No se pudo determinar el área (Bahía o Flota) del responsable.");
      return;
    }

    const areaRoleId = area === "Bahía" ? 6 : 8;

    // 3) Obtener todos los usuarios con rol de jefe del área correspondiente
    const areaUsers = await prisma.userRole.findMany({
      where: {
        roleId: areaRoleId,
        notificationGroupId: 5,
        emailNotifications: true,
      },
      include: {
        user: {
          select: { email: true, username: true },
        },
      },
    });

    if (areaUsers.length === 0) {
      console.log(`No se encontraron usuarios para el área ${area}.`);
      return;
    }

    const areaEmails = Array.from(
      new Set(areaUsers.map((u) => u.user.email))
    );


    // 4) Crear el contenido del correo
    const responsibleName = responsible.name;
    const emailHtml = generateCompletionEmailHtml(maintenance, responsibleName);

    // console.log(`Enviando correos a los jefes de área ${area}:`, areaEmails);
    const currentDate = format(new Date(), 'dd-MM-yyyy');
    // 5) Enviar los correos uno por uno
    for (const email of areaEmails) {
      await sendEmail({
        user: { email }, // Enviar a un correo a la vez
        content: `Solicitud de Mantención Completada Área ${area} ${currentDate}`,
        emailHtml,
      });
      // console.log(`Correo enviado exitosamente a: ${email}`);
    }

    // console.log(`Todos los correos han sido enviados exitosamente a los jefes de área ${area}.`);
  } catch (error) {
    console.error("Error al notificar a los jefes de área:", error);
    throw new Error("Error al enviar la notificación a los jefes de área.");
  }
}





// Función para generar notificaciones
async function generateNotification(change: any, maintenance: any) {
  // console.log("Generando notificación para cambio:", maintenance, change);
  const equipmentName = maintenance.equipment?.name || "Desconocido";
  const shipName = maintenance.ship?.name || "Desconocido";

  let notificationGroupId: number | undefined;
  let type = "";
  let message = "";
  let title = "";

  // Función para formatear la fecha a la hora de Chile
  const formatToChileanTime = (date: Date) =>
    new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

  switch (change.field) {
    case "newRequest":
      notificationGroupId = 1; // Solicitud de mantenimiento
      type = "NEW_REQUEST";
      title = "Nuevo requerimiento de mantención";
      message = `Tipo de Falla: ${maintenance.faultType}, Estado: ${change.newValue} en ${equipmentName}, Instalación: ${shipName} con Folio ${maintenance.folio}.`;
      break;

    case "responsibleId":
      notificationGroupId = 6; // Cambio de responsable
      type = "RESPONSIBLE_CHANGED";
      try {
        const oldResponsible = await prisma.responsible.findUnique({
          where: { id: change.oldValue },
          include: { user: { select: { username: true } } },
        });
        const newResponsible = await prisma.responsible.findUnique({
          where: { id: change.newValue },
          include: { user: { select: { username: true } } },
        });
        title = "Cambio de responsable";
        message = `El responsable de la solicitud con folio ${maintenance.folio
          } cambió de ${oldResponsible?.user?.username || "N/A"} a ${newResponsible?.user?.username || "N/A"
          }.`;
      } catch (error: any) {
        console.error("Error obteniendo responsables:", error.message);
      }
      break;

    case "addComment":
      notificationGroupId = 8;
      type = "ADD_COMMENT";
      title = "Nuevo comentario";
      message = `Se agregó un nuevo comentario a la solicitud de mantenimiento con folio ${maintenance.folio}.`;
      break;

    case "status":
      notificationGroupId = 7;
      type = "STATUS_CHANGED";
      title = "Cambio de estado";
      message = `El estado de la solicitud con folio ${maintenance.folio}, Tipo de Falla: ${maintenance.faultType}, cambió de "${change.oldValue}" a "${change.newValue}".`;
      break;

    case "realSolution":
      notificationGroupId = 9;
      type = "COMPLETED";
      title = "Solicitud completada";
      message = `La solicitud con folio ${maintenance.folio}, Tipo de Falla: ${maintenance.faultType} se completó.`;
      break;

    case "realSolutionDate":
      notificationGroupId = 9;
      type = "COMPLETED_REAL_SOLUTION";
      title = "Solicitud completada";
      message = `La solución real para la solicitud con folio ${maintenance.folio
        } se marcó como completada el ${formatToChileanTime(new Date())}.`;
      break;

    case "estimatedSolutions":
      notificationGroupId = 8;
      type = "ESTIMATED_DATES_CHANGED";
      title = "Nuevas fechas estimadas";
      const formattedDates = change.newValue.map((date: string) =>
        formatToChileanTime(new Date(date))
      );
      message = `Se agregaron nuevas fechas estimadas: ${formattedDates.join(
        ", "
      )}, para la solicitud con folio ${maintenance.folio}, Tipo de Falla: ${maintenance.faultType
        }.`;
      break;
  }

  if (notificationGroupId) {
    try {
      const notificationGenerated = await prisma.generatedNotification.create({
        data: {
          maintenanceRequestId: maintenance.id,
          type,
          title,
          message,
          notificationGroupId,
          createdAt: new Date(),
        },
      });

      if (notificationGenerated) {
        const notificationGroup = await prisma.notificationGroup.findUnique({
          where: { id: notificationGroupId },
          include: {
            UserRole: {
              include: {
                user: true,
                role: true,
              },
              where: {
                emailNotifications: true,
              },
            },
          },
        });
        // console.log("Notification group:", notificationGroup);

        if (
          notificationGroup?.UserRole &&
          notificationGroup.UserRole.length > 0
        ) {
          const emails = extractUniqueUsers(notificationGroup.UserRole);
          // console.log("Correos electrónicos asociados:", emails);
          // console.log("maintenance", maintenance);

          // agregar las funiones de notificaciones
        }
        /* 
        
        Notificaciones 
        ******************************
        Rol OOPP
        cuando existan 15 fallas ordinarias simultaneas ( en proceso y solicitadas) en un solo Barco 
        cuado existan 5 fallas equipos  simultaneas ( en proceso y solicitadas) en un solo Barco 
        cuando se genere una falla operativa en un barco 



        *********************************************
        
        Rol Jefe de area bahia se le debe notificar 
        cuando se genera y cierre requerimiento de que sea de area bahia ( Enzo Gamberini , Richard Arenas , Juan pablo Vargas )


        *******************************
        Rol Jefe de area flota se le debe notificar
        cuando se genera y cierre requerimiento de que sea de area flota ( Manuel Muñoz y victo aguilar  )

        -------------------------------------------
        Notificaciones por tiempo ( Ejecutar peticion externa  8 am )

        Notificacion a Roles OOPP , Jefe de area bahia y jefe de area flota
         - cuando la falla cumpla el 75% de su tiempo estimado - notificacion amarilla

        - cuando la falla cumpla el 100% de su tiempo estimado tiempo vencido Notificacion roja

        ***************************
        Rol Mantencion

        Notificacion al crear y cerrar una falla de mantencion , dirigida al responsable de la falla 
        
        
        */
      }
    } catch (error: any) {
      console.error("Error generando notificación:", error.message);
    }
  } else {
    console.warn("No se generó notificación para este cambio.");
  }

  // console.log(`Notificación generada: ${title} - ${message}`);
}

export async function deleteMaintenanceRequest(id: number) {
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const roles = extractRoles(session.user);

  const hasPermission = roles.some(
    // role 3 admiin ,  6 jefe area bahia 7 gerente oopp 8 jefe de are area flota
    (role: any) =>
      role.id === 3 || role.id === 7 || role.id === 8 || role.id === 6
  );

  if (!hasPermission) {
    throw new Error("No tienes permiso para ejecutar esta acción.");
  }

  try {
    // Eliminar las relaciones antes de eliminar la solicitud principal
    await prisma.maintenanceRequestOnUser.deleteMany({
      where: { maintenanceRequestId: id },
    });

    await prisma.estimatedSolution.deleteMany({
      where: { maintenanceRequestId: id },
    });

    await prisma.generatedNotification.deleteMany({
      where: { maintenanceRequestId: id },
    });

    // Eliminar la solicitud de mantenimiento
    const maintenance = await prisma.maintenanceRequest.delete({
      where: { id },
    });

    console.log("Deleted maintenance request:", maintenance);

    return {
      maintenance,
    };
  } catch (error: any) {
    console.error("Error deleting maintenance request:", error.message);
    throw new Error("Error deleting maintenance request.");
  }
}

export async function getOpenedMaintenanceRequests(ship: string) {
  if (ship !== "ADMIN") {
    try {
      const shipId = await prisma.ships.findUnique({
        where: { name: ship },
      });
      // console.log("shipId", shipId);
      if (!shipId) {
        throw new Error(`Ship with folio ${ship} not found`);
      }

      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          status: "SOLICITADO",
          shipId: shipId.id,
        },
      });
      // console.log("Opened maintenance requests:", maintenance);

      return maintenance;
    } catch (error) {
      console.error("Error fetching opened maintenance requests:", error);
      throw new Error("Error fetching opened maintenance requests.");
    }
  } else if (ship === "ADMIN") {
    try {
      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          status: "SOLICITADO",
        },
      });
      //console.log("Opened maintenance requests:", maintenance);

      return maintenance;
    } catch (error) {
      console.error("Error fetching opened maintenance requests:", error);
      throw new Error("Error fetching opened maintenance requests.");
    }
  }
}
export async function getMaintenanceStats() {
  // obteniendo la session del usuario logeado
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const shipIds = extractShipIdsRoles(session); // Usamos la función para obtener shipIds
  const roles = extractRoles(session.user); // Usamos la función para extraer roles

  const isAdmin = roles.some(
    (role: any) =>
      role.id === 6 ||
      role.id === 7 ||
      role.id === 8 ||
      role.id === 5 ||
      role.id === 3
  );

  try {
    // Obtener la fecha de 30 días atrás para calcular "Fallas Finalizadas"
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    if (isAdmin) {
      // Si el usuario es administrador, obtiene todas las estadísticas sin restricciones
      const [solicitadas, enProceso, vencidas, finalizadas] = await Promise.all(
        [
          prisma.maintenanceRequest.count({
            where: { status: "SOLICITADO" },
          }),
          prisma.maintenanceRequest.count({
            where: { status: "EN_PROCESO" },
          }),
          prisma.maintenanceRequest.count({
            where: {
              status: { not: "COMPLETADO" },
              estimatedSolutions: {
                some: { date: { lt: new Date() } },
              },
            },
          }),
          prisma.maintenanceRequest.count({
            where: {
              status: "COMPLETADO",
              realSolution: { gte: date30DaysAgo },
            },
          }),
        ]
      );

      return {
        fallasSolicitadas: solicitadas,
        fallasEnProceso: enProceso,
        fallasVencidas: vencidas,
        fallasFinalizadas: finalizadas,
      };
    } else if (shipIds.length > 0) {
      // Si el usuario tiene acceso restringido a ciertos barcos, filtra por shipIds
      const [solicitadas, enProceso, vencidas, finalizadas] = await Promise.all(
        [
          prisma.maintenanceRequest.count({
            where: {
              status: "SOLICITADO",
              shipId: { in: shipIds },
            },
          }),
          prisma.maintenanceRequest.count({
            where: {
              status: "EN_PROCESO",
              shipId: { in: shipIds },
            },
          }),
          prisma.maintenanceRequest.count({
            where: {
              status: { not: "COMPLETADO" },
              shipId: { in: shipIds },
              estimatedSolutions: {
                some: { date: { lt: new Date() } },
              },
            },
          }),
          prisma.maintenanceRequest.count({
            where: {
              status: "COMPLETADO",
              shipId: { in: shipIds },
              realSolution: { gte: date30DaysAgo },
            },
          }),
        ]
      );

      return {
        fallasSolicitadas: solicitadas,
        fallasEnProceso: enProceso,
        fallasVencidas: vencidas,
        fallasFinalizadas: finalizadas,
      };
    } else {
      // Si el usuario no tiene permisos para ningún barco
      return {
        fallasSolicitadas: 0,
        fallasEnProceso: 0,
        fallasVencidas: 0,
        fallasFinalizadas: 0,
      };
    }
  } catch (error) {
    console.error("Error fetching maintenance stats:", error);
    throw new Error("Error fetching maintenance stats.");
  }
}

export async function getOpenedAndInProgressMaintenanceRequests(id: number) {
  console.log("id", id);
  const session = await getSession();

  if (!session) {
    throw new Error("No se encontró la sesión del usuario");
  }

  const shipIds = extractShipIdsRoles(session); // Usamos la función para obtener shipIds
  const roles = extractRoles(session.user); // Usamos la función para extraer roles

  const isAdmin = roles.some(
    (role: any) =>
      role.id === 6 || role.id === 7 || role.id === 8 || role.id === 3
  );
  console.log(isAdmin);
  try {
    if (isAdmin) {
      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          OR: [{ status: "SOLICITADO" }, { status: "EN_PROCESO" }],
        },
        include: {
          ship: true,
          equipment: true,
          responsible: true,
          estimatedSolutions: true,
          users: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });
      return maintenance;
    } else {
      const responsible = await prisma.responsible.findUnique({
        where: { userId: id },
      });
      if (!responsible) {
        return [];
        throw new Error(`Responsible with id ${id} not found`);
      }
      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          OR: [{ status: "SOLICITADO" }, { status: "EN_PROCESO" }],

          responsibleId: responsible?.id as number,
        },
        include: {
          ship: true,
          equipment: true,
          responsible: true,
          estimatedSolutions: true,
          users: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });
      return maintenance;
    }
  } catch (error) {
    console.error("Error fetching opened maintenance requests:", error);
    return new Error("Error fetching opened maintenance requests.");
  }
}

export const getMaintenanceById = async (id: number, responsibleId: number) => {
  // console.log("id", id);
  // console.log("responsibleId", responsibleId);
  try {
    if (responsibleId === 1000) {
      const maintenance = await prisma.maintenanceRequest.findUnique({
        where: { id },

        include: {
          ship: true,
          equipment: true,
          responsible: true,
          photos: true,
          users: {
            include: {
              user: true,
            },
          },
          estimatedSolutions: true,
        },
      });
      // console.log("maintenance", maintenance);

      return maintenance;
    } else {
      const maintenance = await prisma.maintenanceRequest.findUnique({
        where: { id, responsibleId },
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
      });
      return maintenance;
    }
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    throw new Error("Error fetching maintenance.");
  }
};

export async function getResponsibles() {
  try {
    const responsables = await prisma.responsible.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return responsables;
  } catch (error) {
    console.error("Error fetching responsibles:", error);
    throw new Error("Error fetching responsibles.");
  }
}

export async function getPendingMaintenanceRequests() {
  try {
    // Obtener los `MaintenanceRequest` que no estén completados, cancelados o solicitados
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        status: "EN_PROCESO",
      },

      include: {
        estimatedSolutions: true, // Incluir las fechas estimadas
        equipment: true,
        ship: true,
        users: true,
        responsible: {
          include: { user: true },
        },
      },
    });

    // Procesar los resultados para calcular los días restantes
    const processedRequests = maintenanceRequests.map((request) => {
      // Encontrar la última fecha estimada en `estimatedSolutions`
      const lastEstimatedDate = request.estimatedSolutions.reduce(
        (latest, current) => {
          const currentDate = new Date(current.date);
          return currentDate > latest ? currentDate : latest;
        },
        new Date(0)
      ); // Fecha inicial mínima para comparación

      // Calcular los días restantes
      const today = new Date();
      const daysRemaining = Math.ceil(
        (lastEstimatedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...request,
        daysRemaining, // Permitir valores negativos para indicar vencimiento
      };
    });

    // Ordenar los resultados por `daysRemaining` de menor a mayor
    const sortedRequests = processedRequests.sort(
      (a, b) => a.daysRemaining - b.daysRemaining
    );

    return sortedRequests;
  } catch (error) {
    console.error("Error fetching pending maintenance requests:", error);
    throw new Error("Error fetching pending maintenance requests.");
  }
}

export async function getActionTakenLogs(id: number) {
  try {
    // Buscar los logs de mantenimiento por ID
    const maintenanceLogs = await prisma.maintenanceRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        actionsTakenlog: true,
      },
    });

    // Validar si se encontró el registro
    if (!maintenanceLogs) {
      return {
        success: false,
        error: `Maintenance request with ID ${id} not found.`,
      };
    }

    // Filtrar datos inválidos en `actionsTakenlog` si es necesario
    const validLogs =
      maintenanceLogs.actionsTakenlog
        ?.filter(
          (log: any) => log && !log.query // Excluir entradas no deseadas
        )
        .toReversed() || [];

    const totalLogs = {
      ...maintenanceLogs,
      actionsTakenlog: validLogs, // Devuelve solo los logs válidos en orden inverso
    };
    return totalLogs;
  } catch (error) {
    // Manejar errores de Prisma o de lógica
    console.error("Error fetching maintenance logs:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}

export async function addActionTakenLog(
  id: number,
  actionTaken: Omit<ActionsTakenLog, "id">
) {
  try {
    // Obtener los logs existentes
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
      select: {
        actionsTakenlog: true,
        folio: true,
        equipment: true,
        ship: true,
      },
    });

    if (!maintenanceRequest) {
      throw new Error(`Maintenance request with ID ${id} not found.`);
    }

    // Asegurar que el array actual de logs sea un array válido
    const existingLogs = Array.isArray(maintenanceRequest.actionsTakenlog)
      ? maintenanceRequest.actionsTakenlog.filter(
        (log) => typeof log === "object" && log !== null && "id" in log
      )
      : [];

    // Calcular el siguiente id secuencial
    const nextId =
      existingLogs.length > 0
        ? Math.max(
          ...existingLogs.map((log) =>
            typeof log === "object" && log !== null && "id" in log
              ? Number(log.id)
              : 0
          )
        ) + 1
        : 1;

    // Crear el nuevo log con el id generado
    const newLog = { id: nextId, ...actionTaken };

    // Actualizar el array de logs con el nuevo log
    const updatedLogsArray = [...existingLogs, newLog];

    // Actualizar el registro en la base de datos
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        actionsTakenlog: updatedLogsArray as Prisma.InputJsonValue[],
      },
      select: {
        id: true,
        folio: true,
        equipment: true,
        ship: true,
      },
    });

    // Generar notificación
    const change = {
      field: "addComment",
      newValue: actionTaken.comentario, // Resumen del comentario
    };

    await generateNotification(change, updatedRequest);

    console.log("Log agregado correctamente:", updatedRequest);

    return {
      success: true,
      data: updatedRequest,
    };
  } catch (error) {
    console.error("Error al agregar el log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    };
  }
}

export async function deleteActionTakenLog(
  requirementId: number,
  logId: number
) {
  try {
    // Buscar el requerimiento de mantenimiento por ID
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: requirementId },
      select: { actionsTakenlog: true },
    });

    // Validar si se encontró el registro
    if (!maintenanceRequest) {
      throw new Error(
        `Maintenance request with ID ${requirementId} not found.`
      );
    }

    // Asegurar que el array de logs es válido
    const existingLogs = Array.isArray(maintenanceRequest.actionsTakenlog)
      ? maintenanceRequest.actionsTakenlog
      : [];

    // Filtrar el log a eliminar por su ID
    const updatedLogsArray = existingLogs.filter(
      (log: any) => log.id !== logId
    );

    // Validar si se eliminó algo
    if (existingLogs.length === updatedLogsArray.length) {
      throw new Error(
        `Log with ID ${logId} not found in maintenance request ${requirementId}.`
      );
    }

    // Actualizar los logs en la base de datos
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requirementId },
      data: {
        actionsTakenlog: updatedLogsArray as Prisma.InputJsonValue[],
      },
      select: {
        id: true,
        actionsTakenlog: true,
      },
    });

    console.log("Log eliminado correctamente:", updatedRequest);
    return {
      success: true,
      data: updatedRequest,
    };
  } catch (error) {
    console.error("Error al eliminar el log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    };
  }
}


export async function get75and100Maintenances() {
  try {
    // 1) Obtener mantenimientos de la BD
    const maitenances75100 = await prisma.maintenanceRequest.findMany({
      where: { status: "EN_PROCESO" },
      include: {
        estimatedSolutions: { orderBy: { date: "desc" } },
        responsible: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        equipment: true,
        ship: true, // Relación con la nave
      },
      orderBy: { id: "desc" },
    });

    // 2) Calcular progressPercentage => retorna { aboutToExpire, expired }
    const categorizedRequests = categorizeMaintenanceRequests(maitenances75100 as any[]);

    // 3) Enviar notificación general con "aboutToExpire + expired" a quienes tengan rolId=7
    const usersToNotify = await prisma.userRole.findMany({
      where: {
        roleId: 7,
        notificationGroupId: 3,
        emailNotifications: true,
      },
      include: { user: { select: { email: true } } },
    });

    const emails = Array.from(
      new Set(usersToNotify.map((userRole) => userRole.user.email))
    );

    if (emails.length > 0) {
      const simplifiedData = [
        ...categorizedRequests.aboutToExpire,
        ...categorizedRequests.expired,
      ];

      const emailHtml = maintenanceReportEmailHtml();
      const generalFilePath = await createMaintenanceExcel(simplifiedData);

      console.log("Enviando notificación general a los siguientes correos:", emails);
      const currentDate = format(new Date(), 'dd-MM-yyyy');
      for (const email of emails) {
        await sendEmail({
          user: { email },
          emailHtml,
          content: `Alerta Plazo de Solución ${currentDate}`,
          attachmentPath: generalFilePath,
        });
        console.log(`Correo enviado exitosamente a: ${email} ${currentDate}`);
      }

      fs.unlinkSync(generalFilePath);
    }

    // -------------------------------------------------------------------------------------
    // 4) Notificar a los jefes de área (Bahía y Flota)
    // -------------------------------------------------------------------------------------

    const isBahiaEmail = (m: any): boolean => {
      if (!m.responsible?.user?.email) return false;
      const email = m.responsible.user.email.toLowerCase();
      return (
        email.includes("user_mantencion1") ||
        email.includes("user_mantencion2") ||
        email.includes("user_mantencion3")
      );
    };

    const isFlotaEmail = (m: any): boolean => {
      if (!m.responsible?.user?.email) return false;
      const email = m.responsible.user.email.toLowerCase();
      return (
        email.includes("user_mantencion4") ||
        email.includes("user_mantencion5") ||
        email.includes("user_mantencion6")
      );
    };

    const bahiaData = [
      ...categorizedRequests.aboutToExpire.filter(isBahiaEmail),
      ...categorizedRequests.expired.filter(isBahiaEmail),
    ];

    const flotaData = [
      ...categorizedRequests.aboutToExpire.filter(isFlotaEmail),
      ...categorizedRequests.expired.filter(isFlotaEmail),
    ];

    const bahiaUsers = await prisma.userRole.findMany({
      where: {
        roleId: 6,
        notificationGroupId: 3,
        emailNotifications: true,
      },
      include: { user: { select: { email: true } } },
    });

    const flotaUsers = await prisma.userRole.findMany({
      where: {
        roleId: 8,
        notificationGroupId: 3,
        emailNotifications: true,
      },
      include: { user: { select: { email: true } } },
    });

    // 4.4) Enviar a Bahía
    if (bahiaData.length > 0 && bahiaUsers.length > 0) {
      const bahiaFilePath = await createMaintenanceExcel(bahiaData);
      const areaEmailHtml = maintenanceReportEmailHtml();
      const emailsBahia = Array.from(
        new Set(bahiaUsers.map((u) => u.user.email))
      );

      console.log("Enviando correo al/los jefe(s) de área Bahía:", emailsBahia);
      const currentDate = format(new Date(), 'dd-MM-yyyy');
      for (const email of emailsBahia) {
        await sendEmail({
          user: { email },
          emailHtml: areaEmailHtml,
          content: `Alerta Plazo de Solución para Área Bahía ${currentDate}`,
          attachmentPath: bahiaFilePath,
        });
        console.log(`Correo enviado exitosamente a: ${email}`);
      }

      fs.unlinkSync(bahiaFilePath);
    }

    // 4.5) Enviar a Flota
    if (flotaData.length > 0 && flotaUsers.length > 0) {
      const flotaFilePath = await createMaintenanceExcel(flotaData);
      const areaEmailHtml = maintenanceReportEmailHtml();
      const emailsFlota = Array.from(
        new Set(flotaUsers.map((u) => u.user.email))
      );

      console.log("Enviando correo al/los jefe(s) de área Flota:", emailsFlota);
      const currentDate = format(new Date(), 'dd-MM-yyyy');
      for (const email of emailsFlota) {
        await sendEmail({
          user: { email },
          emailHtml: areaEmailHtml,
          content: `Alerta Plazo de Solución para Área Flota ${currentDate}`,
          attachmentPath: flotaFilePath,
        });
        console.log(`Correo enviado exitosamente a: ${email}`);
      }

      fs.unlinkSync(flotaFilePath);
    }

    return categorizedRequests;
  } catch (error) {
    console.error("Error al obtener las 75% y 100% de fallas:", error);
    throw new Error("Error al obtener las 75% y 100% de fallas.");
  }
}







/* 
{
  "aboutToExpire": [
    {
      "id": 240,
      "folio": "FF06-240",
      "equipment_id": 244,
      "shipId": 2,
      "faultType": "Equipo",
      "description": "Falla 1",
      "actionsTaken": null,
      "actionsTakenlog": [],
      "status": "EN_PROCESO",
      "realSolution": null,
      "responsibleId": 4,
      "createdAt": "2024-11-29T14:16:13.021Z",
      "updatedAt": "2024-11-29T16:14:26.360Z",
      "estimatedSolutions": [
        {
          "id": 316,
          "date": "2024-12-31T00:00:00.000Z",
          "comment": "Estimación agregada desde el formulario",
          "maintenanceRequestId": 240,
          "createdAt": "2024-11-29T16:14:26.399Z",
          "updatedAt": "2024-11-29T16:14:26.399Z"
        }
      ],
      "...": "otros_campos",
      "progressPercentage": 72.5 //TODO: amarillo en el grafico
    }
  ],
  "expired": [
    {
      "id": 239,
      "folio": "FF07-239",
      "equipment_id": 338,
      "shipId": 3,
      "faultType": "Equipo",
      "description": "asdasd",
      "actionsTaken": "",
      "actionsTakenlog": [],
      "status": "EN_PROCESO",
      "realSolution": null,
      "responsibleId": 4,
      "createdAt": "2024-11-29T14:15:44.450Z",
      "updatedAt": "2024-11-29T15:47:05.124Z",
      "estimatedSolutions": [
        {
          "id": 310,
          "date": "2025-01-15T00:00:00.000Z",
          "comment": "Estimación agregada desde el formulario",
          "maintenanceRequestId": 239,
          "createdAt": "2024-11-29T15:47:05.126Z",
          "updatedAt": "2024-11-29T15:47:05.126Z"
        }
      ],
      "...": "otros_campos",
      "progressPercentage": 115.4  //TODO: rojo en el grafico
    }
  ]
}
 */
