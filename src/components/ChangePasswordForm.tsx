"use client";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/validations/loginSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScaleLoader } from "react-spinners";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { sePasswordActiveUser } from "@/services/userServices";
import Link from "next/link";

export const registerSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
      .max(100),
    confirmPassword: z
      .string()
      .min(6, {
        message:
          "La confirmación de contraseña debe tener al menos 6 caracteres",
      })
      .max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export function PasswordForm({
  userToken,
  email,
}: {
  userToken: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: "",
    },
  });
  const {
    formState: { errors },
  } = form;

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    try {
      setLoading(true); // Iniciar carga
      const response = await sePasswordActiveUser(
        email, // Usar el email recibido directamente
        data.password,
        userToken
      );

      if (!response.message) {
        toast.success("Contraseña cambiada con éxito");
        router.push("/auth/login");
      } else {
        toast.error("Error al cambiar la contraseña: " + response.message);
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña", error);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setLoading(false); // Finalizar carga
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/Home.png')" }}
    >
      {/* <div className="absolute inset-x-0 top-0 mt-16 flex justify-center lg:left-0 lg:m-16 lg:justify-start">
        <Image src="/sotex-logo.png" width={230} height={230} alt="Logo" />
      </div> */}

      <div className="absolute bottom-0 right-0 m-6 text-white font-bold">
        <Link target="_blank" href="https://sotex.cl">
          <p>Sotex</p>
        </Link>
      </div>
      <div
        className={`absolute bottom-0 w-full h-16 -z-10 hidden xl:block`}
        id="barra"
      ></div>
      <main className="flex items-center justify-center h-full w-full ">
        <Card className="w-[400px] mx-auto p-3 mt-20">
          <CardHeader className="text-center text-3xl font-semibold">
            Cambio de Contraseña
          </CardHeader>
          <CardContent className="text-center text-sm font-semibold">
            Por favor, ingresa una nueva contraseña para tu cuenta
          </CardContent>
          <CardDescription className="text-center text-xs font-semibold mb-4">
            La contraseña debe tener al menos 8 caracteres y contener al menos
            un número
          </CardDescription>

          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl text-pretty">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl className="relative">
                        <div>
                          <Input
                            className="pr-12"
                            placeholder="*********"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute rounded-md inset-y-0 right-0 pr-3 flex items-center leading-5 text-xs text-gray-700 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl className="relative">
                        <div>
                          <Input
                            placeholder="*********"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute rounded-md inset-y-0 right-0 pr-3 flex items-center leading-5 text-xs text-gray-700 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={form.formState.isSubmitting || loading}
                  type="submit"
                  className="mt-3 w-full hover:bg-blue-500"
                >
                  {loading ? (
                    <>
                      <ScaleLoader color="#909090" />
                      <span className="ml-2">Cargando...</span>
                    </>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </form>
            </Form>
            <Image
              alt="Sotex"
              src="/sotex-logo.png"
              width={250}
              height={96}
              className="mx-auto pt-5"
              priority={true}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
