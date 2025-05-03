"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import useWindowSize from "@/hooks/useWindowSize";
import { DataTableViewOptions } from "@/components/tangstackTable/data-table-view-options";

interface DataTableProps<TData, TValue, TExtraData> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue, any>) {
  const [rowSelection, setRowSelection] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      // PRODUCTO: false, // Ocultar la columna "PRODUCTO" por defecto
      // LOTE: false,
      // ESPECIFICACION: false,
      // VERSION: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const [width, height] = useWindowSize();
  const scrollAreaHeight = `calc(${height}px - 250px)`;

  // Verificar si hay algún filtro aplicado
  const hasFiltersApplied = columnFilters.length > 0;

  // Función para manejar la selección de la fila
  const handleRowClick = (row: any) => {
    const isSelected = rowSelection[row.id];

    // Solo permitir que un elemento esté seleccionado a la vez
    const newSelection = { [row.id]: !isSelected };

    setRowSelection(newSelection);

    // if (!isSelected) {
    //   console.log("Elemento seleccionado:", row.original);
    //   // setSelectedTecnicaAnalisis(row.original);
    // }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        {/* <DataTableViewOptions table={table} /> */}
        <div className="rounded-md border border-gray-300 dark:border-gray-700">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="border-b border-gray-300 dark:border-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-slate-10 dark:hover:bg-slate-600 text-xs"
                    // Al hacer clic en la fila, se selecciona
                    onClick={() => handleRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                  >
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
