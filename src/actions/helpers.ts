// Definimos el shape básico de tus datos
interface EstimatedSolution {
    id: number;
    date: string; // o Date si ya la manejas como objeto Date
    comment: string | null;
    maintenanceRequestId: number;
    createdAt: string;
    updatedAt: string;
  }
  
  interface MaintenanceRequest {
    id: number;
    folio: string;
    equipment_id: number;
    shipId: number;
    faultType: string;
    description: string | null;
    actionsTaken: string | null;
    actionsTakenlog: any[]; // Ajustar según definición
    status: string;
    realSolution: string | null;
    responsibleId: number;
    createdAt: string; // o Date
    updatedAt: string; // o Date
    // Más campos...
    estimatedSolutions: EstimatedSolution[];
    // Más campos...
  }
  
  // Definimos la respuesta de nuestra función
  interface MaintenanceRequestWithProgress extends MaintenanceRequest {
    progressPercentage: number;
  }
  
  interface CategorizedResult {
    aboutToExpire: MaintenanceRequestWithProgress[];
    expired: MaintenanceRequestWithProgress[];
  }
  
  /**
   * Función que:
   *  - Identifica qué registros ya superaron la fecha estimada (expired).
   *  - Identifica cuáles superaron el 75% del plazo (aboutToExpire).
   *  - Calcula el porcentaje de cumplimiento (progressPercentage).
   *    Puede ser > 100% si la fecha actual pasa la fecha estimada.
   */
  export function categorizeMaintenanceRequests(
    maintenanceRequests: MaintenanceRequest[]
  ): CategorizedResult {
    const aboutToExpire: MaintenanceRequestWithProgress[] = [];
    const expired: MaintenanceRequestWithProgress[] = [];
  
    const now = new Date();
  
    for (const item of maintenanceRequests) {
      if (!item.estimatedSolutions || item.estimatedSolutions.length === 0) {
        // Si no hay fechas estimadas, podrías decidir cómo manejarlo
        continue;
      }
  
      const createdDate = new Date(item.createdAt);
      // Usamos la fecha estimada en la posición 0
      const projectedDate = new Date(item.estimatedSolutions[0].date);
  
      // Tiempo total (milisegundos) desde createdAt hasta la fecha estimada
      const totalTimeMs = projectedDate.getTime() - createdDate.getTime();
      // Tiempo transcurrido (milisegundos) desde createdAt hasta la fecha actual
      const currentTimeMs = now.getTime() - createdDate.getTime();
  
      // Evitamos la división por cero en caso de que totalTimeMs <= 0
      // (fechas invertidas, etc.)
      let progressPercentage = 0;
      if (totalTimeMs > 0) {
        const ratio = currentTimeMs / totalTimeMs;
        progressPercentage = ratio * 100;
      } else {
        // Si la fecha estimada es la misma o anterior a createdAt,
        // podríamos considerar que está "vencido" o tratarlo de forma especial
        progressPercentage = 100;
      }
  
      // Si la fecha actual es mayor a la proyectada => "expired"
      if (now > projectedDate) {
        expired.push({ ...item, progressPercentage });
      } else {
        // Si el ratio >= 75%, va a "aboutToExpire"
        // (ej: ratio 0.7 => progressPercentage 75)
        if (progressPercentage >= 75) {
          aboutToExpire.push({ ...item, progressPercentage });
        }
      }
    }
  
    return { aboutToExpire, expired };
  }
  
  export function extractUniqueUsers(
    userRoles: { userId: number; user: { username: string; email: string } }[]
  ) {
    const uniqueUsers: {
      [key: number]: { name: string; email: string; role: string }; // role debe ser array para multiples roles
    } = {};
  
    userRoles.forEach((role: any) => {
      const { userId, user } = role;
      if (!uniqueUsers[userId]) {
        uniqueUsers[userId] = {
          name: user.username,
          email: user.email,
          role: role.role,
        };
      }
    });
  
    // Convertir el objeto en un array
    return Object.values(uniqueUsers);
  }
  