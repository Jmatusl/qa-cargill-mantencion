"use client";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/validations/loginSchema";
import {
  Form,
  FormControl,
  FormDescription,
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
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sePasswordActiveUser } from "@/services/userServices";
import { User } from "@/types/UserType";
import { error } from "console";

export const registerSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Debes ingresar un correo electrónico válido" }),
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

export function PasswordForm({ userToken }: { userToken: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    formState: { errors },
  } = form;
  console.log(errors);

  const barColor = "#0c4a6e";

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    // console.log(data);
    // console.log(userToken);

    try {
      const response = await sePasswordActiveUser(
        data.email,
        data.password,
        userToken
      );
      console.log(response);

      if (!response.message) {
        toast.success("Usuario creado con éxito");
        router.push("/auth/login");
      } else {
        toast.error("Error al crear usuario: " + response.message);
      }
    } catch (error) {
      console.error("Error al crear usuario", error);
      toast.error("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  }

  // Estado para controlar si la contraseña se muestra o no
  const [showPassword, setShowPassword] = useState(false);

  // Manejador para cambiar el estado de showPassword
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover "
      style={{ backgroundImage: "url('/Home.png')" }}
    >
      {/* Logo en la esquina superior izquierda */}
      {/* <div className="absolute inset-x-0 top-0 mt-16 flex justify-center lg:left-0 lg:m-16 lg:justify-start">
        <Image
          src="/sotex-logo.png" // Sustituye con tu ruta de imagen de logo
          width={230} // Ajusta según el tamaño de tu logo
          height={230} // Ajusta según el tamaño de tu logo
          alt="Logo"
        />
      </div> */}

      {/* Enlace en la esquina inferior derecha */}
      <div className="absolute bottom-0 right-0 m-6 text-white font-bold ">
        <Link target="_blank" href="https://sotex.cl">
          <p>Sotex</p>
        </Link>
      </div>
      {/* Barra al final de la página */}
      <div
        className={`absolute bottom-0 w-full  h-16 -z-10 hidden xl:block`}
        id="barra"
      ></div>
      {/* Contenido del login */}
      <main className="flex items-center justify-center h-full w-full ">
        {/*         <Card className="w-[350px]  mx-auto relative  px-6 z-10 shadow-lg pb-6">
          <CardHeader className="text-center text-3xl font-semibold ">
            GEOP 🌎
          </CardHeader>
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingrese Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@mail.test"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
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
                            className="absolute  rounded-md inset-y-0 right-0 pr-3 flex items-center leading-5 text-xs text-gray-700 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={form.formState.isSubmitting}
                  type="submit"
                  className="mt-3 w-full hover:bg-blue-500"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <ScaleLoader color="#909090" />
                      <span className="ml-2">Ingresando...</span>
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </Card> */}

        <Card className="w-[400px]  mx-auto p-3 mt-20">
          <CardHeader className="text-center text-3xl font-semibold">
            Bienvenido a Sistema de Mantención
          </CardHeader>
          <CardContent className="text-center text-sm font-semibold">
            Por favor, crea una contraseña para tu cuenta
          </CardContent>
          <CardDescription className="text-center text-xs font-semibold mb-4">
            la contraseña debe tener al menos 8 caracteres y contener al menos
            un número
          </CardDescription>

          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl text-pretty">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@lapsa.cl"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl className="relative">
                        <div>
                          <Input
                            className="pr-12" // Add padding to the right of the input to make space for the button
                            placeholder="*********"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />

                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute  rounded-md inset-y-0 right-0 pr-3 flex items-center leading-5 text-xs text-gray-700 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Password</FormLabel>
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
                            className="absolute  rounded-md inset-y-0 right-0 pr-3 flex items-center leading-5 text-xs text-gray-700 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={form.formState.isSubmitting}
                  type="submit"
                  className="mt-3 w-full hover:bg-blue-500"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <ScaleLoader color="#909090" />
                      <span className="ml-2">Cargando...</span>
                    </>
                  ) : (
                    "Registrarse"
                  )}
                </Button>
              </form>
            </Form>
            {/* <Image
              alt="La Península"
              src="/laPeninsulaOficial.webp"
              width={250}
              height={96}
              className="mx-auto pt-5"
              priority={true}
            /> */}
          </div>
        </Card>
      </main>
    </div>
  );
}
