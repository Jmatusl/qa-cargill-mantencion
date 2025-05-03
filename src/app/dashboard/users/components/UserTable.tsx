import React, { useMemo, useState, useEffect } from "react";
import { useReactTable, ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, ColumnFiltersState, getSortedRowModel, SortingState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Role } from "@prisma/client";
import RoleFilter from "./RoleFilter";
import Link from "next/link";
import { Undo2 } from "lucide-react";

interface UserRole {
  role: Role;
}

export type UserType = User & {
  roles: UserRole[];
};

interface UserTableProps {
  data: UserType[];
  columns: ColumnDef<UserType, any>[];
}

// Función para filtrar roles duplicados
const removeDuplicateRoles = (users: UserType[]): UserType[] => {
  return users.map((user) => {
    const uniqueRoles = Array.from(new Map(user.roles.map((role) => [role.role.id, role])).values());
    return {
      ...user,
      roles: uniqueRoles,
    };
  });
};

const UserTable: React.FC<UserTableProps> = ({ data, columns }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Preprocesar datos para eliminar roles duplicados
  const processedData = useMemo(() => removeDuplicateRoles(data), [data]);

  // Actualizar los filtros de columna cuando cambian los roles seleccionados
  useEffect(() => {
    setColumnFilters((prev) => {
      const otherFilters = prev.filter((filter) => filter.id !== "roles");
      if (selectedRoles.length > 0) {
        return [...otherFilters, { id: "roles", value: selectedRoles }];
      }
      return otherFilters;
    });
  }, [selectedRoles]);

  // Obtener todos los roles únicos de los datos
  const allRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    processedData.forEach((user) => {
      user.roles.forEach((role) => {
        rolesSet.add(role.role.name);
      });
    });
    return Array.from(rolesSet);
  }, [processedData]);

  const table = useReactTable({
    data: processedData,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      roleFilterFn: (row, columnId, filterValue) => {
        const rowRoles = row.getValue(columnId) as UserRole[];
        return filterValue.length === 0 || rowRoles.some((role) => filterValue.includes(role.role.name));
      },
    },
  });

  return (
    <div>
      {/* Buscador y Filtro de Roles */}
      <div className="my-4">
        <Input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="mb-4"
        />
        <RoleFilter
          roles={allRoles}
          selectedRoles={selectedRoles}
          onChange={setSelectedRoles}
        />
      </div>

      {/* Tabla */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.column.getCanSort() ? "cursor-pointer" : ""}`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (header.column.getIsSorted() === "asc" ? <span className="ml-1">🔼</span> : header.column.getIsSorted() === "desc" ? <span className="ml-1">🔽</span> : <span className="ml-1 opacity-50">↕️</span>)}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex w-full justify-between">
          <div>
            <Link href="/dashboard/mantencion">
              <Button>
                <Undo2 />
                Regresar
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
        <div className="w-48 pl-5">
          <span>
            Página{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
