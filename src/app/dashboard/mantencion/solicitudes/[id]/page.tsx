/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import {
  useGetMaintenanceById,
  useUpdateMaintenanceRequest,
} from "@/hooks/UseQueriesMaintenance";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Responsible } from "@prisma/client";
import NoPermission from "@/components/NoPermission";
import {
  statuses,
  faultTypes,
} from "@/app/dashboard/mantencion/consolidado-solicitudes/data/data";
import { CarouselSpacing } from "@/app/dashboard/mantencion/components/CarouselSpacing";
import { Checkbox } from "@/components/ui/checkbox";
import { useRequestTypesQuery } from "@/hooks/useRequestType";

interface Photo {
  id: number;
  url: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRole {
  userId: number;
  roleId: number;
  role: Role;
}

interface User {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
  responsible?: Responsible;
}

// Definir el esquema de validación de Zod
const formSchema = z.object({
  faultType: z.string().min(1, "Debe seleccionar un tipo de requerimiento"),
  estimatedSolutions: z.object({
    date: z
      .string()
      .min(1, "Debe ingresar una fecha válida")
      .transform((val) => new Date(val)), // Convertir el string a Date
    comment: z.string().optional(),
  }),
  complete: z.boolean().optional(), // Campo opcional para cambiar a "COMPLETADO"
});

export default function Page({ params }: { params: { id: string } }) {
  const [responsibleId, setResponsibleId] = useState<number | null>(null);
  const { data: requestTypes, isLoading: loadingRequestTypes } = useRequestTypesQuery();
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const { data: session } = useSession();
  const { id } = params;
  const router = useRouter();

  const {
    data: selectedSolicitud,
    isLoading,
    isError,
    isFetching,
  } = useGetMaintenanceById(parseInt(id), responsibleId ?? 0);
  // console.log(selectedSolicitud);

  const {
    mutate: updateMaintenanceRequest,
    isError: isUpdatingError,
    isSuccess,
    isPending,
  } = useUpdateMaintenanceRequest();
  const photos: Photo[] = selectedSolicitud?.photos ?? [];


  const userData = session?.user as User;
  const userId = userData?.id || 0;
  const userName = userData?.username || "Usuario desconocido";

  useEffect(() => {
    if (userData) {
      const isAdmin = userData.roles.some(
        (userRole: UserRole) => userRole.role.name === "ADMIN"
      );
      isAdmin
        ? setResponsibleId(1000)
        : setResponsibleId(userData.responsible?.id || null);
    }
  }, [userData]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimatedSolutions: {
        date: "",
        comment: "",
      },
      faultType: "",
      description: "",
      responsibleId: "",
      complete: false,
    },
  });

  useEffect(() => {
    if (selectedSolicitud) {
      const newDefaultValues = {
        estimatedSolutions: {
          date: selectedSolicitud.estimatedSolutions?.[0]?.date
            ? new Date(selectedSolicitud.estimatedSolutions[0].date)
              .toISOString()
              .split("T")[0]
            : "",
          comment: selectedSolicitud.estimatedSolutions?.[0]?.comment || "",
        },
        faultType: selectedSolicitud.faultType || "",
        description: selectedSolicitud.description || "",
        responsibleId: selectedSolicitud.responsible?.id || "",
        complete: false,
      };

      reset(newDefaultValues);
    }
  }, [selectedSolicitud, reset]);

  useEffect(() => {
    if (isSuccess) {
      router.push(`/dashboard/mantencion/solicitudes`);
    }
  }, [isSuccess]);

  const handleCancel = () => {
    router.push(`/dashboard/mantencion/solicitudes`);
  };

  const onSubmit = (data: any) => {
    if (selectedSolicitud) {
      let newStatus = selectedSolicitud.status;

      if (selectedSolicitud.status === "SOLICITADO") {
        newStatus = "EN_PROCESO";
      } else if (selectedSolicitud.status === "EN_PROCESO" && data.complete) {
        newStatus = "COMPLETADO";
      }

      const updatedData: any = {
        faultType: data.faultType,
        description: data.description,
        estimatedSolutions: [data.estimatedSolutions],
        status: newStatus,
      };

      if (newStatus === "COMPLETADO") {
        updatedData.realSolution = new Date().toISOString();
      }

      if ("complete" in updatedData) {
        delete updatedData.complete;
      }

      updateMaintenanceRequest({ id: selectedSolicitud.id, ...updatedData });
    }
  };

  if (isLoading || !selectedSolicitud) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  const formatDateForInput = (date: any): string => {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0];
    }
    return "";
  };

  const hasMultipleEstimatedDates =
    selectedSolicitud?.estimatedSolutions?.length > 1;
  if (selectedSolicitud === undefined || selectedSolicitud === null) {
    return <NoPermission />;
  }

  const getStatusLabel = (statusValue: String) => {
    const status = statuses.find((item) => item.value === statusValue);
    return status ? status.label : "Seleccione un estado";
  };

  const selectableStatuses = statuses.filter(
    (status) => status.value === "EN_PROCESO" || status.value === "COMPLETADO"
  );

  // Observar el estado actual
  const currentStatus = selectedSolicitud.status;

  // Definir el label del botón según el estado
  let buttonLabel = "Guardar";
  if (currentStatus === "SOLICITADO") {
    buttonLabel = "Cambiar estado a En Proceso";
  } else if (currentStatus === "EN_PROCESO") {
    buttonLabel = "Guardar";
  } else {
    buttonLabel = "Guardar";
  }

  return (
    <Card className="w-full max-w-7xl mx-auto p-6">
      <CardTitle className="text-2xl font-bold mb-4">
        Requerimiento asignado {selectedSolicitud.folio} -{" "}
        {selectedSolicitud.ship?.name}
      </CardTitle>
      <CardDescription className="mb-4">
        Detalles y actualización de la solicitud de mantenimiento
      </CardDescription>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="equipo">Equipo</Label>
              <Input
                id="equipo"
                value={selectedSolicitud.equipment?.name || ""}
                readOnly
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="tipo-falla">Tipo de requerimiento</Label>
              <Controller
                name="faultType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded-md p-2"
                    disabled={currentStatus === "COMPLETADO"}
                  >
                    <option value="">Seleccione un tipo de requerimiento</option>
                    {(requestTypes ?? []).map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}

                  </select>
                )}
              />

              {errors.faultType && (
                <p className="text-red-600">
                  {String(errors.faultType?.message)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <p className="w-full border rounded-md p-2 bg-gray-100">
                {getStatusLabel(currentStatus)}
              </p>
            </div>
            <div>
              <Label htmlFor="responsable">Responsable Mantención</Label>
              <Input
                id="responsable"
                value={selectedSolicitud.responsible?.name || ""}
                readOnly
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="fecha-solicitud">Fecha de Ingreso</Label>
              <Input
                id="fecha-solicitud"
                value={new Date(selectedSolicitud.createdAt).toLocaleDateString(
                  "es-ES",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }
                )}
                readOnly
                className="w-full"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="primera-fecha">
                Fecha Posible de Solución{" "}
                {hasMultipleEstimatedDates && (
                  <span className="text-gray-500 text-sm">
                    (Fecha más reciente de{" "}
                    {selectedSolicitud.estimatedSolutions.length})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Controller
                  name="estimatedSolutions.date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="primera-fecha"
                      type="date"
                      {...field}
                      value={formatDateForInput(field.value)}
                      readOnly={hasMultipleEstimatedDates}
                      className="w-full"
                      disabled={
                        currentStatus === "COMPLETADO" ||
                        currentStatus === "EN_PROCESO"
                      }
                    />
                  )}
                />
                <CalendarIcon className="absolute right-2 top-2 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.estimatedSolutions?.date && (
                <p className="text-red-600">
                  {errors.estimatedSolutions?.date?.message}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="descripcion">Descripción síntoma</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="descripcion"
                    {...field}
                    readOnly
                    value={field.value || "No hay descripción disponible."}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 resize-none"
                    rows={field.value?.split("\n").length || 3} // Ajusta dinámicamente el número de filas según el contenido
                  />
                )}
              />
            </div>
            {photos.length > 0 && (
              <div className="col-span-2 my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo: Photo) => (
                  <div key={photo.id} className="overflow-hidden rounded shadow-md">
                    <img
                      src={photo.url}
                      alt={`Foto adjunta ${photo.id}`}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => {
                        setLightboxPhoto(photo);
                        setZoomed(false);
                      }}

                    />
                  </div>
                ))}
              </div>
            )}


            <div className="col-span-2 flex flex-col items-center justify-center">
              <label className="text-xl font-semibold mb-0 block mt-2">
                Registros
              </label>
              <CarouselSpacing
                solicitudId={selectedSolicitud.id}
                equipo={
                  selectedSolicitud.equipment?.name || "Equipo desconocido"
                }
                shipName={selectedSolicitud.ship?.name || "Instalación Desconocida"}
                shipId={selectedSolicitud.shipId}
                userId={userId}
                userName={userName}
                isAddActionsComment={true}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center mt-4">
          {currentStatus === "EN_PROCESO" && (
            <div className="flex items-center space-x-2">
              <Controller
                name="complete"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="complete-checkbox"
                    checked={field.value}
                    onCheckedChange={(checked: boolean) =>
                      field.onChange(checked)
                    }
                    disabled={isPending}
                    className={`w-6 h-6 border-2 rounded-md ${field.value ? "border-gray-300" : "border-red-500"
                      } checked:bg-blue-500`}
                  />
                )}
              />
              <Label
                htmlFor="complete-checkbox"
                className="text-md font-semibold"
              >
                Cambiar estado de solicitud a Completado
              </Label>
            </div>
          )}
          <div className="ml-auto flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleCancel}
            >
              Volver
            </Button>
            {currentStatus !== "COMPLETADO" && (
              <Button
                type="submit"
                disabled={isPending || !isDirty || !isValid}
              >
                {buttonLabel}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setLightboxPhoto(null);
            setZoomed(false);
          }}
        >
          <Card
            className="w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // evita cerrar al clicar dentro del Card
          >
            <CardTitle className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLightboxPhoto(null);
                  setZoomed(false);
                }}
              >
                ✕
              </Button>
            </CardTitle>

            <CardContent className="p-0 flex justify-center items-center bg-white">
              <img
                src={lightboxPhoto.url}
                alt={`Foto ${lightboxPhoto.id}`}
                className={`
            max-w-full max-h-[80vh] 
            transition-transform duration-300 
            ${zoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"}
          `}
                onClick={() => setZoomed((z) => !z)}
              />
            </CardContent>

            <CardFooter className="justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(lightboxPhoto.url, "_blank")}
              >
                Abrir en nueva pestaña
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
}
