import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { useGetResponsiblesList } from "@/hooks/useQueryResposibles";
import { useGetUsers } from "@/hooks/useQueryResposibles";

function ResponsibleAsignations() {
  const [selectedResponsible, setSelectedResponsible] = useState<number | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<
    { userId: number; responsibleId: number }[]
  >([]);

  const {
    data: responsiblesData = [],
    isLoading: isLoadingResponsibles,
    error: responsiblesError,
  } = useGetResponsiblesList();

  const {
    data: usersData = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUsers();

  const handleAssign = () => {
    if (!selectedResponsible || !selectedUser) {
      alert("Debe seleccionar un usuario y un responsable.");
      return;
    }

    const existingIndex = assignments.findIndex(
      (a) => a.userId === selectedUser
    );

    if (existingIndex !== -1) {
      // Actualiza la asignación existente
      const updatedAssignments = [...assignments];
      updatedAssignments[existingIndex].responsibleId = selectedResponsible;
      setAssignments(updatedAssignments);
    } else {
      // Agrega una nueva asignación
      setAssignments((prev) => [
        ...prev,
        { userId: selectedUser, responsibleId: selectedResponsible },
      ]);
    }

    setSelectedResponsible(null);
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 border border-gray-300 rounded-md shadow-md w-full max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-center">
        Asignación de Responsables
      </h1>

      {/* Selección de Usuarios y Responsables */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-y-4 md:gap-y-0 md:gap-x-6">
        {/* Responsables */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">
            Responsable de Equipos
          </h2>
          <Select
            onValueChange={(value) => setSelectedResponsible(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {responsiblesData.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay responsables disponibles
                  </p>
                ) : (
                  responsiblesData.map((responsible: any) => (
                    <SelectItem
                      key={responsible.id}
                      value={responsible.id.toString()}
                    >
                      {responsible.name}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {responsiblesError && (
            <p className="text-red-500 text-sm mt-2">
              Error al cargar los responsables: {responsiblesError.message}
            </p>
          )}
          {isLoadingResponsibles && (
            <p className="text-gray-500 text-sm mt-2">
              Cargando responsables...
            </p>
          )}
        </div>

        {/* Usuarios */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Usuarios</h2>
          <Select onValueChange={(value) => setSelectedUser(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {usersData.map(({ id, username }) => (
                  <SelectItem key={id} value={id.toString()}>
                    {username}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {usersError && (
            <p className="text-red-500 text-sm mt-2">
              Error al cargar los usuarios: {usersError.message}
            </p>
          )}
          {isLoadingUsers && (
            <p className="text-gray-500 text-sm mt-2">Cargando usuarios...</p>
          )}
        </div>

        {/* Botón de Guardar */}
        <div className="w-full md:w-auto text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssign()}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Guardar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar cambios en esta asignación</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Asignaciones Actuales */}
      <div>
        <h2 className="text-lg font-medium text-center mb-4">
          Asignaciones Actuales
        </h2>
        <div className="space-y-4">
          {responsiblesData.length > 0 ? (
            responsiblesData.map((responsible: any) => (
              <div
                key={responsible.id}
                className="flex flex-col md:flex-row items-center md:justify-between border border-gray-300 rounded-md p-4"
              >
                {/* Responsable */}
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                  <span className="font-medium bg-blue-100 px-2 py-1 rounded-md">
                    Responsable: {responsible.name}
                  </span>
                </div>

                {/* Conector */}
                <span className="text-blue-500 text-xl hidden md:block">⇌</span>

                {/* Usuario */}
                <div className="flex items-center space-x-2">
                  {responsible.user ? (
                    <span className="font-medium bg-green-100 px-2 py-1 rounded-md">
                      Usuario: {responsible.user.username}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">
                      Sin usuario asociado
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No hay responsables disponibles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponsibleAsignations;
