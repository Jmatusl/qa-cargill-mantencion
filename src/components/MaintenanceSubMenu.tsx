// components/MaintenanceSubMenu.tsx
"use client";

import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Wrench,
  HomeIcon,
  InboxIcon,
  AlertTriangle,
  TableProperties,
  Group,
  SettingsIcon,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import useUserRoles from "@/hooks/useUserRoles";

interface MaintenanceSubMenuProps {
  canAccessUsuarios: boolean;
  canAccessIngreso: boolean;
  opened: number;
  inProgress: number;
}

const MaintenanceSubMenu: React.FC<MaintenanceSubMenuProps> = ({
  canAccessUsuarios,
  canAccessIngreso,
  opened,
  inProgress,
}) => {
  const router = useRouter();
  const { isAllowed: isSuperAdmin } = useUserRoles([3]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2 text-md w-full">
        <Wrench className="h-5 w-5" />
        Mantención
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {canAccessUsuarios && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/dashboard/mantencion")}
          >
            <HomeIcon className="h-5 w-5" />
            Inicio
          </DropdownMenuItem>
        )}
        {canAccessIngreso && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/dashboard/mantencion/ingreso")}
          >
            <InboxIcon className="h-5 w-5" />
            Ingreso Requerimiento
          </DropdownMenuItem>
        )}
        {canAccessUsuarios && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/dashboard/mantencion/solicitudes")}
          >
            <AlertTriangle className="h-5 w-5" />
            Requerimientos Asignados
            {(opened > 0 || inProgress > 0) && (
              <Badge
                variant={
                  opened > 0
                    ? "destructive"
                    : inProgress > 0
                    ? "secondary"
                    : "default"
                }
                className={`ml-auto text-xs ${
                  opened > 0
                    ? ""
                    : inProgress > 0
                    ? "bg-yellow-500 text-white"
                    : ""
                }`}
              >
                {opened > 0 ? opened : inProgress}
              </Badge>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm"
          onClick={() =>
            router.push("/dashboard/mantencion/consolidado-solicitudes")
          }
        >
          <TableProperties className="h-5 w-5" />
          Consolidado Mantención
        </DropdownMenuItem>
        {canAccessUsuarios && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() =>
              router.push("/dashboard/mantencion/consolidado-equipos")
            }
          >
            <Group className="h-5 w-5" />
            Maestro de Equipos
          </DropdownMenuItem>
        )}
        {canAccessUsuarios && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() =>
              router.push("/dashboard/mantencion/notificaciones")
            }
          >
            <Mail className="h-5 w-5" />
            Notificaciones
          </DropdownMenuItem>
        )}
        {isSuperAdmin && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/dashboard/mantencion/configuracion")}
          >
            <SettingsIcon className="h-5 w-5" />
            Configuración
          </DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export default MaintenanceSubMenu;
