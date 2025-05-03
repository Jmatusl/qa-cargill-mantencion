import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPendingMaintenanceRequests } from "@/hooks/UseQueriesMaintenance";
import { useGetNotificationsNested } from "@/hooks/useQueriesNotifications";
import {
  BellIcon,
  UserIcon,
  FolderSyncIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  Loader2Icon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import MaintenanceRequestForm from "@/app/dashboard/mantencion/consolidado-solicitudes/components/ContentModal";

type NotificationType =
  | "RESPONSIBLE_CHANGED"
  | "STATUS_CHANGED"
  | "NEW_REQUEST"
  | "ESTIMATED_DATES_CHANGED"
  | "COMPLETED"
  | "OVERDUE"
  | "RECENTLY_COMPLETED";

const notificationIconMapping: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  RESPONSIBLE_CHANGED: {
    icon: UserIcon,
    color: "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400",
  },
  STATUS_CHANGED: {
    icon: FolderSyncIcon,
    color:
      "bg-orange-100 text-orange-500 dark:bg-orange-900 dark:text-orange-400",
  },
  NEW_REQUEST: {
    icon: BellIcon,
    color:
      "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-400",
  },
  ESTIMATED_DATES_CHANGED: {
    icon: CalendarIcon,
    color:
      "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-400",
  },
  COMPLETED: {
    icon: CheckIcon,
    color: "bg-green-200 text-green-600 dark:bg-green-900 dark:text-green-500",
  },
  OVERDUE: {
    icon: ClockIcon,
    color: "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400",
  },
  RECENTLY_COMPLETED: {
    icon: TrophyIcon,
    color:
      "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-400",
  },
};

export function EventsComplinance() {
  const {
    data: notificationsNested,
    isLoading: isLoadingNotificationsNested,
    isFetching: isFetchingNotificationsNested,
    isError: isErrorNotificationsNested,
    hasNextPage: hasNextPageNotificationsNested,
    fetchNextPage: fetchNextPageNotificationsNested,
  } = useGetNotificationsNested();

  const {
    data: pendingMaintenanceRequests = [],
    isLoading: isLoadingPendingRequests,
  } = useGetPendingMaintenanceRequests();

  // console.log("pendingMaintenanceRequests", pendingMaintenanceRequests);

  const flatmapNotifications = notificationsNested?.pages.flatMap(
    (page) => page.data
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (hasNextPageNotificationsNested && !isLoadingMore) {
      setIsLoadingMore(true);
      await fetchNextPageNotificationsNested();
      setIsLoadingMore(false);
    }
  };

  const SkeletonCard = () => (
    <div className="flex items-center gap-4 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Últimos Eventos */}
      <Card className="p-2 md:p-4">
        <CardHeader>
          <CardTitle>Últimos Eventos</CardTitle>
        </CardHeader>

        <ScrollArea className="h-[400px] rounded-md">
          <CardContent>
            {isLoadingNotificationsNested ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : notificationsNested &&
              flatmapNotifications &&
              flatmapNotifications.length > 0 ? (
              <div className="space-y-2">
                {flatmapNotifications.map((notification: any) => {
                  const { icon: Icon, color } = notificationIconMapping[
                    notification.type as NotificationType
                  ] || {
                    icon: BellIcon,
                    color:
                      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                  };
                  return (
                    <div
                      key={notification.id}
                      className="flex items-center gap-4"
                    >
                      <div className={`rounded-lg p-2 ${color}`}>
                        <Modal
                          trigger={
                            <button
                              onClick={() => console.log(notification)}
                              className="flex items-center justify-center w-full h-full"
                            >
                              <Icon className="h-5 w-5" />
                            </button>
                          }
                          data={notification.maintenanceRequest}
                        >
                          <MaintenanceRequestForm setOpen={() => {}} />
                        </Modal>
                      </div>
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No hay notificaciones recientes.
              </p>
            )}
            {hasNextPageNotificationsNested && (
              <div
                className="cursor-pointer rounded-md bg-gray-100 p-4 mt-2 text-center text-sm text-blue-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={handleLoadMore}
              >
                {isLoadingMore ? (
                  <div className="flex justify-center">
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                    <span className="ml-2">Cargando más...</span>
                  </div>
                ) : (
                  <span>Cargar más notificaciones</span>
                )}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Próximos Cumplimientos */}
      <Card className="p-2 md:p-4">
        <CardHeader>
          <CardTitle>Próximos Cumplimientos</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[400px] rounded-md">
          <CardContent>
            {isLoadingPendingRequests ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : pendingMaintenanceRequests.length > 0 ? (
              <div className="space-y-2">
                {pendingMaintenanceRequests.map((request: any) => {
                  const isOverdue = request.daysRemaining < 0;
                  const isToday = request.daysRemaining === 0;
                  const isUpcoming = request.daysRemaining > 0;

                  const iconColor = isOverdue
                    ? "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400"
                    : isToday
                    ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400";

                  return (
                    <div key={request.id} className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${iconColor}`}>
                        <ClockIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {request.faultType} en{" "}
                          {request.equipment?.name || "Equipo desconocido"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isOverdue
                            ? `${Math.abs(request.daysRemaining)} días vencidos`
                            : isToday
                            ? "Vence hoy"
                            : `${request.daysRemaining} días restantes`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Folio: {request.folio} |{" "}
                          {request.equipment?.subarea || "Sistema desconocido"}{" "}
                          | {request.ship?.name || "Instalación Desconocida"} |{" "}
                          Responsable:{" "}
                          {request.responsible?.user?.username || "Desconocido"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No hay solicitudes pendientes.
              </p>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
