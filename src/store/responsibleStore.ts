import { Responsible } from "@prisma/client";

import { create } from "zustand";

import { getResponsibleList } from "@/actions/responsibleActions";

export interface ResponsibleState {
  responsibles: Responsible[];
  fetchResponsibles: () => Promise<void>;
}

export const useResponsibleStore = create<ResponsibleState>()((set) => ({
  responsibles: [],
  fetchResponsibles: async () => {
    try {
      const responsibles = await getResponsibleList();
      set({ responsibles });
    } catch (error) {
      console.error("Error fetching responsibles:", error);
      throw new Error("Error fetching responsibles.");
    }
  },
}));
