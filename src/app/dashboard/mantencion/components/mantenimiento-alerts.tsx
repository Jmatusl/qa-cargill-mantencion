"use client";

import { useState, useEffect } from "react";
import { useGetMaintenanceStats } from "@/hooks/UseQueriesMaintenance";
import { useSession } from "next-auth/react";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "sonner";
import { ClockIcon, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsComplinance } from "./feed/EventsComplinance";

// Definición de tipos para las notificaciones
interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string; // Puedes cambiarlo a Date si es un objeto Date
  status: string;
}

export function MantenimientoAlertas() {
  const { data: session, status: sessionStatus } = useSession();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Configura el userId una vez que la sesión esté disponible
    if (sessionStatus === "authenticated" && session?.user) {
      setUserId((session.user as any).id);
    }
  }, [session, sessionStatus]);

  const {
    data: maintenanceStats,
    isLoading: isLoadingMaintenance,
    isSuccess: isSuccessMaintenance,
    isError: isErrorMaintenance,
  } = useGetMaintenanceStats(userId);

  useEffect(() => {
    if (isErrorMaintenance) {
      toast.error("Error al obtener las estadísticas de mantenimiento");
    }
  }, [isErrorMaintenance]);

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      title: "Requerimientos Solicitados",
      description: "Requerimientos en estado de 'Solicitadas'",
      icon: <Scroll className="h-6 w-6 text-blue-500" />,
      value: maintenanceStats?.fallasSolicitadas,
    },
    {
      title: "Requerimiento en Proceso",
      description: "Requerimientos en estado de 'En Proceso'",
      icon: <ClockIcon className="h-6 w-6 text-yellow-500" />,
      value: maintenanceStats?.fallasEnProceso,
    },
    {
      title: "Requerimientos Vencidos",
      description: "Requerimientos que han vencido",
      icon: <ClockIcon className="h-6 w-6 text-red-500" />,
      value: maintenanceStats?.fallasVencidas,
    },
    {
      title: "Requerimientos Completados",
      description: "Requerimientos completados (últimos 30 días)",
      icon: <ClockIcon className="h-6 w-6 text-green-500" />,
      value: maintenanceStats?.fallasFinalizadas,
    },
  ];

  return (
    <div className="flex flex-col  sm:p-4 md:p-6 md:space-y-6">
      <main className="flex-1 overflow-auto">
        <div className="grid gap-4">
          {/* Vista escritorio */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col bg-white border rounded-md shadow-md overflow-hidden"
              >
                {/* Área superior: fondo azul que cubre desde el borde superior */}
                <div className="bg-[#284893] p-4 flex flex-col items-start justify-center">
                  <div className="flex items-center gap-2">
                    {/* Ícono dentro de un círculo */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                      {stat.icon}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-100">{stat.title}</h2>
                  </div>
                </div>


                {/* Área inferior: descripción y valores */}
                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-500">{stat.description}</p>
                  <div className="mt-auto">
                    <span className="text-2xl font-bold">
                      {isLoadingMaintenance || !isSuccessMaintenance ? (
                        <ThreeDots
                          height={40}
                          width={40}
                          color="rgba(64, 64, 64, 0.8)"
                        />
                      ) : (
                        stat.value
                      )}
                    </span>
                  </div>
                </div>
              </div>

            ))}
          </div>

          {/* Vista móvil */}
          <div className="md:hidden flex items-center justify-between bg-[#284893] border rounded-md shadow-sm p-4">
  {stats.map((stat, index) => (
    <div key={index} className="flex items-center gap-4">
      {/* Ícono con color blanco */}
      <div className="text-gray-100">{stat.icon}</div>
      {/* Valor */}
      <span className="text-lg font-bold text-white">
        {isLoadingMaintenance || !isSuccessMaintenance ? (
          <ThreeDots
            height={20}
            width={20}
            color="rgba(255, 255, 255, 0.8)"
          />
        ) : (
          stat.value
        )}
      </span>
    </div>
  ))}
</div>

        </div>

        {/* Sección de eventos y cumplimientos */}
        <div className="mt-2 md:mt4">
          {" "}
          <EventsComplinance />
        </div>
      </main>
    </div>
  );
}
