import React from "react";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface ViewMaintenanceProps {
  id: number;
  userRequestId: number;
  userId: number;
  systemId: number;
  equipmentId: number;
  faultType: string;
  description: string;
  estimatedSolution: string | undefined;
  actionsTaken: string;
  status: string;
  maintenanceUserId: number | undefined;
  estimatedSolution2: string | undefined;
  estimatedSolution3: string | undefined;
  realSolution: string | undefined;
  assignedToId: number | undefined;
}

const ViewMaintenanceDetailForm: React.FC<ViewMaintenanceProps> = ({
  id,
  userId,
  systemId,
  equipmentId,
  faultType,
  description,
  estimatedSolution,
  actionsTaken,
  status,
  maintenanceUserId,
  estimatedSolution2,
  estimatedSolution3,
  realSolution,
  assignedToId,
}) => {
  const ViewMaintenanceDetailSchema = z.object({
    systemId: z.number().int().nonnegative(),
    equipmentId: z.number().int().nonnegative(),
    faultType: z.string().nonempty("El tipo de falla es requerido"),
    description: z.string().nonempty("La descripción es requerida"),
    maintenanceUserId: z.number(),
  });

  const ViewMaintenanceDetailForm = useForm<
    z.infer<typeof ViewMaintenanceDetailSchema>
  >({
    resolver: zodResolver(ViewMaintenanceDetailSchema),
    defaultValues: {
      systemId: systemId || 0,
      equipmentId: equipmentId || 0,
      faultType: faultType || "",
      description: description || "",
    },
  });
  const onSubmit = async (
    data: z.infer<typeof ViewMaintenanceDetailSchema>
  ) => {
    try {
      const system = await fetch(
        `/api/maintenanceSystem/${data.systemId}`
      ).then((res) => res.json());
      const equipment = await fetch(
        `/api/maintenanceEquipment/${data.equipmentId}`
      ).then((res) => res.json());

      const requestData = {
        ...data,
        systemName: system?.name || "",
        equipmentName: equipment?.name || "",
        estimatedSolution: estimatedSolution,
        actionsTaken: actionsTaken,
        status: status,
        maintenanceUserId: data.maintenanceUserId,
        estimatedSolution2: estimatedSolution2,
        estimatedSolution3: estimatedSolution3,
        realSolution: realSolution,
        assignedToId: assignedToId,
      };

      const response = await fetch(`/api/maintenanceRequest?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el reporte de falla");
      }

      // Manejar la actualización exitosa
      console.log("Reporte de falla actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el reporte de falla:", error);
    }
  };

  return (
    <Form {...ViewMaintenanceDetailForm}>
      <form
        onSubmit={ViewMaintenanceDetailForm.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Folio Falla</FormLabel>
            <Input
              value={userId}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Sistema</FormLabel>
            <FormControl>
              <Input
                {...ViewMaintenanceDetailForm.register("systemId")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </FormControl>
            <FormMessage>
              {ViewMaintenanceDetailForm.formState.errors.systemId?.message}
            </FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel>Equipo</FormLabel>
            <FormControl>
              <Input
                {...ViewMaintenanceDetailForm.register("equipmentId")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </FormControl>
            <FormMessage>
              {ViewMaintenanceDetailForm.formState.errors.equipmentId?.message}
            </FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel>Tipo de Falla</FormLabel>
            <FormControl>
              <Input
                {...ViewMaintenanceDetailForm.register("faultType")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </FormControl>
            <FormMessage>
              {ViewMaintenanceDetailForm.formState.errors.faultType?.message}
            </FormMessage>
          </FormItem>
          <FormItem className="md:col-span-2">
            <FormLabel>Descripción Síntoma</FormLabel>
            <FormControl>
              <Input
                {...ViewMaintenanceDetailForm.register("description")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </FormControl>
            <FormMessage>
              {ViewMaintenanceDetailForm.formState.errors.description?.message}
            </FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel>Fecha Estimada de Solución</FormLabel>
            <Input
              value={estimatedSolution ?? ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Acciones Realizadas</FormLabel>
            <Input
              value={actionsTaken}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Input
              value={status}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>ID de Usuario de Mantención</FormLabel>
            <Input
              value={maintenanceUserId}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Fecha Estimada de Solución 2</FormLabel>
            <Input
              value={estimatedSolution2 ?? ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Fecha Estimada de Solución 3</FormLabel>
            <Input
              value={estimatedSolution3 ?? ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
          <FormItem>
            <FormLabel>Fecha Real de Solución</FormLabel>
            <Input
              value={realSolution ?? ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormItem>
        </div>
      </form>
    </Form>
  );
};

export default ViewMaintenanceDetailForm;
