"use client";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/validations/loginSchema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScaleLoader } from "react-spinners";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Estado para la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const rolesPermitidos = [1, 3, 2, 5, 6, 7, 8];

  // Manejador de envío de formulario
  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Ingreso exitoso");

        // Redirección basada en los roles del usuario autenticado
        if (session?.user) {
          const userRoles = (session.user as { roles: { roleId: number }[] }).roles.map((role) => role.roleId);

          if (userRoles.some((roleId) => rolesPermitidos.includes(roleId))) {
            router.push("/dashboard/mantencion");
          } else if (userRoles.includes(4)) {
            // Si el usuario  es rol nave
            router.push("/dashboard/mantencion/ingreso");
          } else {
            router.push("/dashboard/mantencion");
          }
        }
      } else {
        toast.error("Error al ingresar");
      }
    } catch (error) {
      console.error("SignIn error:", error);
      toast.error("Error al conectarse al servidor");
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Si el usuario ya tiene sesión iniciada y roles asignados, redirige inmediatamente
    if (session?.user) {
      const userRoles = (session.user as { roles: { roleId: number }[] }).roles.map((role) => role.roleId);

      if (userRoles.some((roleId) => rolesPermitidos.includes(roleId))) {
        router.push("/dashboard/mantencion");
      } else if (userRoles.includes(4)) {
        router.push("/dashboard/mantencion/ingreso");
      } else {
        router.push("/dashboard/mantencion");
      }
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1">
          <h2 className="text-2xl font-bold text-center">Mantención</h2>
          <p className="text-sm text-muted-foreground text-center">Ingrese su usuario y contraseña para acceder al sistema.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-100"
                        placeholder="Ingrese su correo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-normal">Contraseña</FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-500 hover:underline"
                        tabIndex={-1}
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-gray-100"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          tabIndex={-1}
                        >
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full btn-primary p-2 font-normal"
                style={{ backgroundColor: "#283c7fff" }}
              >
                {form.formState.isSubmitting ? (
                  <ScaleLoader
                    color="#ffffff"
                    height={20}
                  />
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
