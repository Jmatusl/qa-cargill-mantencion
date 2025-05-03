"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Paperclip } from "lucide-react";

// UI imports
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TailSpin } from "react-loader-spinner";
import { Combobox } from "@/components/Combobox";
import { Separator } from "@/components/ui/separator";
import { useRequestTypesQuery } from "@/hooks/useRequestType";


// Icons
import {
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchIcon,
  UserIcon,
  ClipboardListIcon,
} from "lucide-react";

// Importa tu hook
import useMaintenanceRequest from "./useMaintenanceRequest";
import EquipmentCard from "./components/EquipmentCard";
import EquipmentExtra from "./components/EquipmentExtra";
import ExistingFailures from "./components/ExistingFailures";

// Hook para obtener requests previas
import { useGetEquipmentById } from "@/hooks/useQueriesEquipment";

//
// 1. Esquema de validación (Zod)
const maintenanceSchema = z.object({
  subarea: z.string({ message: "El sistema es obligatorio" }),
  equipment: z.string({ message: "El equipo es obligatorio" }),
  faultType: z
    .string({ message: "El tipo de requerimiento es obligatorio" })
    .nonempty("El tipo de requerimiento es obligatorio"),
  description: z
    .string({ message: "La descripción es obligatoria" })
    .max(300, {
      message: "La descripción no puede superar los 300 caracteres",
    })
    .min(1, { message: "La descripción no puede estar vacía" }),
  equipment_id: z.number().int().nonnegative().optional(),
  shipId: z.number().int().nonnegative().optional(),
  responsibleId: z.number().int().nonnegative().optional(),
});

const TypeFailure = {
  Falla_Ordinaria: "Ordinaria",
  Falla_Equipo: "Equipo",
  Falla_Operativa: "Operativa",
  Mantencion_Programada: "Mantención Programada",
};

interface MaintenanceFormValues {
  subarea: string;
  equipment: string;
  faultType: string;
  description: string;
  shipId: number;
  equipment_id: number;
  responsibleId: number;
}

// Función para transformar la imagen en el cliente
// Se redimensiona la imagen a un ancho/alto máximo (por defecto 1024x768)
const transformImage = (file: File, maxWidth = 1024, maxHeight = 768): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas no soportado"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Error al convertir a Blob"));
          return;
        }
        // Se crea un nuevo File a partir del Blob, conservando el nombre original
        const transformedFile = new File([blob], file.name, { type: file.type });
        resolve(transformedFile);
      }, file.type);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

const MaintenanceRequestCard: React.FC = () => {
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    reset,
    watch,
    clearErrors,
    resetField,
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      subarea: "",
      equipment: "",
      faultType: "",
      description: "",
      shipId: 0,
      equipment_id: 0,
      responsibleId: 0,
    },
  });

  // Lógica del hook
  const {
    userData,
    isFetching,
    isCreated,
    mutateError,
    isCreating,
    shipsError,
    subAreasError,
    equipmentsError,
    shipsLoading,
    subAreasLoading,
    equipmentsLoading,
    selectedShip,
    selectedSubarea,
    selectedEquipment,
    setSelectedEquipment,
    setSelectedSubarea,
    filteredSubAreas,
    filteredEquipments,
    ships,
    createMaintenanceRequest,
    setSelectedShip,
    setIsModalOpen,
    isModalOpen,
    rol,
    descriptionLength,
    handleSubareaChange,
    handleEquipmentChange,
  } = useMaintenanceRequest({
    reset,
    setValue,
    clearErrors,
    watch,
    resetField,
  });

  // Obtener fallas existentes del equipo
  const { data: equipmentData, isLoading: maintenanceLoading } =
    useGetEquipmentById(selectedEquipment?.id ?? null);
  const maintenanceList = equipmentData?.requests || [];
  const { data: requestTypes, isLoading: requestTypesLoading } = useRequestTypesQuery();


  // Mostrar/ocultar fallas existentes
  const [showFallas, setShowFallas] = useState(false);
  const fallasSectionRef = useRef<any>(null);

  const [equipmentSearch, setEquipmentSearch] = useState("");

  const filteredEquipmentsBySearch = useMemo(() => {
    if (!equipmentSearch) return filteredEquipments;
    const lowerSearch = equipmentSearch.toLowerCase();
    return filteredEquipments.filter((eq) => {
      return (
        eq.name.toLowerCase().includes(lowerSearch) ||
        eq.brand.toLowerCase().includes(lowerSearch) ||
        eq.model.toLowerCase().includes(lowerSearch)
      );
    });
  }, [filteredEquipments, equipmentSearch]);

  const onSubmit = async (data: MaintenanceFormValues) => {
    let photoUploads: { url: string; publicId: string }[] = [];

    if (selectedFiles.length > 0) {
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("files", file));
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Error al subir imágenes");
        const body = await res.json();
        photoUploads = body.data; // [{ url, publicId }, …]
      } catch (err) {
        console.error(err);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Llamamos a la mutación pasando **array** de URLs
    createMaintenanceRequest({
      ...data,
      users: [userData!.id],
      photos: photoUploads.map(u => ({ url: u.url, publicId: u.publicId })),
    });
  };


  useEffect(() => {
    if (showFallas && fallasSectionRef.current) {
      fallasSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showFallas]);

  useEffect(() => {
    setShowFallas(false);
  }, [selectedShip, selectedEquipment]);

  const handleToggleFallas = () => {
    setShowFallas((prev) => !prev);
  };

  const fallasIcon = showFallas ? (
    <ChevronUp className="h-4 w-4 inline-block ml-1" />
  ) : (
    <ChevronDown className="h-4 w-4 inline-block ml-1" />
  );

  const tooltipMessage = `Existen ${maintenanceList?.length} fallas registradas. 
  Revise si alguna es igual a la que planea ingresar para evitar duplicados.`;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Dialog: confirmación/info extra */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirme si intentó:</DialogTitle>
          </DialogHeader>
          <DialogDescription>{selectedEquipment?.extra}</DialogDescription>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card principal */}
      <Card className="w-full bg-gray-100 shadow-lg border border-gray-300">
        {/* Encabezado con fondo azul */}
        <CardHeader className="bg-[#284893] text-white">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-2xl font-bold">
              Ingreso Nuevo Requerimiento
            </CardTitle>
            <div className="flex flex-row items-center space-x-2">
              <Select
                value={selectedShip?.id?.toString() || undefined}
                onValueChange={(value) => {
                  if (rol === "ADMIN") {
                    const ship = ships?.find((sh) => sh.id === parseInt(value));
                    setSelectedShip(ship || null);
                    setValue("shipId", ship?.id || 0);

                    resetField("subarea");
                    resetField("equipment");
                    if (selectedSubarea) setSelectedSubarea(null);
                    if (selectedEquipment) setSelectedEquipment(null);
                  }
                }}
                disabled={rol === "INSTALACION"}
              >
                <SelectTrigger className="w-[200px] bg-white text-[#284893]">
                  <SelectValue placeholder="Seleccionar Instalación" />
                </SelectTrigger>
                <SelectContent>
                  {(ships || [])
                    .filter((sh) => sh.id && sh.name)
                    .map((sh) => (
                      <SelectItem key={sh.id} value={sh.id.toString()}>
                        {sh.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <TailSpin
                visible={isFetching}
                height="30"
                width="30"
                color="#ffffff"
                ariaLabel="tail-spin-loading"
                radius="1"
              />
            </div>
          </div>
        </CardHeader>

        {/* Contenido principal */}
        <CardContent className="mt-4">
          {selectedEquipment &&
            !maintenanceLoading &&
            maintenanceList?.length > 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded-sm text-sm flex items-center justify-between w-full max-w-4xl mb-4">
                <span>
                  ¡Atención! Existen ya {maintenanceList.length} fallas para este equipo.
                </span>
                <button
                  onClick={handleToggleFallas}
                  className="text-blue-600 hover:underline ml-2 text-sm flex items-center"
                  title={tooltipMessage}
                >
                  {showFallas ? "Ver menos" : "Ver más"} {fallasIcon}
                </button>
              </div>
            )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="subarea" className="text-[#284893]">
                  Sistema
                </Label>
                <Controller
                  name="subarea"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={
                        filteredSubAreas?.map((sa: any) => ({
                          value: sa.subarea,
                          label: sa.subarea,
                        })) || []
                      }
                      value={field.value}
                      placeholder="Seleccionar"
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (!value) {
                          setSelectedSubarea(null);
                          setSelectedEquipment(null);
                          setValue("equipment", "");
                          setValue("equipment_id", 0);
                          return;
                        }
                        handleSubareaChange(value);
                      }}
                      disabled={subAreasLoading || !selectedShip}
                    />
                  )}
                />
                {errors.subarea && (
                  <p className="text-red-500 text-sm">
                    {String(errors.subarea?.message || "")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="equipment" className="text-[#284893]">
                  Equipo
                </Label>
                <Controller
                  name="equipment"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={filteredEquipmentsBySearch.map((eq: any) => ({
                        value: `${eq.name} - ${eq.brand} - ${eq.model} (${eq.subarea})`,
                        label: `${eq.name} - ${eq.brand} - ${eq.model} (${eq.subarea})`,
                      }))}
                      value={field.value}
                      placeholder="Seleccionar equipo"
                      onValueChange={(selectedText) => {
                        if (!selectedText) {
                          field.onChange("");
                          setSelectedEquipment(null);
                          setValue("equipment_id", 0);
                          setSelectedSubarea(null);
                          setValue("subarea", "");
                          return;
                        }
                        field.onChange(selectedText);
                        const eqFound = filteredEquipmentsBySearch.find(
                          (eq: any) =>
                            `${eq.name} - ${eq.brand} - ${eq.model} (${eq.subarea})` ===
                            selectedText
                        );
                        if (eqFound) {
                          setSelectedEquipment(eqFound);
                          setValue("equipment_id", eqFound.id);
                          setValue(
                            "responsibleId",
                            eqFound.responsibleId ?? 0
                          );
                          setValue("subarea", eqFound.subarea);
                          setSelectedSubarea(eqFound.subarea);
                        }
                      }}
                      disabled={equipmentsLoading || !selectedShip}
                    />
                  )}
                />
                {errors.equipment && (
                  <p className="text-red-500 text-sm">
                    {String(errors.equipment?.message || "")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <Label htmlFor="faultType" className="text-[#284893]">
                  Tipo de Requerimiento
                </Label>
                <Controller
                  name="faultType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={requestTypesLoading}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            <div className="text-sm font-semibold">{type.name}</div>
                          </SelectItem>
                        ))}

                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.faultType && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.faultType?.message || "")}
                  </p>
                )}
              </div>

              {(requestTypes ?? []).length > 0 && (
                <div className="hidden md:block mt-2 ml-0 md:ml-4">
                  <table className="table-auto w-full text-sm border border-gray-200">
                    <tbody>
                      {(requestTypes ?? []).map((type) => (
                        <tr key={type.id} className="border-b border-gray-200">
                          <td className="px-2 py-2 font-medium">{type.name}</td>
                          <td className="px-2 py-2 text-xs">{type.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}


            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#284893]">
                {`Descripción del Síntoma (${descriptionLength}/300 caracteres)`}
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Descripción detallada"
                    maxLength={300}
                    {...field}
                    disabled={isCreating}
                    className="min-h-[100px]"
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {String(errors.description?.message || "")}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="photos" className="text-[#284893]">
                Fotos adjuntas (opcional)
              </Label>

              {/* Input oculto para seleccionar múltiples imágenes */}
              <input
                type="file"
                id="photos"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.currentTarget.files;
                  if (!files) return;  // sale si es null
                  setSelectedFiles(prev => [
                    ...prev,
                    ...Array.from(files)  // ahora files es FileList, no null
                  ]);
                  e.currentTarget.value = ""; // para permitir re-seleccionar mismos nombres
                }}
              />


              {/* Botón para disparar el selector de archivos */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-max"
              >
                <Paperclip className="mr-1 h-4 w-4" /> Adjuntar fotos ({selectedFiles.length})
              </Button>

              {/* Lista de archivos seleccionados con botón para eliminar cada uno */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1 pt-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-800 truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() =>
                          setSelectedFiles(files =>
                            files.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Botón de submit */}
            <Button
              type="submit"
              className="w-full bg-[#284893] hover:bg-[#1c3366] text-white"
              disabled={
                isUploadingImage ||
                isCreating ||
                !isValid ||
                !isDirty ||
                !watch("shipId") ||
                !watch("subarea") ||
                !watch("equipment") ||
                !watch("faultType") ||
                !watch("description")
              }
            >
              {isUploadingImage
                ? "Cargando Imagen"
                : isCreating
                  ? "Creando..."
                  : "Crear"}
            </Button>
            {mutateError && (
              <div className="text-red-500 text-sm mt-2">
                Error al crear la solicitud
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {selectedEquipment && (
        <Card className="w-full bg-white shadow-lg border border-black">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#284893]">
              Información del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentExtra extra={selectedEquipment.extra} />
            <Separator className="my-4" />
            <EquipmentCard selectedEquipment={selectedEquipment} />
          </CardContent>
        </Card>
      )}

      {showFallas && maintenanceList?.length > 0 && (
        <Card className="w-full bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-[#284893]">
              Fallas Existentes
            </CardTitle>
            <Button
              onClick={handleToggleFallas}
              variant="outline"
              className="text-[#284893]"
            >
              {showFallas ? "Ocultar" : "Mostrar"} {fallasIcon}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{tooltipMessage}</p>
            <ul className="space-y-4" ref={fallasSectionRef}>
              <ExistingFailures maintenanceList={maintenanceList} />
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceRequestCard;
