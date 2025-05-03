"use client";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetFlatEquipmentList } from "@/hooks/useQueriesEquipment";
import { TailSpin } from "react-loader-spinner";
import useUserRoles from "@/hooks/useUserRoles";
import NoPermission from "@/components/NoPermission";
import { SkeletonTable } from "../../components/SkeletonTable";
import { useRouter } from "next/navigation";

export function EquipmentTable() {
  const { data, isLoading, isError, isFetching } = useGetFlatEquipmentList();
  const router = useRouter();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Error al cargar los datos.
          </p>
        </div>
      </div>
    );
  }

  const { isAllowed: isAllowedUser } = useUserRoles([1, 2, 3, 4, 5, 6, 7, 8]); // Permisos generales
  const { isAllowed: isAdmin } = useUserRoles([3, 4, 7, 8]); // Permiso de administrador

  if (!isAllowedUser) {
    return <NoPermission />;
  }

  return (
    <div>
      <div className="flex h-full flex-1 flex-col space-y-8 p-8 overflow-x-auto bg-gray-100 dark:bg-slate-800 border rounded-md">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Maestro de Equipos
            </h2>
            <p className="text-muted-foreground text-gray-700 dark:text-gray-300">
              Listado de todos los equipos y su estado actual.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TailSpin
              visible={isFetching}
              height="30"
              width="30"
              color="#0000FF"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
            />
            {/* Botón Crear Equipo */}
            {isAdmin && (
              <button
                onClick={() =>
                  router.push("/dashboard/mantencion/consolidado-equipos/new")
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
              >
                Crear Equipo
              </button>
            )}
          </div>
        </div>
        {data && data.length > 0 ? (
          <DataTable data={data} columns={columns} />
        ) : isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                No se encontraron resultados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
