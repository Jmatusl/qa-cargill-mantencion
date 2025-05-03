"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FlatEquipment } from "../data/schema";
import { DataTableColumnHeader } from "@/components/tangstackTable/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { priorities, statuses, ships, responsibles } from "../data/data";
import { fi } from "date-fns/locale";
import { UserIcon } from "lucide-react";

export const columns: ColumnDef<FlatEquipment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] ml-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre del Equipo" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "area",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Area" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {row.getValue("area")}
      </span>
    ),
  },
  {
    accessorKey: "subarea",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sistema" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {row.getValue("subarea")}
      </span>
    ),
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Estado" />
  //   ),
  //   cell: ({ row }) => {
  //     const status = statuses.find(
  //       (status) => status.value === row.getValue("status")
  //     );

  //     if (!status) {
  //       return null;
  //     }

  //     return (
  //       <div className="flex w-[100px] items-center">
  //         {status.icon && (
  //           <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{row.getValue("status")}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  {
    accessorKey: "responsibleName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[150px] items-center">
          <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />

          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("responsibleName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // {
  //   accessorKey: "responsibleEmail",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Responsible Email" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="max-w-[500px] truncate font-medium">
  //       {row.getValue("responsibleEmail")}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "shipName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre de la Instalación" />
    ),
    cell: ({ row }) => {
      const ship = ships.find(
        (ship) => ship.value === row.getValue("shipName")
      );
      if (!ship) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {ship.icon && (
            <ship.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="max-w-[500px] truncate font-medium">
            {ship.label}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("active");
      return (
        <Badge
          variant={isActive ? "destructive" : "secondary"}
          className={`px-2 py-1 rounded-full font-medium transition-colors ${
            isActive
              ? "bg-green-100 text-green-700 hover:bg-blue-100 hover:text-blue-700"
              : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (value.includes("true")) return row.getValue(id) === true;
      if (value.includes("false")) return row.getValue(id) === false;
      return true;
    },
    enableSorting: true,
    enableHiding: true, // Permite ocultar la columna si no deseas mostrarla
  },
  /*   {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {new Date(row.getValue("updatedAt")).toLocaleDateString()}
      </span>
    ),
  }, */
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
