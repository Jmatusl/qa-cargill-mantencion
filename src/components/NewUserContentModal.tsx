"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useUsersStore } from "@/store/usersStore";
import { ScaleLoader } from "react-spinners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenListCard } from "@/components/userModal/TokenList";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useUpdateUserRoles, useDeleteUser } from "@/hooks/useQueriesNotifications"; 
import { Role, Token, User } from "@prisma/client";
import { getRoles } from "@/actions/UserActions";
import { createUser } from "@/services/userServices";



interface UserRole {
  role: Role;
}

interface FormData {
  id: number;
  username: string;
  email: string;
  password?: string;
  roles: string[]; // Lista de nombres de roles
}

interface UserType extends User {
  roles: UserRole[];
  tokens: Token[];
}

// interface UserData {
//   username: string;
//   email: string;
//   password?: string; // Opcional si no es requerido en la creación
//   role: string; // Puede ser un string o un enum dependiendo de tu implementación
//   verified?: boolean; // Opcional si no es necesario durante la creación
//   lastLogin?: Date | null; // Opcional si no es necesario durante la creación
// }


const NewUser: React.FC<{
  data?: UserType;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ data, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>();
  const { fetchUsers } = useUsersStore();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const mutation = useUpdateUserRoles(); // Hook para actualizar roles

  // Inicializamos la mutación de borrado
  const deleteMutation = useDeleteUser();

  const fetchRoles = async () => {
    if (roles.length === 0) {
      try {
        const rolesResponse = await getRoles();
        setRoles(rolesResponse);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    }
  };

  useEffect(() => {
    fetchRoles();
    if (data) {
      const roleNames = data.roles.map((role) => role.role.name);
      setValue("roles", roleNames);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      reset({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles.map((role) => role.role.name),
      });
    } else {
      setValue("roles", ["NEW_USER"]);
    }
  }, [data]);

  const handleSendUserData = async (formData: FormData) => {
    console.log("formData", formData);
  
    if (!data) { // Creación de un nuevo usuario
      // Extraemos la información necesaria para que cumpla con UserData
      const userForCreation = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        roles: formData.roles.map((roleName) => ({ role: { name: roleName } })),
      } as UserType;
  
      try {
        setLoading(true);
        const response = await createUser(userForCreation as any); // Llamada a createUser
        if (response.message) {
          toast.error(response.message);
        } else {
          toast.success("Usuario creado exitosamente");
        }
      } catch (error) {
        console.error("Error al crear usuario:", error);
        toast.error("Error al crear usuario");
      } finally {
        fetchUsers();
        setLoading(false);
        setOpen && setOpen(false);
      }
    } else {
      // Mantén la lógica existente para editar usuarios
      const user = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        roles: formData.roles.map((roleName) => ({ role: { name: roleName } })),
      } as UserType;
  
      try {
        setLoading(true);
        await mutation.mutateAsync(user);
        toast.success("Usuario editado exitosamente");
      } catch (error) {
        console.error("Error al editar usuario:", error);
        toast.error("Error al editar usuario");
      } finally {
        fetchUsers();
        setLoading(false);
        setOpen && setOpen(false);
      }
    }
  };
  


  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el usuario ${data?.username}?`
    );
    if (confirmDelete && data?.id) {
      try {
        setLoading(true);
        // Llamamos al hook que elimina el usuario
        await deleteMutation.mutateAsync(data.id);
        toast.success("Usuario eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        toast.error("Error al eliminar usuario");
      } finally {
        // Refrescamos la lista de usuarios y cerramos
        fetchUsers();
        setLoading(false);
        setOpen && setOpen(false);
      }
    }
  };

  const selectedRoles = watch("roles", []);

  return (
    <div className="min-h-[670px]">
      <DialogTitle className="text-slate-900 font-bold text-xl">
        {data ? "Edición de Usuario" : "Crear nuevo Usuario"}
      </DialogTitle>
      <Tabs defaultValue="account" className="items-center pt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="account"
            className={`${!data ? "col-span-2" : "col-span-1"}`}
          >
            Datos del Usuario
          </TabsTrigger>
          {data && <TabsTrigger value="listToken">Tokens</TabsTrigger>}
        </TabsList>
        <TabsContent value="account">
          <div className="w-full">
            <form onSubmit={handleSubmit(handleSendUserData)}>
              <label htmlFor="username" className="block text-sm font-semibold mb-2 ml-2">
                Nombre de Usuario
              </label>
              <Input
                type="text"
                {...register("username", {
                  required: { value: true, message: "Este campo es requerido" },
                })}
                className="p-3 rounded block mb-2 text-slate-900"
                placeholder="Nombre de Usuario"
              />
              {errors.username && (
                <span className="text-red-500 text-xs mt-1">{errors.username.message}</span>
              )}

              <label htmlFor="email" className="font-semibold mb-2 block ml-2">
                Email
              </label>
              <Input
                disabled={!!data}
                type="email"
                {...register("email", {
                  required: { value: true, message: "Este campo es requerido" },
                })}
                className="p-3 rounded block mb-2 text-slate-900"
                placeholder="email@mail.com"
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
              )}

              <div className="grid grid-cols-3 items-center gap-2 mt-4">
                <label htmlFor="roles" className="font-semibold text-center">
                  Roles
                </label>
                <div className="col-span-2 p-3 rounded-md hover:bg-gray-100 block mb-2 text-slate-900">
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`role-${role.id}`}
                          value={role.name}
                          {...register("roles")}
                          className="mr-2"
                          defaultChecked={selectedRoles.includes(role.name)}
                        />
                        <label htmlFor={`role-${role.id}`}>{role.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 space-x-10 sm:space-x-64">
                {data && (
                  <Button
                    type="button"
                    className="bg-red-600 text-white hover:bg-red-700 flex-1"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ScaleLoader color="#FFFFFF" />
                        <span className="ml-2">Cargando...</span>
                      </>
                    ) : (
                      "Eliminar Usuario"
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`flex-1 ${
                    data
                      ? "bg-blue-500 text-white hover:bg-blue-800"
                      : "bg-green-500 text-white hover:bg-green-700"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ScaleLoader color="#FFFFFF" />
                      <span className="ml-2">Cargando...</span>
                    </>
                  ) : data ? (
                    "Actualizar"
                  ) : (
                    "Registrar"
                  )}
                </Button>
              </div>
              {setOpen && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
              )}
            </form>
          </div>
        </TabsContent>
        {data && (
          <TabsContent value="listToken">
            <TokenListCard data={data as UserType} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default NewUser;
