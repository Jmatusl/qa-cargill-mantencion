"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MaintenanceRequest } from "../data/schema";
import { DataTableColumnHeader } from "@/components/tangstackTable/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { statuses } from "@/app/dashboard/mantencion/consolidado-solicitudes/data/data";
import { stat } from "fs";
import { useSession } from "next-auth/react";

// Definir las columnas para la tabla basado en el esquema de mantenimiento
export const columns: ColumnDef<MaintenanceRequest>[] = [
  // {
  //   id: "select",
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px] ml-1"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "Edit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Editar" />
    ),
    cell: ({ row }) => {
      const sessionResponsibleId =
        (useSession().data?.user as any)?.responsible?.id ?? null;

      if (sessionResponsibleId === row.original.responsibleId) {
        return (
          <div className="max-w-[30px] flex items-center justify-center text-sm py-2  ">
            <Link href={`/dashboard/mantencion/solicitudes/${row.original.id}`}>
              <PencilIcon className="w-4 h-4 text-blue-600 hover:text-blue-900" />
            </Link>
          </div>
        );
      }
    },
  },
  {
    accessorKey: "folio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Folio" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[100px] text-sm  font-semibold text-center ">
        {row.getValue("folio")}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "equipment.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipo" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[150px] text-sm  font-semibold truncate ">
        {row.getValue("equipment_name")}
      </span>
    ),
  },
  {
    accessorKey: "equipment.subarea",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sistema" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[150px] text-sm  font-semibold truncate ">
        {row.getValue("equipment_subarea")}
      </span>
    ),
  },
  {
    accessorKey: "ship.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instalación" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[150px] text-sm  font-semibold truncate flex items-center justify-center">
        {row.getValue("ship_name")}
      </span>
    ),
  },
  {
    accessorKey: "faultType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de requerimiento" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[100px] flex items-center justify-center text-sm  font-semibold truncate ">
        {row.getValue("faultType")}
      </span>
    ),
  },
  // {
  //   accessorKey: "description",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Descripción" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="max-w-[200px] text-sm  font-semibold truncate ">
  //       {row.getValue("description")}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">{status.label}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "realSolution",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Fecha de Solución Real" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="max-w-[100px] text-sm  font-semibold truncate ">
  //       {row.getValue("realSolution")
  //         ? row.getValue("realSolution").toLocaleDateString()
  //         : "Pendiente"}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "responsible.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[150px] text-sm  font-semibold truncate ">
        {row.getValue("responsible_name")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Ingreso" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[100px] text-sm  font-semibold truncate ">
        {new Date(row.getValue("createdAt")).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
        ,{" "}
        {new Date(row.getValue("createdAt")).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // Para mostrar el formato 24 horas
        })}
      </span>
    ),
  },

  {
    id: "diasFalla",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Días de requerimiento" />
    ),
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const today = new Date();
      const diffInDays = Math.floor(
        (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        <span className="max-w-[100px] flex items-center justify-center  text-sm font-semibold text-center">
          {diffInDays} días
        </span>
      );
    },
  },
  // {
  //   accessorKey: "updatedAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Última Actualización" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="max-w-[100px] text-sm  font-semibold truncate ">
  //       {new Date(row.getValue("updatedAt")).toLocaleDateString("es-ES", {
  //         year: "numeric",
  //         month: "2-digit",
  //         day: "2-digit",
  //       })}
  //       ,{" "}
  //       {new Date(row.getValue("updatedAt")).toLocaleTimeString("es-ES", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: false, // Para mostrar el formato 24 horas
  //       })}
  //     </span>
  //   ),
  // },
];
