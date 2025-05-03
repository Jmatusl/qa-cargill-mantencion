
import {z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Debes ingresar un correo electrónico válido" }),
  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100),
});