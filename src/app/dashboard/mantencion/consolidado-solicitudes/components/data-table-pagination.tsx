import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileX } from "lucide-react";
import { exportToExcel } from "@/libs/excelExport";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const handleSelectAll = () => {
    table.getPreFilteredRowModel().rows.forEach((row) => {
      table.setRowSelection((prev) => ({
        ...prev,
        [row.id]: true,
      }));
    });
  };

  const handleDeselectAll = () => {
    table.getPreFilteredRowModel().rows.forEach((row) => {
      table.setRowSelection((prev) => ({
        ...prev,
        [row.id]: false,
      }));
    });
  };

  const handleExportToExcel = async () => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    await exportToExcel(
      selectedRows,
      "/format.xlsx",
      "Consolidado_Mantencion.xlsx"
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between px-2 gap-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} filas(s) seleccionadas.
        </div>
        <Button
          variant="outline"
          onClick={handleSelectAll}
          className="h-8 px-2 lg:px-3"
        >
          Seleccionar Todo
        </Button>
        <Button
          variant="outline"
          onClick={handleDeselectAll}
          className="h-8 px-2 lg:px-3"
        >
          Deseleccionar Todo
        </Button>
        <Button
          variant="outline"
          onClick={handleExportToExcel}
          className="h-8 px-2 lg:px-3"
        >
          Exportar a Excel
          <FileX className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir a la primera página</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir a la siguiente página</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir a la última página</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
