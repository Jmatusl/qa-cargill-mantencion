import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NewReportSchema } from "@/validations/NewReportSchema"

type MaintenanceSystem = {
  id: number;
  name: string;
};

type MaintenanceEquipment = {
  id: number;
  name: string;
  systemId: number;
};

type MaintenanceRequestData = {
  systemId: number;
  equipmentId: number;
  faultType: string;
  description: string;
};

function NewReportForm({
  userId,
  open,
  setOpen,
}: {
  userId: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [systems, setSystems] = useState<MaintenanceSystem[]>([]);
  const [equipments, setEquipments] = useState<MaintenanceEquipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<MaintenanceEquipment[]>([]);
  
  const ReportForm = useForm<z.infer<typeof NewReportSchema>>({
    resolver: zodResolver(NewReportSchema),
    defaultValues: {
      systemId: 0,
      equipmentId: 0,
      faultType: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchSystemsAndEquipments = async () => {
      try {
        const systemsResponse = await fetch("/api/maintenanceSystem");
        const systemsData = await systemsResponse.json();
        setSystems(systemsData);

        const equipmentsResponse = await fetch("/api/maintenanceEquipment");
        const equipmentsData = await equipmentsResponse.json();
        setEquipments(equipmentsData);
      } catch (error) {
        console.error("Error al cargar sistemas y equipos:", error);
      }
    };

    fetchSystemsAndEquipments();
  }, []);

  const handleSystemChange = (systemId: string) => {
    const systemIdNumber = parseInt(systemId, 10);
    ReportForm.setValue("systemId", systemIdNumber);
    const filtered = equipments.filter((equipment) => equipment.systemId === systemIdNumber);
    setFilteredEquipments(filtered);
  };
  const onSubmit = async (data: MaintenanceRequestData) => {
    try {
      const requestData = {
        ...data,
        maintenanceUserId: userId,
        systemId: ReportForm.getValues('systemId'), // Agrega systemId al objeto requestData
        equipmentId: ReportForm.getValues('equipmentId'), // Agrega equipmentId al objeto requestData
      };
      const response = await fetch("/api/maintenanceRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el reporte de requerimiento");
      }

      toast.success("Reporte de requerimiento enviado correctamente");
      ReportForm.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error("Hubo un problema al enviar el reporte de requerimiento");
    }
  };

  

  return (
    <Form {...ReportForm}>
      <form onSubmit={ReportForm.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={ReportForm.control}
            name="systemId"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 items-center">
                <FormLabel htmlFor="systemId" className="col-span-1">
                  Sistema
                </FormLabel>
                <FormControl className="col-span-2">
                  <Select onValueChange={(value) => handleSystemChange(value)} value={field.value.toString()}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map((system) => (
                        <SelectItem key={system.id} value={system.id.toString()}>
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
            control={ReportForm.control}
            name="equipmentId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="equipment" className="col-span-1">
                  Equipo
                </FormLabel>
                <FormControl className="col-span-2">
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    value={field.value.toString()}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEquipments.map((equipment) => (
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
            control={ReportForm.control}
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
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinaria">Falla Ordinaria</SelectItem>
                      <SelectItem value="equipo">Falla Equipo</SelectItem>
                      <SelectItem value="operativa">Falla Operativa</SelectItem>
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
            control={ReportForm.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 sm:col-span-3">
                <FormLabel htmlFor="description">Descripción Síntoma</FormLabel>
                <FormControl>
                  <Controller
                    name="description"
                    control={ReportForm.control}
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        name="description"
                        id="description"
                        placeholder="Ingrese otros detalles..."
                        onChange={onChange}
                        value={value}
                        className="w-full rounded-md border border-gray-300 py-2 px-3"
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
          <FormItem className="col-span-1 sm:col-span-3 flex justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Guardar
            </Button>
          </FormItem>
        </div>
      </form>
    </Form>
  );
}

export default NewReportForm;
