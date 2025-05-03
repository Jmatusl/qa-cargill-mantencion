import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Role {
  role: {
    id: number;
    name: string;
    description: string;
  };
  Ships: { id: number }[];
}
interface Session {
  user: any;
  roles: Role[];
}

// Función para obtener la sesión del usuario
export async function getSession(): Promise<Session> {
  const session = await getServerSession(authOptions as any);
  return session as Session;
}

// Función para extraer los shipIds de los roles
// Función para extraer los shipIds de los roles
export function extractShipIdsRoles(session: any) {
  if (!session || !session.user) {
    return [];
  }

  const shipIds: number[] = [];

  // Extraer shipId del usuario directamente si existe
  if (session.user.shipId) {
    shipIds.push(session.user.shipId);
  }

  // Extraer shipIds de los roles (si aplica)
  if (session.roles && session.roles.length > 0) {
    session.roles.forEach((role: Role) => {
      if (role.Ships && role.Ships.length > 0) {
        role.Ships.forEach((ship: any) => {
          if (ship.id) {
            shipIds.push(ship.id);
          }
        });
      }
    });
  }

  console.log("Ship IDs corregidos:", shipIds);
  return shipIds;
}


// Función para extraer los roles de la sesión
export function extractRoles(
  session: any
): { id: number; name: string; description: string }[] {
  if (!session || !session.roles || session.roles.length === 0) {
    return [];
  }

  const roles: { id: number; name: string; description: string }[] = [];

  session.roles.forEach((role: Role) => {
    if (role.role && role.role.name) {
      roles.push({
        id: role.role.id,
        name: role.role.name,
        description: role.role.description,
      });
    }
  });

  return roles;
}
