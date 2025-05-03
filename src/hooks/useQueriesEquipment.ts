import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getAreaList,
  getAreaListByShip,
  getEquipmentList,
  getEquipmentListByArea,
  getEquipmentListByShip,
  getFlatEquipmentList,
  createEquipment,
  updateEquipment,
  deactivateEquipment,
  getEquipmentById,
  getAreasByShip,
  getEquipmentChangeLog,
  activateEquipment,
  getNotificationsByEquipment,
  getMaintenanceListByEquipment,
} from "@/actions/equipmentAction";
import { ChangeRecord } from "@/types/EquipmentType";

export const useGetAreaList = () => {
  return useQuery({
    queryKey: ["areaList"],
    queryFn: async () => await getAreaList(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useGetAreaListByShip = (shipId: number | null) => {
  return useQuery({
    queryKey: ["areaListByShip", shipId],
    queryFn: async () => await getAreaListByShip(shipId as number),
    enabled: !!shipId, // La query solo se activa si shipId tiene un valor válido
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
// peticion para traer los equios por subarea excusivamente
export const useEquipmentListBySubArea = (subarea: string) => {
  return useQuery({
    queryKey: ["equipmentList", subarea],
    queryFn: async () => await getEquipmentListByArea(subarea),
    enabled: !!subarea, // La query solo se activa si subarea tiene un valor válido
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const getAllEquipmentList = () => {
  return useQuery({
    queryKey: ["equipmentList"],
    queryFn: async () => await getEquipmentList(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useGetEquipmentListByShip = (
  shipId: number | null,
) => {
  return useQuery({
    queryKey: ["equipmentListByShip", shipId],
    queryFn: async () =>
      await getEquipmentListByShip(shipId as number),
    enabled: !!shipId, // La query solo se activa si shipId y subarea tienen valores válidos
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useGetFlatEquipmentList = () => {
  return useQuery({
    queryKey: ["flatEquipmentList"],
    queryFn: async () => await getFlatEquipmentList(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      area: string;
      subarea: string;
      brand: string;
      model: string;
      series: string;
      extra?: string;
      status?: string;
      active?: boolean;
      shipId: number;
      responsibleId: number;
    }) => await createEquipment(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areaList"] });
      await queryClient.invalidateQueries({ queryKey: ["areaListByShip"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentList"] });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByShip"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByArea"],
      });
      await queryClient.invalidateQueries({ queryKey: ["flatEquipmentList"] });
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentChangeLog"] });
    },
    onError: (error) => {
      console.error("Error creating equipment:", error);
    },
  });
};

// Hook para editar un equipo
export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        name: string;
        area: string;
        subarea: string;
        brand: string;
        model: string;
        series: string;
        extra?: string;
        status?: string;
        active?: boolean;
        shipId: number;
        responsibleId: number;
      }>;
    }) => await updateEquipment(id, data),
    onSuccess: async (id) => {
      // await queryClient.invalidateQueries({ queryKey: ["equipment", updatedEquipment.id] });
      // await queryClient.invalidateQueries({ queryKey: ["areaList"] });
      // await queryClient.invalidateQueries({ queryKey: ["areaListByShip"] });
      // await queryClient.invalidateQueries({ queryKey: ["equipmentList"] });
      // await queryClient.invalidateQueries({ queryKey: ["equipmentListByShip"] });
      // await queryClient.invalidateQueries({ queryKey: ["equipmentListByArea"] });
      // await queryClient.invalidateQueries({ queryKey: ["flatEquipmentList"] });
      // await queryClient.invalidateQueries({ queryKey: ["areas"] });
      // await queryClient.invalidateQueries({ queryKey: ["equipmentChangeLog", updatedEquipment.id] });

      await queryClient.invalidateQueries({ queryKey: ["areaList"] });
      await queryClient.invalidateQueries({ queryKey: ["areaListByShip"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentList"] });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByShip"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByArea"],
      });
      await queryClient.invalidateQueries({ queryKey: ["flatEquipmentList"] });
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentChangeLog"] });
      await queryClient.refetchQueries({ queryKey: ["flatEquipmentList"] });
    },
    onError: (error) => {
      console.error("Error updating equipment:", error);
    },
  });
};

// Hook para desactivar un equipo
export const useDeactivateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => await deactivateEquipment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areaList"] });
      await queryClient.invalidateQueries({ queryKey: ["areaListByShip"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentList"] });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByShip"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByArea"],
      });
      await queryClient.invalidateQueries({ queryKey: ["flatEquipmentList"] });
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentChangeLog"] });
    },
    onError: (error) => {
      console.error("Error deactivating equipment:", error);
    },
  });
};

export const useGetEquipmentById = (id: number | null) => {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => await getEquipmentById(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetAreasByShip = (shipId: number) => {
  return useQuery({
    queryKey: ["areas", shipId], // Incluye shipId en el queryKey
    queryFn: async () => {
      if (!shipId) return { areas: [], subareas: [] }; // Manejo de casos donde shipId no es válido
      const { areas, subareas } = await getAreasByShip(shipId);
      return { areas, subareas };
    },
    enabled: !!shipId, // La consulta solo se ejecuta si shipId es verdadero
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetEquipmentChangeLog = (
  id: number,
  options?: Omit<UseQueryOptions<ChangeRecord[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<ChangeRecord[]>({
    queryKey: ["equipmentChangeLog", id],
    queryFn: () => getEquipmentChangeLog(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useActivateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => await activateEquipment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areaList"] });
      await queryClient.invalidateQueries({ queryKey: ["areaListByShip"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentList"] });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByShip"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["equipmentListByArea"],
      });
      await queryClient.invalidateQueries({ queryKey: ["flatEquipmentList"] });
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      await queryClient.invalidateQueries({ queryKey: ["equipmentChangeLog"] });
    },
    onError: (error) => {
      console.error("Error activating equipment:", error);
    },
  });
};

export const useGetNotificationByEquipment = (id: number | null) => {
  return useQuery({
    queryKey: ["notificationByEquipment", id],
    queryFn: async () => await getNotificationsByEquipment(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetMaintenanceListByEquipment = (equipmentId: number | null) => {
  return useQuery({
    queryKey: ["maintenanceListByEquipment", equipmentId],
    queryFn: async () => await getMaintenanceListByEquipment(equipmentId as number),
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
};