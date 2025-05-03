import { z } from "zod";

export const MaintenanceDetailSchema = z.object({
  systemId: z.optional(z.number()),
  equipmentId: z.optional(z.number()),
  faultType: z.optional(z.string()),
  description: z.optional(z.string()),
  estimatedSolution: z.optional(z.date()),
  actionsTaken: z.string({
    message: "el campo de acciones es requerido",
  }),
  status: z.any(),
  maintenanceUserId: z.number(),
  estimatedSolution2: z.optional(z.date()),
  estimatedSolution3: z.optional(z.date()),
  realSolution: z.optional(z.date()),
});
