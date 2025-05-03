"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; // Importar useState
import { Oval } from "react-loader-spinner"; // Importar el loader

// Esquema de validación para el formulario de recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z.string().email("El email debe ser válido"),
  type: z.string().default("newUserPassword"), // Valor por defecto para type
});

function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Estado para el loader
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Función para manejar el envío del formulario
  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true); // Inicia la carga
    try {
      const dataWithType = {
        email: data.email,
        type: data.type, // Usa el tipo del formulario
      };

      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataWithType),
      });
      //console.log("res", res);
      if (!res.ok) {
        toast.error("Error en la peticion");
        return;
      }
      const resData = await res.json();
      //  console.log("data", resData);

      if (res.ok) {
        toast.success(
          // resData.message ||
          "Si su correo está registrado y su perfil lo permite, recibirá en su bandeja de entrada el link para poder cambiar su contraseña."
        );
        router.push("/auth/login");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al enviar el correo");
      }
    } catch (error) {
      toast.error("Error al conectarse al servidor");
    } finally {
      setIsLoading(false); // Finaliza la carga
    }
  }

  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/Home.png')" }}
    >
      {/* Logo en la esquina superior izquierda */}
      {/* <div className="absolute inset-x-0 top-0 mt-16 flex justify-center lg:left-0 lg:m-16 lg:justify-start">
        <Image src="/sotex-logo.png" width={230} height={230} alt="Logo" />
      </div> */}
      <div className="absolute bottom-0 right-0 m-6 text-white font-bold">
        <Link target="_blank" href="https://sotex.cl">
          <p>Sotex</p>
        </Link>
      </div>

      <main className="flex items-center justify-center h-full w-full">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm bg-white p-6 rounded shadow-lg z-10"
        >
          <h1 className="text-center text-2xl font-semibold mb-4">
            Recuperar Contraseña
          </h1>

          {/* Input de email */}
          <Input
            type="email"
            placeholder="Tu email"
            {...form.register("email")}
            className="mb-4"
            disabled={isLoading} // Desactivar input mientras carga
          />

          {/* Mostrar el botón o el loader según el estado de carga */}
          <Button
            type="submit"
            className="w-full hover:bg-blue-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex justify-center">
                <Oval
                  height={24}
                  width={24}
                  color="#ffffff"
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="#4fa94d"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
              </div>
            ) : (
              "Enviar enlace"
            )}
          </Button>
        </form>
      </main>

      {/* Enlace en la esquina inferior derecha */}
      <div className="absolute bottom-0 right-0 m-6 text-white font-bold">
        <Link target="_blank" href="https://lapsa.cl">
          <p>Naviera La Península</p>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
