import { z } from "zod";

export const registerSchema = z.object({
  username: z.string()
    .min(2, { message: "Debes ingresar al menos 2 caracteres" })
    .max(100),
  email: z.string().email({ message: "Debes ingresar un correo electrónico válido" }),
  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100),
  confirmPassword: z.string()
    .min(6, { message: "La confirmación de contraseña debe tener al menos 6 caracteres" })
    .max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], // Esto asegura que el mensaje de error se asocie con el campo 'confirmPassword'
});
