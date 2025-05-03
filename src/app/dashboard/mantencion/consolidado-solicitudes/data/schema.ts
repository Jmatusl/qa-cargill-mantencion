import { z } from "zod";

export const maintenanceRequestSchema = z.object({
  id: z.number(),
  folio: z.string().nullable().optional(),
  equipment_id: z.number(),
  shipId: z.number(),
  faultType: z.string(),
  description: z.string(),
  actionsTaken: z.string().optional().nullable(),
  maintenanceUserId: z.number().optional().nullable(),
  status: z.string(),
  realSolution: z.date().optional().nullable(),
  assignedToId: z.number().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  diasTranscurridos: z.number().optional(),
  ship: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional().nullable(),
    observations: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  equipment: z.object({
    id: z.number(),
    area: z.string(),
    subarea: z.string(),
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    series: z.string(),
    extra: z.string().optional().nullable(),
    shipId: z.number(),
    responsibleId: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;
