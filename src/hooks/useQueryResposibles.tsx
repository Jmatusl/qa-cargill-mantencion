import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUsers } from "@/actions/UserActions";
import { getResponsibleList } from "@/actions/responsibleActions";

export const useGetResponsiblesList = () => {
  const { data: session, status } = useSession();

  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["responsiblesList"],
    queryFn: async () => await getResponsibleList(),
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetUsers = () => {
  const { data: session, status } = useSession();

  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => await getUsers(),
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
