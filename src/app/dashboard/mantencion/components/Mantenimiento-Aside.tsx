"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Tooltip from "@radix-ui/react-tooltip";
import { HomeIcon, InboxIcon, TableProperties, Group, AlertTriangle, ClipboardList, Mail, SettingsIcon, type LucideIcon } from "lucide-react";

import useMediaQuery from "@/hooks/useMediaQuery";
import { useSession } from "next-auth/react";
import useUserRoles from "@/hooks/useUserRoles";
import { useGetOpenedAndInProgressMaintenanceRequests } from "@/hooks/UseQueriesMaintenance";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

interface BadgeInfo {
  color: "red" | "yellow";
  value: number;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  visible: boolean;
  badge?: BadgeInfo;
  exact?: boolean; // Para match exacto en algunos enlaces
}

interface AsideMantencionProps {
  isOpen: boolean;
}

export function AsideMantencion({ isOpen }: AsideMantencionProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { data: session } = useSession();
  const user = session?.user as {
    id: number;
    roles: { role: { id: number } }[];
    responsible?: { id: number };
  };

  const canViewShips = useUserRoles([3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14]).isAllowed;
  const canViewUsers = useUserRoles([3, 5, 6, 7, 8]).isAllowed;
  const isAdmin = useUserRoles([3, 7, 6, 8]).isAllowed;
  const isSuperAdmin = useUserRoles([3]).isAllowed;

  const { data: pending } = useGetOpenedAndInProgressMaintenanceRequests(user?.id ?? null);

  const [filtered, setFiltered] = React.useState<any[]>([]);
  const [opened, setOpened] = React.useState(0);
  const [inProgress, setInProgress] = React.useState(0);

  React.useEffect(() => {
    if (!pending || !user) return;
    const jefeBahiaMant = user.roles.some((r) => r.role.id === 6) && user.roles.some((r) => r.role.id === 5);

    const list = Array.isArray(pending) ? pending : [];
    setFiltered(isAdmin && !jefeBahiaMant ? list : list.filter((r: any) => r.responsibleId === user.responsible?.id));
  }, [pending, user, isAdmin]);

  React.useEffect(() => {
    setOpened(filtered.filter((r) => r.status === "SOLICITADO").length);
    setInProgress(filtered.filter((r) => r.status === "EN_PROCESO").length);
  }, [filtered]);

  const navLinks: NavLink[] = [
    {
      href: "/dashboard/mantencion",
      label: "Inicio",
      icon: HomeIcon,
      visible: canViewUsers,
      exact: true, // sólo match exacto
    },
    {
      href: "/dashboard/mantencion/ingreso",
      label: "Ingreso Requerimiento",
      icon: InboxIcon,
      visible: canViewShips,
    },
    {
      href: "/dashboard/mantencion/solicitudes",
      label: "Req. Asignados",
      icon: AlertTriangle,
      visible: canViewUsers,
      badge: opened > 0 ? { color: "red", value: opened } : inProgress > 0 ? { color: "yellow", value: inProgress } : undefined,
    },
    {
      href: "/dashboard/mantencion/consolidado-solicitudes",
      label: "Consolidado Mantención",
      icon: TableProperties,
      visible: true,
    },
    {
      href: "/dashboard/mantencion/consolidado-equipos",
      label: "Maestro Equipos",
      icon: Group,
      visible: canViewUsers,
    },
    {
      href: "/dashboard/mantencion/maestro-requerimiento",
      label: "Maestro Req.",
      icon: ClipboardList,
      visible: isAdmin,
    },
    {
      href: "/dashboard/mantencion/notificaciones",
      label: "Notificaciones",
      icon: Mail,
      visible: canViewUsers,
    },
    {
      href: "/dashboard/mantencion/configuracion",
      label: "Configuración",
      icon: SettingsIcon,
      visible: isSuperAdmin,
    },
  ];

  return (
    <aside className={cn("h-full bg-white dark:bg-gray-900 shadow-md overflow-hidden transition-[width] duration-300 ease-in-out", isOpen ? "w-72" : "w-[90px]")}>
      {/* Logo arriba del aside */}
      <div className="px-4 py-6 flex justify-center border-b border-gray-200">
        <Link
          href="#"
          className="block"
        >
          <img
            src={isOpen ? "/cargill/logo-cargill.png" : "/cargill/iso-cargill.png"}
            alt={isOpen ? "Sotex Logo" : "Sotex Isotipo"}
            className={cn("transition-all duration-300 ease-in-out", isOpen ? "max-w-[150px]" : "max-w-[30px]")}
          />
        </Link>
      </div>

      <div className="px-3 py-4 h-full overflow-y-auto">
        {navLinks
          .filter((l) => l.visible)
          .map((link, i) => {
            const active = link.exact
              ? pathname === link.href // match exacto
              : pathname.startsWith(link.href); // match por prefijo

            return (
              <Tooltip.Provider key={i}>
                <Tooltip.Root delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={link.href}
                      className={cn("flex items-center w-full h-10 px-2 my-1 rounded-md transition", active ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300", isOpen ? "justify-start" : "justify-center")}
                    >
                      <link.icon className="w-5 h-5 flex-shrink-0" />
                      {isOpen && <span className="ml-3 flex-1 truncate">{link.label}</span>}
                      {isOpen && link.badge && <span className={clsx("ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full", link.badge.color === "red" ? "bg-red-500 text-white" : "bg-yellow-400 text-white")}>{link.badge.value}</span>}
                    </Link>
                  </Tooltip.Trigger>
                  {!isOpen && (
                    <Tooltip.Content
                      side="right"
                      className="px-2 py-1 rounded-md bg-gray-800 text-white text-xs"
                    >
                      {link.label}
                    </Tooltip.Content>
                  )}
                </Tooltip.Root>
              </Tooltip.Provider>
            );
          })}
      </div>
    </aside>
  );
}
