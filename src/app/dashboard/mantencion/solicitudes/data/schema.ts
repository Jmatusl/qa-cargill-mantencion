import { z } from "zod";

const ShipSchema = z.object({
  id: z.number(),
  name: z.string(),
  folio_id: z.string(),
  description: z.string().nullable(),
  observations: z.string().nullable(),
  state: z.boolean(),
  roleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const EquipmentSchema = z.object({
  id: z.number(),
  area: z.string(),
  subarea: z.string(),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  series: z.string(),
  extra: z.string().nullable(),
  status: z.string().nullable(),
  active: z.boolean(),
  shipId: z.number(),
  responsibleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const ResponsibleSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  area: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const EstimatedSolutionSchema = z.object({
  id: z.number(),
  date: z.date(),
  comment: z.string(),
  maintenanceRequestId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const UserSchema = z.object({
  userId: z.number(),
  maintenanceRequestId: z.number(),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    verified: z.boolean(),
    lastLogin: z.date(),
    lastActivity: z.date().nullable(),
    state: z.string(),
    shipId: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const MaintenanceRequestSchema = z.object({
  id: z.number(),
  folio: z.string(),
  equipment_id: z.number(),
  shipId: z.number(),
  faultType: z.string(),
  description: z.string(),
  actionsTaken: z.string(),
  status: z.string(),
  realSolution: z.date().nullable(),
  responsibleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ship: ShipSchema,
  equipment: EquipmentSchema,
  responsible: ResponsibleSchema,
  estimatedSolutions: z.array(EstimatedSolutionSchema),
  users: z.array(UserSchema),
});

export type MaintenanceRequest = z.infer<typeof MaintenanceRequestSchema>;
