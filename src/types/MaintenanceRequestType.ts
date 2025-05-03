export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}
export interface MaintenanceRequestOnUser {
  username: any;
  userId: number;
  maintenanceRequestId: number;
  user: User;
  maintenanceRequest: MaintenanceRequest;
}

export type MaintenanceRequest = {
  faultType: string;
  maintenanceUserId: number | null | undefined;
  userRequestId: number;
  createdAt: string | number | Date;
  id: number;
  systemId: number; // Agregado el campo systemId
  systemName: string; // Incluye el nombre del sistema
  equipmentId: number; // Agregado el campo equipmentId
  equipmentName: string; // Incluye el nombre del equipo
  description: string;
  estimatedSolution: string | undefined;
  actionsTaken: string | undefined;
  status: any; // Remains unchanged
  estimatedSolution2: string | undefined;
  estimatedSolution3: string | undefined;
  realSolution: string | undefined;
  assignedToId: number | undefined;
  assignedTo: User | undefined;
  users: MaintenanceRequestOnUser[];
};

export interface ActionsTakenLog {
  id: number;
  comentario: string;
  equipo: string;
  fecha: Date;
  userId: number;
  user: string;
  shipName: string;
  shipId: number;
}

export interface ActionsTakenLogDto {
  id: number;
  status: string;
  actionsTakenlog: ActionsTakenLog[];
}
