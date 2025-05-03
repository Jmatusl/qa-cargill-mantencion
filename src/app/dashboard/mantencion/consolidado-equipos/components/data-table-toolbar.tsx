"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/tangstackTable/data-table-view-options";

import { priorities, ships, statuses } from "../data/data";
import { DataTableFacetedFilter } from "@/components/tangstackTable/data-table-faceted-filter";
import { UserIcon } from "lucide-react";


interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const column = table.getColumn("subarea");
  const facets = column?.getFacetedUniqueValues();

  // console.log("facets", facets);

  const systemOptions = Array.from(facets?.keys() ?? []).map((system) => ({
    label: system,
    value: system,
  }));

  const responsibleColimn = table.getColumn("responsibleName");
  const responsibleFacets = responsibleColimn?.getFacetedUniqueValues();
  const responsibleOptions = Array.from(responsibleFacets?.keys() ?? []).map(
    (responsible) => ({
      icon: UserIcon,
      label: responsible,
      value: responsible,
    })
  );
  // console.log("systemOptions", systemOptions);
  const isFiltered = table.getState().columnFilters.length > 0;

  // Definir opciones para el filtro de activo
  const activeOptions = [
    { label: "Activo", value: "true" },
    { label: "Inactivo", value: "false" },
  ];
  // console.log("table.getColumn('status')", table.getColumn("status"));
  // console.log("renderizxandon el componente toolbar");
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Nombre del Equipo"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("responsibleName") && (
          <DataTableFacetedFilter
            column={table.getColumn("responsibleName")}
            title="Filtro de Responsable"
            options={responsibleOptions}
          />
        )}
        {table.getColumn("shipName") && (
          <DataTableFacetedFilter
            column={table.getColumn("shipName")}
            title="Filtro de Instalación"
            options={ships}
          />
        )}
        {table.getColumn("subarea") && (
          <DataTableFacetedFilter
            column={table.getColumn("subarea")}
            title="Filtro de Sistema"
            options={systemOptions}
          />
        )}
        {table.getColumn("active") && (
          <DataTableFacetedFilter
            column={table.getColumn("active")}
            title="Estado"
            options={activeOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
