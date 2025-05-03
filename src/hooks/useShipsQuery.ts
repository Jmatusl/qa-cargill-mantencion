import { getShipsList, getShipById, getShipsByIds } from "../actions/shipActions";
import { useQuery } from "@tanstack/react-query";

export const useShipsQuery = () => {
  return useQuery({
    queryKey: ["ships"],
    queryFn: async () => await getShipsList(),
  });
};

export const useShipByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["ship", id],
    queryFn: async () => await getShipById(id),
  });
};

export const useShipsByIds = (ids: number[]) => {
  return useQuery({
    queryKey: ["shipsByIds", ids],
    queryFn: () => getShipsByIds(ids),
    enabled: ids.length > 0, 
    staleTime: 1000 * 60 * 5,
  });
};

