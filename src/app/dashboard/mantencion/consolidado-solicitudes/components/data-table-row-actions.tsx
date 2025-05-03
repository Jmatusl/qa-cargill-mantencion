"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useDeleteMaintenanceRequest } from "@/hooks/UseQueriesMaintenance";
import useUserRoles from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/Modal";
import ContentModal from "./ContentModal";

import { labels, statuses } from "../data/data";
import { maintenanceRequestSchema, MaintenanceRequest } from "../data/schema";
import { Eye, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface DataTableRowActionsProps<TData extends { id: string }> {
  row: Row<TData>;
}

export function DataTableRowActions<
  TData extends { id: string; folio: string }
>({ row }: DataTableRowActionsProps<TData>) {
  const task = maintenanceRequestSchema.parse(row.original);

  const {
    mutate: deleteMaintenanceRequest,
    isPending,
    isError,
    isSuccess,
  } = useDeleteMaintenanceRequest();

  useEffect(() => {
    if (isError) {
      toast.error("Error al eliminar la solicitud de mantención");
    } else if (isSuccess && !isError) {
      toast.success("Solicitud de mantención eliminada correctamente");
    }
  }, [isError, isSuccess]);

  const { isAllowed } = useUserRoles([3, 4, 7, 8]);

  const handleDelete = async () => {
    if (isPending) return;
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar la solicitud de mantención ${row.original.folio}?`
    );

    if (!confirmDelete) {
      return;
    }

    deleteMaintenanceRequest(Number(row.original.id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <div className="mb-2">
          <Modal
            className="w-full md:w-2/3 lg:w-1/2 justify-end" // Cambiado a w-2/3 y w-1/2
            trigger={
              <button className="flex items-center min-w-full hover:bg-slate-100 mt-1">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </button>
            }
            data={row.original}
          >
            <ContentModal setOpen={() => {}} />
          </Modal>
        </div>

        {isAllowed && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              className="hover:bg-slate-100"
              disabled={isPending}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
