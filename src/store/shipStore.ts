// stores/shipStore.ts
import { create } from "zustand";
import { getShipsList } from "@/actions/shipActions";
import { Ships } from "@prisma/client";

export interface ShipState {
  ships: Ships[];
  fetchShips: () => Promise<void>;
}

export const useShipStore = create<ShipState>()((set) => ({
  ships: [],
  fetchShips: async () => {
    try {
      const ships = await getShipsList();
      set({ ships });
    } catch (error) {
      console.error("Error fetching ships:", error);
      throw new Error("Error fetching ships.");
    }
  },
}));
