"use client";

import React, { useState, useEffect } from "react";
import { LogOut, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookIcon, UsersIcon, SailboatIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGetOpenedAndInProgressMaintenanceRequests } from "@/hooks/UseQueriesMaintenance";
import { useSession } from "next-auth/react";
import { Responsible } from "@prisma/client";
import useUserRoles from "@/hooks/useUserRoles";
import MaintenanceSubMenu from "@/components/MaintenanceSubMenu"; // Importa el nuevo componente

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRole {
  userId: number;
  roleId: number;
  role: Role;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  responsible?: Responsible;
}

export function DropdownPanel({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userData = session?.user as User;

  const [filteredList, setFilteredList] = useState<any[]>([]);
  const {
    data: pendingMaintenanceRequests,
    isFetching,
    isError,
  } = useGetOpenedAndInProgressMaintenanceRequests(userData?.id || null);

  console.log("pendingMaintenanceRequests", pendingMaintenanceRequests);

  const [opened, setOpened] = useState(0);
  const [inProgress, setInProgress] = useState(0);

  const maintenanceRoles = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const usersRoles = [3];
  const vistaNaves = [3, 6, 7, 8, 4, 9, 10, 11, 12, 13, 14];
  const vistaUsuarios = [3, 5, 6, 7, 8];

  const { isAllowed: canAccessMaintenance } = useUserRoles(maintenanceRoles);
  const { isAllowed: canAccessUsers } = useUserRoles(usersRoles);
  const { isAllowed: canAccessIngreso } = useUserRoles(vistaNaves);
  const { isAllowed: canAccessUsuarios } = useUserRoles(vistaUsuarios);

  const adminRolesIds = [3, 7, 6, 8];
  const { isAllowed: isAdminRole } = useUserRoles(adminRolesIds);
  const { isAllowed: isMantencion } = useUserRoles([5]);

  useEffect(() => {
    if (userData) {
      const esJefeAreaBahiaConMantencion =
        userData.roles.some((role) => role.role.id === 6) && // Jefe Área Bahía
        userData.roles.some((role) => role.role.id === 5); // Mantención

      if (isAdminRole && !esJefeAreaBahiaConMantencion) {
        setFilteredList(pendingMaintenanceRequests);
      } else {
        setFilteredList(
          pendingMaintenanceRequests?.filter(
            (request: any) => request.responsibleId === userData.responsible?.id
          )
        );
      }
    }
  }, [userData, isAdminRole, isMantencion, pendingMaintenanceRequests]);

  useEffect(() => {
    if (filteredList) {
      setOpened(
        filteredList.filter((request: any) => request.status === "SOLICITADO")
          .length
      );
      setInProgress(
        filteredList.filter((request: any) => request.status === "EN_PROCESO")
          .length
      );
    }
  }, [filteredList]);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres salir?")) {
      await signOut({
        redirect: false,
        callbackUrl: "/auth/login",
      });
      sessionStorage.clear();
      router.push("/auth/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-full bg-white border border-gray-300"
          size="icon"
          variant="ghost"
        >
          <Image
            alt="Avatar"
            className="rounded-full"
            height="32"
            src="/isotipo sotex.png"
            style={{
              aspectRatio: "32/32",
              objectFit: "cover",
            }}
            width="32"
          />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel className="text-md">{"Menu"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>

          {canAccessMaintenance && (
            <MaintenanceSubMenu
              canAccessUsuarios={canAccessUsuarios}
              canAccessIngreso={canAccessIngreso}
              opened={opened}
              inProgress={inProgress}
            />
          )}

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              {canAccessUsers && (
                <DropdownMenuItem
                  className="flex items-center gap-2 text-md w-full"
                  onClick={() => {
                    router.push("/dashboard/users");
                  }}
                >
                  <UsersIcon className="h-5 w-5" />
                  Usuarios
                </DropdownMenuItem>
              )}
        
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:bg-red-500 hover:text-white text-md"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-6 w-6" />
          <span>Salir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
