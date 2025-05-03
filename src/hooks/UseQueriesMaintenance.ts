import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryObserverResult,
} from "@tanstack/react-query";
import {
  getMaintenanceList,
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  updateMaintenanceRequest,
  getOpenedMaintenanceRequests,
  getOpenedAndInProgressMaintenanceRequests,
  getMaintenanceById,
  getMaintenanceStats,
  getPendingMaintenanceRequests,
  addActionTakenLog,
  getActionTakenLogs,
  deleteActionTakenLog,
} from "../actions/maintenanceAction";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  ActionsTakenLog,
  ActionsTakenLogDto,
} from "@/types/MaintenanceRequestType";
import { getResponsibleList } from "@/actions/responsibleActions";

export const useGetMaintenanceList = (userSession: any, statuses: string[]) => {
  return useQuery<any>({
    queryKey: ["maintenanceList", userSession, statuses],
    queryFn: async () => await getMaintenanceList(statuses, userSession),
    staleTime: 1000 * 60 * 5,
  });
};

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => await createMaintenanceRequest(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceList"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["openedMaintenanceRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["openedAndInProgressMaintenanceRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceStats"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["notificationsNested"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["pendingMaintenanceRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["equipment"],
      });
    },
  });
}

export const useDeleteMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => await deleteMaintenanceRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceList"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceStats"],
      });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const { data: session, status } = useSession();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Prisma.MaintenanceRequestUpdateInput & { id: number }
    ) => await updateMaintenanceRequest(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceList"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["openedMaintenanceRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["openedAndInProgressMaintenanceRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["maintenanceStats"],
      });
      // await queryClient.invalidateQueries({
      //   queryKey: ["maintenance"],
      // });
      await queryClient.refetchQueries({ queryKey: ["maintenance"] });
      await queryClient.refetchQueries({
        queryKey: ["maintenanceStats"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["notificationsNested"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["pendingMaintenanceRequests"],
      });
      toast.success("Solicitud de mantenimiento actualizada correctamente");
    },
    onError: (error) => {
      console.error(
        "Error al actualizar la solicitud de mantenimiento:",
        error
      );
      toast.error("Error al actualizar la solicitud de mantenimiento");
    },
  });
};

export const useGetResponsibles = () => {
  return useQuery<any>({
    queryKey: ["responsibles"],
    queryFn: async () => await getResponsibleList(),
    staleTime: 1000 * 60 * 10, // 5 minutos
  });
};

export const useGetOpenedMaintenanceRequests = (ship: string) => {
  return useQuery<any>({
    queryKey: ["openedMaintenanceRequests", ship],
    queryFn: async () => await getOpenedMaintenanceRequests(ship),

    enabled: !!ship,
  });
};

export const useGetOpenedAndInProgressMaintenanceRequests = (
  id: number | null
) => {
  const { data, isLoading, isFetching, isError, isSuccess } = useQuery<any>({
    queryKey: ["openedAndInProgressMaintenanceRequests", id],
    queryFn: async () =>
      await getOpenedAndInProgressMaintenanceRequests(id as number),

    enabled: !!id,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    isSuccess,
  };
};

export const useGetMaintenanceById = (id: number, responsibleId: number) => {
  return useQuery<any>({
    queryKey: ["maintenance", id, responsibleId],
    queryFn: async () => await getMaintenanceById(id, responsibleId),
  });
};

export const useGetMaintenanceStats = (id: number | null) => {
  return useQuery<any>({
    queryKey: ["maintenanceStats", id],
    queryFn: async () => await getMaintenanceStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id,
  });
};

export const useGetPendingMaintenanceRequests = () => {
  return useQuery<any>({
    queryKey: ["pendingMaintenanceRequests"],
    queryFn: async () => await getPendingMaintenanceRequests(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useGetActionTakenLogs = (
  id: number
): QueryObserverResult<ActionsTakenLogDto> => {
  // const { data: session, status: sessionStatus } = useSession();
  return useQuery({
    queryKey: ["actionTakenLogs", id],
    queryFn: async () => await getActionTakenLogs(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id,
  });
};

export const useAddActionTakenLog = (id: number) => {
  const { data: session, status: sessionStatus } = useSession();

  const queryClient = useQueryClient();
  // if (!session || !sessionStatus) {
  //   return useMutation({
  //     mutationFn: async () => {
  //       throw new Error("No se encontró la sesión del usuario");
  //     },
  //     onError: (error) => {
  //       console.error("Error al agregar el log de acción:", error);
  //     },
  //   });
  // }
  return useMutation({
    mutationFn: async (data: Omit<ActionsTakenLog, "id">) =>
      await addActionTakenLog(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["actionTakenLogs", id],
      });
      await queryClient.refetchQueries({ queryKey: ["actionTakenLogs"] });
      await queryClient.invalidateQueries({
        queryKey: ["notificationsNested"],
      });
    },
    onError: (error) => {
      console.error("Error al agregar el log de acción:", error);
    },
  });
};

export const useDeleteActionTakenLog = (id: number, logId: number) => {
  const { data: session, status: sessionStatus } = useSession();

  const queryClient = useQueryClient();
  // if (!session || !sessionStatus) {
  //   return useMutation({
  //     mutationFn: async () => {
  //       throw new Error("No se encontró la sesión del usuario");
  //     },
  //     onError: (error) => {
  //       console.error("Error al agregar el log de acción:", error);
  //     },
  //   });

  // }

  return useMutation({
    mutationFn: async ({ id, logId }: { id: number; logId: number }) =>
      await deleteActionTakenLog(id, logId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["actionTakenLogs", id],
      });
      await queryClient.refetchQueries({ queryKey: ["actionTakenLogs"] });
    },
    onError: (error) => {
      console.error("Error al agregar el log de acción:", error);
    },
  });
};
