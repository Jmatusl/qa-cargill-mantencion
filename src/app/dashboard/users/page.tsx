"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import NewUser from "@/components/NewUserContentModal";
import UserTable from "./components/UserTable";
import { userColumns } from "./components/UserTableColumns";
import NoPermission from "@/components/NoPermission";
import useUserRoles from "@/hooks/useUserRoles";
import { useGetUsers } from "@/hooks/useQueryResposibles";

const RegisterPage: React.FC = () => {
  const { data: session, status } = useSession();
  const { data: users, isLoading, isError } = useGetUsers();
  const { isAllowed } = useUserRoles([3]);

  if (status === "loading") {
    return (
      <p className="bg-white p-2 text-black text-xl font-semibold rounded shadow text-center">
        Validando Usuario...
      </p>
    );
  } else if (!isAllowed) {
    return <NoPermission />;
  }

  return (
    <div className="flex flex-col">
      <div className="container mx-auto mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card className="shadow-sm rounded-lg overflow-hidden">
          <div className="flex flex-row justify-between items-center w-full p-4 bg-white rounded-t-lg shadow-sm border-b border-gray-200">
            <CardHeader>
              <h1 className="text-xl font-semibold">Lista de Usuarios</h1>
            </CardHeader>
            <Modal
              className="w-full md:w-1/2 lg:w-1/3 justify-end"
              trigger={
                <Button className="ml-auto my-4" size="sm">
                  Agregar Usuario
                </Button>
              }
            >
              <NewUser />
            </Modal>
          </div>
          <div className="border shadow-sm rounded-lg p-4 bg-white">
            {isLoading ? (
              <p>Cargando...</p>
            ) : isError ? (
              <p>Error al cargar los usuarios</p>
            ) : (
              <UserTable
                data={users || []}
                columns={userColumns}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
