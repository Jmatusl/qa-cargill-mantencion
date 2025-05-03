import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
//import { any  } from '@prisma/client'
// import { MaintenanceSystem } from '@prisma/client'//
// import { MaintenanceEquipment } from '@prisma/client'
import useMaintenanceStore from "@/store/useMaintenanceStore"; // Importa el store de Zustand
import { useRequestTypesQuery } from "@/hooks/useRequestType";


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "../ui/textarea";
import { MaintenanceDetailSchema } from "@/validations/MaintenanceDetailSchema";

type System = {
  id: number;
  name: string;
};

interface MaintenanceDetailFormProps {
  id: number;
  userId: number;
  systemId: number;
  equipmentId: number;
  faultType: string;
  description: string;
  estimatedSolution?: string | undefined;
  estimatedSolution2?: string | undefined;
  estimatedSolution3?: string | undefined;
  actionsTaken: string;
  status: any;
  maintenanceUserId: number | undefined;
  realSolution?: string | undefined;
  userRole: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const MaintenanceDetailForm: React.FC<MaintenanceDetailFormProps> = ({
  id,
  userId,
  systemId,
  equipmentId,
  faultType,
  description,
  estimatedSolution,
  estimatedSolution2,
  estimatedSolution3,
  actionsTaken,
  status,
  realSolution,
  userRole,
  open,
  setOpen,
}) => {
  const [systems, setSystems] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const { data: requestTypes, isLoading: loadingRequestTypes } = useRequestTypesQuery();


  useEffect(() => {
    const fetchSystemsAndEquipments = async () => {
      try {
        const response = await fetch("/api/systemsAndEquipments");
        if (!response.ok) {
          throw new Error("Failed to fetch systems and equipments");
        }
        const data = await response.json();
        setSystems(data.systems);
        setEquipments(data.equipments);
      } catch (error) {
        console.error("Failed to fetch systems and equipments:", error);
      }
    };

    fetchSystemsAndEquipments();
  }, []);
  const isAdminOrBoss =
    userRole === "GERENTE_OOPP" ||
    userRole === "JEFE_AREA" ||
    userRole === "ADMIN"; //definir como usestate
  const MaintenanceDetailForm = useForm<
    z.infer<typeof MaintenanceDetailSchema>
  >({
    resolver: zodResolver(MaintenanceDetailSchema),
    defaultValues: {
      systemId: systemId || 0,
      equipmentId: equipmentId || 0,
      faultType: faultType || "",
      description: description || "",
      status: "EN_PROCESO", // Cambiar a "PENDIENTE" para que se muestre en la lista de mantenimientos
      estimatedSolution: estimatedSolution
        ? new Date(estimatedSolution)
        : undefined, // Corregido
      actionsTaken: actionsTaken || "",
      maintenanceUserId: userId,
      estimatedSolution2: estimatedSolution2
        ? new Date(estimatedSolution2)
        : undefined, // Corregido
      estimatedSolution3: estimatedSolution3
        ? new Date(estimatedSolution3)
        : undefined, // Corregido
      realSolution: realSolution ? new Date(realSolution) : undefined, // Corregido
    },
  });
  const updateMaintenanceRequest = useMaintenanceStore(
    (state) => state.updateMaintenanceRequest
  );

  const onSubmit = async (
    UpdateData: z.infer<typeof MaintenanceDetailSchema>
  ) => {
    try {
      const requestData = {
        ...UpdateData,
        id: id,
        estimatedSolution: UpdateData.estimatedSolution
          ? UpdateData.estimatedSolution.toISOString()
          : undefined,
        estimatedSolution2: UpdateData.estimatedSolution2
          ? UpdateData.estimatedSolution2.toISOString()
          : undefined,
        estimatedSolution3: UpdateData.estimatedSolution3
          ? UpdateData.estimatedSolution3.toISOString()
          : undefined,
        realSolution: UpdateData.realSolution
          ? UpdateData.realSolution.toISOString()
          : undefined,
        status: UpdateData.status as any,
      };
      const response = await fetch(`/api/maintenanceRequest/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error("Error al enviar el detalle del Mantención");
      }
      console.log("Maintenance details submitted:", requestData);
      updateMaintenanceRequest(id, requestData); // Actualiza el store de Zustand
      MaintenanceDetailForm.reset();
      toast.success("Mantención actualizado correctamente");
      setOpen(false);
    } catch (error) {
      console.error("Error al enviar el detalle del Mantención:", error);
      toast.error("Error al actualizar el Mantención");
    }
  };

  return (
    <Form {...MaintenanceDetailForm}>
      <form
        onSubmit={MaintenanceDetailForm.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>ID de Solicitud de Usuario</FormLabel>
            <Input
              value={userId}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormField
            control={MaintenanceDetailForm.control}
            name="systemId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="systemId" className="col-span-1">
                  Sistema
                </FormLabel>
                <FormControl className="col-span-2">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ? String(field.value) : undefined}
                    disabled={!isAdminOrBoss}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map((system) => (
                        <SelectItem
                          key={system.id}
                          value={system.id.toString()}
                        >
                          {system.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="col-span-3 sm:col-span-2 sm:col-start-2">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={MaintenanceDetailForm.control}
            name="equipmentId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="equipmentId" className="col-span-1">
                  Equipo
                </FormLabel>
                <FormControl className="col-span-2">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ? String(field.value) : undefined}
                    disabled={!isAdminOrBoss}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map((equipment) => (
                        <SelectItem
                          key={equipment.id}
                          value={equipment.id.toString()}
                        >
                          {equipment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="col-span-3 sm:col-span-2 sm:col-start-2">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="faultType"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="faultType" className="col-span-1">
                  Tipo de requerimiento
                </FormLabel>
                <FormControl className="col-span-2">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isAdminOrBoss}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(requestTypes ?? []).map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="col-span-3 sm:col-span-2 sm:col-start-2">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="description">Descripción Síntoma</FormLabel>
                <FormControl>
                  <Controller
                    name="description"
                    control={MaintenanceDetailForm.control}
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        name="description"
                        id="description"
                        placeholder="Ingrese otros detalles..."
                        onChange={onChange}
                        value={value}
                        readOnly={!isAdminOrBoss}
                        className={cn(
                          "w-full rounded-md border border-gray-300 py-2 px-3",
                          !isAdminOrBoss && "bg-gray-100 cursor-not-allowed"
                        )}
                      />
                    )}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="col-span-3">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="estimatedSolution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Estimada de solución</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elegir Fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="actionsTaken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acciones realizadas</FormLabel>
                <FormControl>
                  <Controller
                    name="actionsTaken"
                    control={MaintenanceDetailForm.control}
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        name="actionsTaken"
                        id="actionsTaken"
                        placeholder="Ingrese otros detalles..."
                        onChange={onChange}
                        value={value}
                        className={cn(
                          "w-full rounded-md border border-gray-300 py-2 px-3",
                          !isAdminOrBoss && "bg-gray-100 cursor-not-allowed"
                        )}
                      />
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values({
                        PENDIENTE: "PENDIENTE",
                        EN_PROCESO: "EN_PROCESO",
                        FINALIZADO: "FINALIZADO",
                      }).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}{" "}
                          {/* Reemplaza los guiones bajos con espacios */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="estimatedSolution2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha estimada de Solución 2</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elegir Fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="estimatedSolution3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha estimada de Solución 3</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elegir Fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={MaintenanceDetailForm.control}
            name="realSolution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Real de Solución</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elegir Fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button type="submit" className="w-full sm:w-auto">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaintenanceDetailForm;
