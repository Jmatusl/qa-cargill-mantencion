import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createGeneratedNotification,
  getGeneratedNotifications,
  getUsersInNotificationGroup,
  getNotificationGroups,
  createNotificationGroup,
  createNotificationGroupRole,
  getAllRolesWithNotificationSettings,
  getGeneratedNotificationsNested,
  getAllNotificattionByMaintenance,
  updateNotificationSettings,
  getNotificationGroupsByRole,
  enableEmailNotification,
} from "@/actions/notificationActions";
import { useSession } from "next-auth/react";
import { getUserRoles } from "@/actions/UserActions";
import { updateUserRoles, deleteUser, updateUserVerification } from '@/actions/UserActions';
import { toast } from "sonner";
import { TableRowsSplit } from "lucide-react";




interface UserData {
  id?: number;
  username: string;
  email: string;
  password?: string;
  roles: RoleData[];
}
interface RoleData {
  role: {
    name: string;
  };
}

type UserDataWithoutPassword = Omit<UserData, "password"> & { id: number };

// Interfaces para mejor verificación de tipos en TypeScript
interface GeneratedNotification {
  id: number;
  maintenanceRequestId: number;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  notificationGroupId: number | null;
}

interface NotificationGroup {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: number;
  email: string;
  username: string;
}

interface NotificationSettingsData {
  roleId: number;
  notificationGroupId: number;
  enabled: boolean;
}

interface UserRole {
  userId: number;
  roleId: number;
  notificationGroupId: number | null;
  emailNotifications: boolean;
  createdAt: Date;
}

// Asegurarse de que la sesión esté disponible
const useSessionData = () => {
  const { data: session, status } = useSession();
  // console.log("Session:", session);
  return { session, status };
};

export const useCreateGeneratedNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GeneratedNotification) =>
      await createGeneratedNotification(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

export const useGetNotifications = () => {
  const { session } = useSessionData();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => await getGeneratedNotifications(),
    enabled: !!session,
  });
};
export const useGetNotificationsNested = (initialPage: number = 1) => {
  const { session } = useSessionData();

  return useInfiniteQuery({
    queryKey: ["notificationsNested"],
    queryFn: async ({ pageParam = initialPage }) =>
      await getGeneratedNotificationsNested(pageParam as number),
    getNextPageParam: (pageParams) => pageParams.nextPage ?? undefined,
    initialPageParam: initialPage,
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!session,
    select: (data) => {
      // console.log(data.pageParams);
      // console.log(data.pages);
      // const lastPage = data.pages[data.pages.length - 1];
      return data;
    },
  });
};

export const useGetNotificationGroups = () => {
  const { session } = useSessionData();

  return useQuery({
    queryKey: ["notificationGroups"],
    queryFn: async () => await getNotificationGroups(),
    enabled: !!session,
  });
};

export const useGetUsersInNotificationGroup = (notificationGroupId: number) => {
  return useQuery({
    queryKey: ["usersInNotificationGroup", notificationGroupId],
    queryFn: async () => await getUsersInNotificationGroup(notificationGroupId),
    enabled: !!notificationGroupId,
  });
};

export const useCreateNotificationGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotificationGroup) =>
      await createNotificationGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notificationGroups"],
      });
    },
  });
};

export const useCreateNotificationGroupRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { notificationGroupId: number; roleId: number }) =>
      await createNotificationGroupRole(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notificationGroups"],
      });
    },
  });
};

export const usegetAllRolesWithNotificationSettings = () => {
  const { session } = useSessionData();

  return useQuery({
    queryKey: ["rolesWithNotificationSettings"],
    queryFn: async () => await getAllRolesWithNotificationSettings(),
    enabled: !!session,
  });
};

export const useGetAllNotificationsByMaintenance = (maintenanceId: number) => {
  return useQuery({
    queryKey: ["notificationsByMaintenance", maintenanceId],
    queryFn: async () => await getAllNotificattionByMaintenance(maintenanceId),
    enabled: !!maintenanceId,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Ahora el `mutationFn` recibe TODA la lista de cambios
    mutationFn: async (data: { changes: Array<{
      roleId: number;
      notificationGroupId: number;
      enabled: boolean;
    }> }) => await updateNotificationSettings(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rolesWithNotificationSettings'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['notificationsByMaintenance'] });
      toast.success("Datos guardados exitosamente.");
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      toast.error("Error al guardar los cambios.");
    },
  });
};

export const useGetNotificationGroupsByRole = (rolesIds: number[]) => {
  return useQuery({
    queryKey: ["notificationGroupsByRole", rolesIds],
    queryFn: async () => await getNotificationGroupsByRole(rolesIds),
    enabled: !!rolesIds, // Solo se habilita si roleId tiene un valor
  });
};

export const useEnableEmailNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: number;
      changes: Array<{ groupId: number; emailNotifications: boolean }>;
    }) => {
      return enableEmailNotification(data);
    },
    onSuccess: async (_, variables) => {
      // Invalidar las queries relacionadas con el grupo de notificaciones
      await queryClient.invalidateQueries({
        queryKey: ["usersInNotificationGroup"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });


      await queryClient.invalidateQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rolesWithNotificationSettings"],
      });

      await queryClient.refetchQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.refetchQueries({
        queryKey: ["userRoles"],
      });

      toast.success("Datos guardados exitosamente.");

    },
    onError: (error) => {
      console.error("Error actualizando notificación por correo:", error);
      toast.error("Error al guardar los cambios.");
    },
  });
};

export function useUserRoles(userId: number) {
  return useQuery({
    queryKey: ["userRoles", userId],
    queryFn: async () => {
      if (!userId) throw new Error("El userId es requerido");
      return await getUserRoles(userId);
    },
    enabled: Boolean(userId), // Deshabilita la consulta si no hay userId
  });
}


export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserDataWithoutPassword) => await updateUserRoles(data),
    onSuccess: async () => {
      // Invalidar queries relevantes después de la actualización
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['userList'] });
      await queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      await queryClient.invalidateQueries({
        queryKey: ["usersInNotificationGroup"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });


      await queryClient.invalidateQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rolesWithNotificationSettings"],
      });

      await queryClient.refetchQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.refetchQueries({
        queryKey: ["userRoles"],
      });

      toast.success("Datos guardados exitosamente.");
    },
    onError: (error) => {
      console.error('Error al actualizar roles del usuario:', error);
      toast.error("Error al guardar los cambios.");
    },
  });
};

// export const useCreateUser = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: createUser,
//     onSuccess: async () => {
//       // Invalidar queries relevantes después de la actualización
//       await queryClient.invalidateQueries({ queryKey: ['userList'] });
//       await queryClient.invalidateQueries({ queryKey: ['userDetails'] });
//       await queryClient.invalidateQueries({
//         queryKey: ["usersInNotificationGroup"],
//       });

//       await queryClient.invalidateQueries({
//         queryKey: ["userRoles"],
//       });


//       await queryClient.invalidateQueries({
//         queryKey: ["notificationGroupsByRole"],
//       });

//       await queryClient.invalidateQueries({
//         queryKey: ["rolesWithNotificationSettings"],
//       });

//       await queryClient.refetchQueries({
//         queryKey: ["notificationGroupsByRole"],
//       });

//       await queryClient.refetchQueries({
//         queryKey: ["userRoles"],
//       });
//       await queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//     onError: (error) => {
//       console.error("Error al crear usuario:", error);
//       toast.error("Error al guardar los cambios.");
//     },
//   });
// };

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      // Invalidar queries relevantes después de la actualización
      await queryClient.invalidateQueries({ queryKey: ['userList'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      await queryClient.invalidateQueries({
        queryKey: ["usersInNotificationGroup"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });


      await queryClient.invalidateQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rolesWithNotificationSettings"],
      });

      await queryClient.refetchQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.refetchQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (error) => {
      console.error("Error al eliminar usuario:", error);
    },
  });
};

export const useUpdateUserVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserVerification, 
    onSuccess: async () => {
      // Invalidar queries relevantes después de la actualización
      await queryClient.invalidateQueries({ queryKey: ["userList"] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ["userDetails"] });
      await queryClient.invalidateQueries({
        queryKey: ["usersInNotificationGroup"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rolesWithNotificationSettings"],
      });

      await queryClient.refetchQueries({
        queryKey: ["notificationGroupsByRole"],
      });

      await queryClient.refetchQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (error) => {
      console.error("Error al actualizar verificación del usuario:", error);
      toast.error("Error al guardar los cambios.");
    },
  });
};

