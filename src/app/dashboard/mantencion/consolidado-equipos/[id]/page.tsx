"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useGetEquipmentById,
  useUpdateEquipment,
  useCreateEquipment,
  useGetAreasByShip,
  useGetAreaList,
} from "@/hooks/useQueriesEquipment";
import { useGetResponsibles } from "@/hooks/UseQueriesMaintenance";
import { useShipsQuery } from "@/hooks/useShipsQuery";
import NoPermission from "@/components/NoPermission";
import useUserRoles from "@/hooks/useUserRoles";
import SkeletonForm from "../components/SkeletonForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChangeLogContent from "../components/ChangeLogContent";
import { NotificationsTab } from "../components/NotificationsTab";

type AreaListDataEditMode = {
  uniqueAreas: { area: string }[];
  uniqueSubareas: { area: string; subarea: string }[];
};

type AreaListDataCreateMode = {
  areas: { area: string }[];
  subareas: { area: string; subarea: string }[];
};

type AreaListData = AreaListDataEditMode | AreaListDataCreateMode;

// Schema and types
const formSchema = z.object({
  name: z.string().min(1, "Debe ingresar el nombre del equipo"),
  area: z.string().min(1, "Debe ingresar el área del equipo"),
  otherArea: z.string().optional(),
  subarea: z.string().min(1, "Debe ingresar el sistema del equipo"),
  otherSubarea: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  series: z.string().optional(),
  nave: z.string().optional(),
  responsable: z.string().min(1, "Debe ingresar el Responsable del equipo"),
  active: z.boolean().optional(),
  extra: z.string().optional(),
  status: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Responsible = {
  id: number;
  name: string;
};

export default function EquipmentFormPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { isAllowed } = useUserRoles([3, 4, 7, 8]);

  // Estado para manejar IDs inválidos
  const [isInvalidId, setIsInvalidId] = useState(false);

  // Determinar el modo y el ID del equipo
  const parsedId = parseInt(id, 10);
  const mode: "create" | "edit" =
    id === "new" ? "create" : !isNaN(parsedId) ? "edit" : "create";
  const equipmentId: number | undefined =
    mode === "edit" ? parsedId : undefined;

  // Manejo de ID inválido
  useEffect(() => {
    if (id !== "new" && isNaN(parsedId)) {
      toast.error("ID inválido. Redirigiendo...");
      router.push("/dashboard/mantencion/consolidado-equipos");
      setIsInvalidId(true);
    }
  }, [id, parsedId, router]);

  // Data fetching hooks
  const {
    data: responsiblesList = [],
    isLoading: isLoadingResponsibles,
    isError: isErrorResponsibles,
  } = useGetResponsibles();

  const {
    data: shipsList = [],
    isLoading: isLoadingShips,
    isError: isErrorShips,
  } = useShipsQuery();

  // Solo llamar a useGetEquipmentById si estamos en modo "edit"
  const {
    data: equipment,
    isLoading: isLoadingEquipment,
    isError: isErrorEquipment,
    error: errorEquipment,
  } = useGetEquipmentById(equipmentId ?? 0);

  useEffect(() => {
    if (mode === "edit" && isErrorEquipment) {
      toast.error(`Error al cargar equipo: ${errorEquipment?.message}`);
      router.push("/dashboard/mantencion/consolidado-equipos");
    }
  }, [isErrorEquipment, errorEquipment, router, mode]);

  const {
    mutate: createEquipment,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    isPending: isPendingCreate,
  } = useCreateEquipment();

  const {
    mutate: updateEquipment,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    isPending: isPendingUpdate,
  } = useUpdateEquipment();

  // Form setup
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      area: "",
      otherArea: "",
      subarea: "",
      brand: "",
      model: "",
      series: "",
      nave: "",
      responsable: "",
      otherSubarea: "",
      active: true,
      extra: "",
      status: "",
    },
  });

  // Observadores del formulario
  const selectedArea = watch("area");
  const selectedShipId = parseInt(watch("nave") || "0", 10);

  // Fetch areas basadas en el modo
  const {
    data: areaListData,
    isLoading: isLoadingArea,
    isError: isErrorAreaList,
  } = mode === "edit" ? useGetAreaList() : useGetAreasByShip(selectedShipId);

  // Procesamiento de datos para mantener la estructura consistente
  const areaList = useMemo(() => {
    if (isLoadingArea || isErrorAreaList || !areaListData) {
      return { areas: [], subareas: [] };
    }

    if ("uniqueAreas" in areaListData) {
      // Modo edición
      const areas = areaListData.uniqueAreas.map((item) => ({
        area: item.area,
      }));
      const subareas = areaListData.uniqueSubareas.map((item) => ({
        area: item.area,
        subarea: item.subarea,
      }));
      return { areas, subareas };
    } else {
      // Modo creación
      return areaListData;
    }
  }, [areaListData, isLoadingArea, isErrorAreaList]);

  const areaNames = useMemo(
    () => areaList.areas.map((area) => area.area),
    [areaList]
  );

  const uniqueSubareas = useMemo(() => areaList.subareas, [areaList]);

  const filteredSubareas = useMemo(() => {
    return uniqueSubareas
      .filter((subarea) => subarea.area === selectedArea)
      .map((subarea) => subarea.subarea);
  }, [selectedArea, uniqueSubareas]);

  // Reset area y subarea solo en modo creación
  useEffect(() => {
    if (mode === "create") {
      setValue("area", "");
      setValue("subarea", "");
    }
  }, [selectedShipId, setValue, mode]);

  useEffect(() => {
    if (mode === "create") {
      setValue("subarea", "");
    }
  }, [selectedArea, setValue, mode]);

  // Error handling para data fetching
  useEffect(() => {
    if (isErrorResponsibles) {
      toast.error("Error al cargar la lista de responsables");
    }
    if (isErrorShips) {
      toast.error("Error al cargar la lista de naves");
    }
    if (isErrorAreaList) {
      toast.error("Error al cargar las áreas y sistemas");
    }
  }, [isErrorResponsibles, isErrorShips, isErrorAreaList]);

  // Set form values cuando los datos del equipo se cargan (modo edición)
  useEffect(() => {
    if (mode === "edit" && equipment && !isLoadingArea) {
      const formValues: FormData = {
        name: equipment.name || "",
        area: equipment.area || "",
        subarea: equipment.subarea || "",
        brand: equipment.brand || "",
        model: equipment.model || "",
        series: equipment.series || "",
        nave: String(equipment.ship?.id || ""),
        responsable: String(equipment.responsible?.id || ""),
        active: equipment.active ?? true,
        extra: equipment.extra || "",
        status: equipment.status || "",
      };

      reset(formValues);
    }
  }, [mode, equipment, isLoadingArea, reset]);

  // Manejo de éxito o error después de actualizar o crear
  useEffect(() => {
    if (mode === "edit") {
      if (isUpdateSuccess) {
        toast.success("Equipo actualizado correctamente");
        router.push("/dashboard/mantencion/consolidado-equipos");
      } else if (isUpdateError) {
        toast.error("Error al actualizar el equipo");
      }
    } else {
      if (isCreateSuccess) {
        toast.success("Equipo creado correctamente");
        router.push("/dashboard/mantencion/consolidado-equipos");
      } else if (isCreateError) {
        toast.error("Error al crear el equipo");
      }
    }
  }, [
    isUpdateSuccess,
    isUpdateError,
    isCreateSuccess,
    isCreateError,
    router,
    mode,
  ]);

  // Manejo de envío del formulario
  const onSubmit = (data: FormData) => {
    const formattedData = {
      name: data.name,
      area: data.area === "Otra Area" ? data.otherArea || "" : data.area || "",
      subarea:
        data.subarea === "Otro Sistema" ? data.otherSubarea || "" : data.subarea || "",
      brand: data.brand || "",
      model: data.model || "",
      series: data.series || "",
      shipId: parseInt(data.nave || "0", 10),
      responsibleId: parseInt(data.responsable || "0", 10),
      active: data.active ?? true,
      status: data.status,
      extra: data.extra,
    };
    if (mode === "create") {
      createEquipment(formattedData);
      console.log("Formulario enviado:", formattedData);
    } else if (mode === "edit" && equipmentId !== undefined) {
      updateEquipment({ id: equipmentId, data: formattedData });
    }
  };

  // Manejo de cancelación
  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push("/dashboard/mantencion/consolidado-equipos");
  };

  // Renderizado de carga
  if (
    isInvalidId ||
    isLoadingEquipment ||
    isLoadingShips ||
    isLoadingResponsibles ||
    isLoadingArea
  ) {
    return <SkeletonForm />;
  }

  // Verificar permisos
  if (!isAllowed) {
    return <NoPermission />;
  }

  return (
    <Card className="w-full max-w-7xl mx-auto p-6">
      <Tabs defaultValue="form">
        <TabsList className="flex align-middle justify-center mb-4">
          <TabsTrigger value="form" className="mx-2 text-md font-semibold ">
            {mode === "create" ? "Crear Nuevo Equipo" : "Editar Equipo"}
          </TabsTrigger>
          {mode === "edit" && equipmentId !== undefined && (
            <>
              <TabsTrigger
                value="changeLog"
                className="mx-2 text-lg font-semibold"
              >
                Registro de Cambios
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="mx-2 text-lg font-semibold"
              >
                Notificaciones del Equipo
              </TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="w-full"
                    placeholder="Ingrese el nombre del equipo"
                  />
                  {errors.name && (
                    <p className="text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Marca */}
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    {...register("brand")}
                    className="w-full"
                    placeholder="Ejemplo: Samsung, HP, etc."
                  />
                </div>

                {/* Modelo */}
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    {...register("model")}
                    className="w-full"
                    placeholder="Ingrese el modelo del equipo"
                  />
                </div>

                {/* Serie */}
                <div>
                  <Label htmlFor="series">Serie</Label>
                  <Input
                    id="series"
                    {...register("series")}
                    className="w-full"
                    placeholder="Ejemplo: ABC123XYZ"
                  />
                </div>

                {/* Instalación */}
                <div>
                  <Label htmlFor="nave">Instalación</Label>
                  <Controller
                    name="nave"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full border rounded p-2">
                        <option value="">Seleccione una Instalación</option>
                        {shipsList.map((ship: any) => (
                          <option key={ship.id} value={String(ship.id)}>
                            {ship.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.nave && (
                    <p className="text-red-600">{errors.nave.message}</p>
                  )}
                </div>

                {/* Responsable */}
                <div>
                  <Label htmlFor="responsable">Responsable</Label>
                  <Controller
                    name="responsable"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full border rounded p-2">
                        <option value="">Seleccione un Responsable</option>
                        {responsiblesList.map((responsable: Responsible) => (
                          <option
                            key={responsable.id}
                            value={String(responsable.id)}
                          >
                            {responsable.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.responsable && (
                    <p className="text-red-600">{errors.responsable.message}</p>
                  )}
                </div>

                {/* Área */}
                <div>
                  <Label htmlFor="area">Área</Label>
                  <Controller
                    name="area"
                    control={control}
                    render={({ field }) => (
                      <>
                        <select
                          {...field}
                          className="w-full border rounded p-2"
                          disabled={
                            (mode === "create" && !selectedShipId) ||
                            isLoadingArea
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value !== "Otra Area") {
                              setValue("otherArea", "");
                            }
                          }}
                        >
                          <option value="">Seleccione un Área</option>
                          {areaNames.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                          <option value="Otra Area">Otra Área</option>
                        </select>
                        {field.value === "Otra Area" && (
                          <div className="mt-2">
                            <Label htmlFor="otherArea">Nueva Área</Label>
                            <Input
                              id="otherArea"
                              {...register("otherArea")}
                              className="w-full"
                              placeholder="Ingrese una nueva área"
                            />
                            {errors.otherArea && (
                              <p className="text-red-600">
                                {errors.otherArea.message}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  />
                  {errors.area && (
                    <p className="text-red-600">{errors.area.message}</p>
                  )}
                </div>

                {/* Sistema */}
                <div>
                  <Label htmlFor="subarea">Sistema</Label>
                  <Controller
                    name="subarea"
                    control={control}
                    render={({ field }) => (
                      <>
                        <select
                          {...field}
                          className="w-full border rounded p-2"
                          disabled={
                            (mode === "create" && !selectedArea) ||
                            isLoadingArea
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value !== "Otro Sistema") {
                              setValue("otherSubarea", "");
                            }
                          }}
                        >
                          <option value="">Seleccione un Sistema</option>
                          {filteredSubareas.map((subarea) => (
                            <option key={subarea} value={subarea}>
                              {subarea}
                            </option>
                          ))}
                          <option value="Otro Sistema">Otro Sistema</option>
                        </select>
                        {field.value === "Otro Sistema" && (
                          <div className="mt-2">
                            <Label htmlFor="newSubarea">Nuevo Sistema</Label>
                            <Input
                              id="newSubarea"
                              {...register("otherSubarea")}
                              className="w-full"
                              placeholder="Ingrese un nuevo sistema"
                            />
                            {errors.otherSubarea && (
                              <p className="text-red-600">
                                {errors.otherSubarea.message}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  />
                  {errors.subarea && (
                    <p className="text-red-600">{errors.subarea.message}</p>
                  )}
                </div>

                {/* Comentarios */}
                <div>
                  <Label htmlFor="status">Comentarios</Label>
                  <textarea
                    id="status"
                    {...register("status")}
                    className="w-full h-[4rem] resize-y rounded-lg border border-gray-300 p-2"
                    placeholder="Ingrese comentarios adicionales acerca del equipo."
                  ></textarea>
                </div>

                {/* Instrucciones previas */}
                <div>
                  <Label htmlFor="extra">
                    Instrucciones previas a solicitud
                  </Label>
                  <textarea
                    id="extra"
                    {...register("extra")}
                    className="w-full h-[4rem] resize-y rounded-lg border border-gray-300 p-2"
                    placeholder="Aquí puede listar una serie de pasos para que las Instalaciones puedan intentar antes de enviar una solicitud."
                  ></textarea>
                </div>

                {/* Estado activo (solo en modo edición) */}
                {mode === "edit" && (
                  <div className="flex items-center space-x-3">
                    <label
                      htmlFor="active"
                      className="text-gray-700 font-medium"
                    >
                      ¿Está Activo?
                    </label>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-200 transform checked:translate-x-6 border-gray-300"
                          />
                          <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-all duration-200 checked:bg-blue-500"></span>
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                disabled={isPendingUpdate || isPendingCreate}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPendingUpdate || isPendingCreate || !isDirty || !isValid}
              >
                {mode === "create" ? "Crear Equipo" : "Guardar"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        {mode === "edit" && equipmentId !== undefined && (
          <>
            <TabsContent value="changeLog">
              <ChangeLogContent equipmentId={equipmentId} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab equipmentId={equipmentId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </Card>
  );
}
