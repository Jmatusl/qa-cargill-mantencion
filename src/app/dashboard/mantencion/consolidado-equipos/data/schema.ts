import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

// Definir el esquema para los datos aplanados de equipment
export const flatEquipmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  area: z.string(),
  subarea: z.string(),
  status: z.string().nullable(),
  responsibleId: z.number().nullable(),
  responsibleName: z.string().nullable(),
  responsibleEmail: z.string().nullable(),
  shipId: z.number().nullable(),
  shipName: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Definir la interfaz de salida basada en el esquema
export type FlatEquipment = z.infer<typeof flatEquipmentSchema>;
