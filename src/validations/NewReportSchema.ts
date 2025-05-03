import { z } from "zod";

export const  NewReportSchema = z.object({
    systemId:z.number().int().nonnegative(),
    equipmentId:z.number().int().nonnegative(),
    faultType: z
      .string({
        message: "El tipo de falla es requerido",
      })
      .min(3, "El tipo de falla es requerido"),
    description: z
      .string({
        message: "La descripción es requerida",
      })
      .min(3, "La descripción es requerida"),
  });