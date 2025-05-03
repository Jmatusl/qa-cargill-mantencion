"use client";

import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { priorities, statuses, ships } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useShipStore } from "@/store/shipStore";
import { TextIcon, UserIcon } from "lucide-react";

import { useSession } from "next-auth/react";
//import ExportToPDF from "./ExportToPDF"; // Import the export component

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const sessionRol = (useSession().data?.user as any)?.roles ?? [];
  const isNave = sessionRol.some((role: any) => role.roleId === 4);

  const isFiltered = table.getState().columnFilters.length > 0;
  // const ships = useShipStore((state) => state.ships);
  //const responsibles = useResponsibleStore((state) => state.responsibles);
  const [selectedData, setSelectedData] = React.useState<TData[]>([]); // State for selected data

  const shipOptions = ships.map((ship) => ({
    value: ship.value,
    label: ship.label,
    icon: ship.icon,
  }));
  const responsibleColumn = table.getColumn("responsible_name");
  const responsiblesFacets = responsibleColumn?.getFacetedUniqueValues();

  const responsibleOptions = Array.from(responsiblesFacets?.keys() ?? []).map(
    (responsible) => ({
      value: responsible,
      label: responsible,
      icon: UserIcon,
    })
  );

  const statusColumn = table.getColumn("status");
  const statusFacets = statusColumn?.getFacetedUniqueValues();

  const statusOptions = Array.from(statusFacets?.keys() ?? []).map((status) => {
    const match = statuses.find((s) => s.value === status);
    return match
      ? {
          value: match.value,
          label: match.label,
          icon: match.icon,
        }
      : {
          value: status,
          label: status,
          icon: UserIcon, // Icono predeterminado si no hay coincidencia
        };
  });
  //console.log("responsibleOptions", responsibleOptions);

  const colum = table.getColumn("faultType");
  const facets = colum?.getFacetedUniqueValues();

  const faultTypeOptions = Array.from(facets?.keys() ?? []).map(
    (faultType) => ({
      label: faultType,
      value: faultType,
    })
  );

  const systemColumn = table.getColumn("equipment_subarea");
  const systemFacets = systemColumn?.getFacetedUniqueValues();

  const systemOptions = Array.from(systemFacets?.keys() ?? []).map(
    (system) => ({
      label: system,
      value: system,
    })
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar nombre de equipo..."
          value={
            (table.getColumn("equipment_name")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("equipment_name")
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("faultType") && (
          <DataTableFacetedFilter
            column={table.getColumn("faultType")}
            title="Tipo de Requerimiento"
            options={faultTypeOptions}
          />
        )}
        {table.getColumn("equipment_subarea") && (
          <DataTableFacetedFilter
            column={table.getColumn("equipment_subarea")}
            title="Sistema"
            options={systemOptions}
          />
        )}
        {!isNave && table.getColumn("ship_name") && (
          <DataTableFacetedFilter
            column={table.getColumn("ship_name")}
            title="Instalación"
            options={shipOptions}
          />
        )}
        {table.getColumn("responsible_name") && (
          <DataTableFacetedFilter
            column={table.getColumn("responsible_name")}
            title="Responsable"
            options={responsibleOptions}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={statusOptions} // Usar las opciones dinámicas
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
      {/* {selectedData.length > 0 && (
        <Button variant="outline" className="h-8 px-2 lg:px-3">
          <TextIcon className="mr-2 h-4 w-4" />
          Exportar a PDF
        </Button>
      )} */}
    </div>
  );
}
