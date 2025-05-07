"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { TailSpin } from "react-loader-spinner";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetMaintenanceList } from "@/hooks/UseQueriesMaintenance";
import { SkeletonTable } from "../../components/SkeletonTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DataTableConsolidadoMobile from "./DataTableConsolidadoMobile";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRole {
  userId: number;
  roleId: number;
  role: Role;
}

export function ResultTable() {
  const { data: session, status } = useSession();
  const [userSession, setUserSession] = useState<any>(null);

  // Estado para controlar el switch
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  // Determinar los estados a mostrar según el switch
  const statuses = showAllStatuses ? ["SOLICITADO", "EN_PROCESO", "COMPLETADO", "CANCELADO"] : ["SOLICITADO", "EN_PROCESO"];

  console.log("Estados filtrados:", statuses);

  const { data, isFetching, error } = useGetMaintenanceList(userSession, statuses);

  console.log("Datos obtenidos de la API:", data);

  const [dataConDiasTranscurridos, setDataConDiasTranscurridos] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Utilizamos useMemo para obtener los datos del usuario
  const userData = useMemo(() => {
    if (status === "authenticated" && session?.user) {
      setUserSession(session.user);
      console.log("Sesión de usuario:", session.user);
      return session.user as any;
    }
    return null;
  }, [session, status]);

  // Comprobamos los permisos del usuario
  useEffect(() => {
    if (userData) {
      console.log("Roles del usuario:", userData.roles);
      const isNaveOnly = userData.roles.length === 1 && userData.roles[0].role.id === 4;
      setHasPermission(isNaveOnly);
      console.log("¿Tiene permiso restringido?", isNaveOnly);
    }
  }, [userData]);

  useEffect(() => {
    if (data) {
      const dataConDiasTranscurridos = data.map((item: any) => {
        // Validar fechas
        const fechaActual = item.status === "COMPLETADO" && item.realSolution ? new Date(item.realSolution) : new Date();

        const fechaProp = item.createdAt ? new Date(item.createdAt) : null;

        if (isNaN(fechaActual.getTime()) || !fechaProp || isNaN(fechaProp.getTime())) {
          console.warn("Fecha inválida en item:", item);
          return {
            ...item,
            diasTranscurridos: null,
          };
        }

        // Calcular diferencia en días
        const diferenciaEnMilisegundos = fechaActual.getTime() - fechaProp.getTime();
        const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
        const diferenciaEnDias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);

        return {
          ...item,
          diasTranscurridos: diferenciaEnDias,
        };
      });

      console.log("Datos con días transcurridos:", dataConDiasTranscurridos);

      // Filtrar datos según permisos
      if (hasPermission && userData) {
        const ship = dataConDiasTranscurridos.filter((item: any) => item.ship?.name === userData.username);
        console.log("Datos filtrados por usuario con restricción:", ship);
        setDataConDiasTranscurridos(ship);
      } else {
        setDataConDiasTranscurridos(dataConDiasTranscurridos);
      }
    }
  }, [data, hasPermission, userData]);

  if (error) {
    console.error("Error al cargar los datos:", error);
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Error al cargar los datos.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-full flex-1 flex-col space-y-8 p-2 md:p-8 overflow-x-auto bg-gray-100 dark:bg-slate-800 border rounded-md">
        <div className="">
          <div>
            <h2 className="text-sm md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Consolidado de Solicitudes de Mantención</h2>
            <p className=" text-sm md:text-lg  text-muted-foreground text-gray-700 dark:text-gray-300">Listado de todas las solicitudes de mantención y su estado actual.</p>
          </div>
          <div className="flex items-center space-x-2 justify-end md:-mt-8 ">
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
            <Label
              htmlFor="statusSwitch"
              className="text-gray-900 dark:text-white text-xs md:text-lg"
            >
              Mostrar completados y cancelados
            </Label>
            <Switch
              id="statusSwitch"
              checked={showAllStatuses}
              onCheckedChange={setShowAllStatuses}
              className="bg-gray-200 dark:bg-gray-700"
            />
          </div>
        </div>

        {!data ? (
          <>
            <SkeletonTable />
          </>
        ) : data && data.length > 0 ? (
          <div>
            <div className="block md:hidden">
              <DataTableConsolidadoMobile dataConDiasTranscurridos={dataConDiasTranscurridos} />
            </div>
            <div className="hidden md:block">
              <DataTable
                data={dataConDiasTranscurridos}
                columns={columns}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">No se encontraron resultados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
