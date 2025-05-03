import {
    getAllRequestTypes,
    getRequestTypeById,
    createRequestType,
    updateRequestType,
    deleteRequestType,
} from "@/actions/requestTypeActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 🔍 Obtener todos los tipos de requerimiento
export const useRequestTypesQuery = () => {
    return useQuery({
        queryKey: ["request-types"],
        queryFn: async () => await getAllRequestTypes(),
    });
};

// 🔍 Obtener un tipo de requerimiento por ID
export const useRequestTypeByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ["request-type", id],
        queryFn: async () => await getRequestTypeById(id),
        enabled: !!id,
    });
};

// ➕ Crear
export const useCreateRequestTypeMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createRequestType,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["request-types"] });
      },
    });
  };
  
  // ✏️ Actualizar
  export const useUpdateRequestTypeMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) =>
        updateRequestType(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["request-types"] });
      },
    });
  };
  
  // 🗑️ Eliminar
  export const useDeleteRequestTypeMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (id: number) => deleteRequestType(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["request-types"] });
      },
    });
  };
