"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ships, statuses } from "../data/data";

// Corrección de la visualización de la hora
const es = new Intl.DateTimeFormat("es-ES", {
  hour: "numeric",
  hour12: false,
  minute: "numeric",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "America/Santiago",
});
const esOnlyDate = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "America/Santiago",
});

export const columns: ColumnDef<any>[] = [
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
    header: () => <span>Acciones</span>, // Aquí se define solo el título
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <DataTableRowActions row={row} />
      </div>
    ),
  },
  {
    accessorKey: "folio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Folio" />
    ),
    cell: ({ row }) => <div>{row.getValue("folio")}</div>,
  },
  {
    accessorKey: "equipment.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre del Equipo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>{row.original.equipment?.name}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.equipment?.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
  {
    accessorKey: "equipment.subarea",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sistema" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>{row.original.equipment?.subarea}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.equipment?.subarea}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "faultType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Requerimiento" />
    ),
    cell: ({ row }) => <div>{row.getValue("faultType")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Ingreso" />
    ),
    cell: ({ row }) => (
      <div>{es.format(new Date(row.getValue("createdAt")))}</div>
    ),
  },
  {
    accessorKey: "ship.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instalación" />
    ),
    cell: ({ row }) => {
      const ship = ships.find(
        (ship) => ship.value === row.getValue("ship_name")
      );
      return (
        <div className="max-w-[200px] truncate font-medium">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>{ship?.label}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{ship?.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "responsible.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resposable:" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.responsible ? row.original.responsible.name : "N/A"}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
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
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "diasTranscurridos",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dias Requerimiento" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {(row.getValue("diasTranscurridos") as number).toString()}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "estimatedSolutions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Estimada" />
    ),
    cell: ({ row }) => {
      const isExpanded = row.getIsExpanded();
      const dates = (row.original as any).estimatedSolutions;
      const hasMultipleEstimatedDates = dates.length > 1;
      return (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            {hasMultipleEstimatedDates && (
              <button
                onClick={() => row.toggleExpanded()}
                className="text-white rounded-full border dark:border-slate-200 border-slate-700 h-6 w-6 flex items-center justify-center focus:outline-none"
                aria-label="Expand estimated dates"
              >
                {isExpanded ? (
                  <div className="flex items-center justify-center text-xs font-bold text-black dark:text-white">
                    -
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-xs text-black dark:text-white">
                    {dates.length.toString()}
                  </div>
                )}
              </button>
            )}
            <span className="max-w-[350px] text-sm truncate font-medium">
              {dates[0]?.date
                ? esOnlyDate.format(new Date(dates[0].date))
                : "N/A"}
            </span>
          </div>
          {isExpanded && hasMultipleEstimatedDates && (
            <div className="pl-4 space-y-1 mt-1">
              {dates.slice(1).map((date: any, index: number) => (
                <div
                  key={index}
                  className="text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {esOnlyDate.format(new Date(date.date))}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
