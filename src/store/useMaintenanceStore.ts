import { create } from "zustand";
import { MaintenanceRequest } from "@/types/MaintenanceRequestType"; // Asegúrate de que la ruta sea correcta

interface MaintenanceStore {
  maintenanceRequests: MaintenanceRequest[];
  fetchMaintenanceRequests: () => Promise<void>;
  createMaintenanceRequest: (
    data: Partial<MaintenanceRequest>
  ) => Promise<void>;
  updateMaintenanceRequest: (
    id: number,
    data: Partial<MaintenanceRequest>
  ) => Promise<void>;
  deleteMaintenanceRequest: (id: number) => Promise<void>;
}

const useMaintenanceStore = create<MaintenanceStore>((set) => ({
  maintenanceRequests: [],

  fetchMaintenanceRequests: async () => {
    try {
      const response = await fetch("/api/maintenanceRequest");
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance requests");
      }
      const data = await response.json();
      set({ maintenanceRequests: data });
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error);
    }
  },

  createMaintenanceRequest: async (data) => {
    try {
      const response = await fetch("/api/maintenanceRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create maintenance request");
      }
      const newRequest = await response.json();
      set((state) => ({
        maintenanceRequests: [...state.maintenanceRequests, newRequest],
      }));
    } catch (error) {
      console.error("Failed to create maintenance request:", error);
    }
  },

  updateMaintenanceRequest: async (id, data) => {
    try {
      const response = await fetch("/api/maintenanceRequest", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...data }), // Asegúrate de incluir el id en el cuerpo
      });
      if (!response.ok) {
        throw new Error("Failed to update maintenance request");
      }
      const updatedRequest = await response.json();
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.map((request) =>
          request.id === id ? updatedRequest : request
        ),
      }));
    } catch (error) {
      console.error("Failed to update maintenance request:", error);
    }
  },

  deleteMaintenanceRequest: async (id) => {
    try {
      const response = await fetch(`/api/maintenanceRequest`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // Asegúrate de incluir el id en el cuerpo
      });
      if (!response.ok) {
        throw new Error("Failed to delete maintenance request");
      }
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.filter(
          (request) => request.id !== id
        ),
      }));
    } catch (error) {
      console.error("Failed to delete maintenance request:", error);
    }
  },
}));

export default useMaintenanceStore;
