"use client";

import { Edit, ClipboardList, ToggleLeft, ToggleRight } from "lucide-react"; // Importa los íconos de Lucide
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { flatEquipmentSchema } from "../data/schema";
import useUserRoles from "@/hooks/useUserRoles";
import {
  useDeactivateEquipment,
  useActivateEquipment,
} from "@/hooks/useQueriesEquipment";

import React, { useState } from "react";
import ChangeLogModal from "./ChangeLogModal";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { isAllowed } = useUserRoles([3, 4, 7, 8]);
  const router = useRouter();
  const task = flatEquipmentSchema.parse(row.original);

  if (!isAllowed) {
    return null;
  }

  const deactivateEquipmentMutation = useDeactivateEquipment();
  const activateEquipmentMutation = useActivateEquipment();

  const isActive = task.active;

  const handleToggleActive = () => {
    if (isActive) {
      deactivateEquipmentMutation.mutate(task.id);
    } else {
      activateEquipmentMutation.mutate(task.id);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/mantencion/consolidado-equipos/${task.id}`);
  };

  // Estado y funciones para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-5 w-5" /> {/* Nuevo ícono */}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Editar {/* Ícono para editar */}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenModal}>
            <ClipboardList className="mr-2 h-4 w-4" /> Ver registros{" "}
            {/* Ícono para registros */}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleToggleActive}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border ${
              isActive
                ? "bg-white text-red-600 hover:border-red-500"
                : "bg-white text-green-500 hover:border-green-500"
            }`}
          >
            {isActive ? (
              <>
                <ToggleRight className="h-4 w-4" /> Desactivar
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" /> Activar
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Incluir el ChangeLogModal */}
      <ChangeLogModal
        equipmentId={task.id}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
