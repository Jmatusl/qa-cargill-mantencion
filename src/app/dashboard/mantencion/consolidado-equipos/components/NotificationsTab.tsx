import React from "react";
import { useGetNotificationByEquipment } from "@/hooks/useQueriesEquipment";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BellIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FolderSyncIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";

type NotificationType =
  | "RESPONSIBLE_CHANGED"
  | "STATUS_CHANGED"
  | "NEW_REQUEST"
  | "ESTIMATED_DATES_CHANGED"
  | "COMPLETED"
  | "OVERDUE"
  | "RECENTLY_COMPLETED"
  | "ADD_COMMENT";

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
  ADD_COMMENT: {
    icon: BellIcon,
    color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function NotificationsTab({ equipmentId }: { equipmentId: number }) {
  const {
    data: notifications,
    isLoading,
    isError,
    isFetching,
  } = useGetNotificationByEquipment(equipmentId);

  return (
    <div className="flex flex-col max-h-full overflow-hidden">
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 h-[600px]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {/* Contenedor scrolleable */}
            <ScrollArea className="h-[600px] rounded-md overflow-y-auto">
              {notifications.map((notification: any) => {
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
                    className="flex items-center gap-4 p-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className={`rounded-lg p-2 ${color}`}>
                      <button
                        disabled={true}
                        onClick={() => console.log(notification)}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Grupo: {notification.notificationGroup.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No hay notificaciones recientes.
          </p>
        )}
      </CardContent>
    </div>
  );
}

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
