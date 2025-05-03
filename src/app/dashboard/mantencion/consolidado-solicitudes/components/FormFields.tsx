// components/FormFields.tsx
import React from "react";
import { Controller } from "react-hook-form";
import EditableSelect from "./EditableSelect";
import InfoItem from "./InfoItem";
import { AlertTriangleIcon, UserIcon, Wrench } from "lucide-react";
import { statuses } from "../data/data";
import { useRequestTypesQuery } from "@/hooks/useRequestType";


interface FormFieldsProps {
  data?: any;
  watch: any;
  register: any;
  setValue: any;
  errors: any;
  responsiblesList: any[];
  editButtons: boolean;
  control: any;
}

const FormFields: React.FC<FormFieldsProps> = (
  {
  data,
  watch,
  register,
  setValue,
  errors,
  responsiblesList,
  editButtons,
  control,
}) => {
  const { data: requestTypes, isLoading: loadingRequestTypes } = useRequestTypesQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoItem
        label="Equipo"
        value={data?.equipment.name}
        icon={<Wrench className="h-5 w-5 text-blue-500" />}
      />
      <Controller
        name="faultType"
        control={control}
        render={({ field }) => (
          <EditableSelect
            label="Tipo de Requerimiento"
            value={field.value || ""}
            options={(requestTypes ?? []).map((type) => ({
              value: type.name,
              label: type.name,
            }))}            
            onChange={field.onChange}
            error={errors.faultType?.message}
            icon={<AlertTriangleIcon className="h-5 w-5 text-yellow-500" />}
            status={watch("status") || ""}
          />
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <EditableSelect
            label="Estado"
            value={field.value || ""}
            options={statuses.map((status) => ({
              value: status.value,
              label: status.label,
            }))}
            onChange={field.onChange}
            error={errors.status?.message}
            status={field.value || ""}
          />
        )}
      />
      <Controller
        name="responsibleId"
        control={control}
        render={({ field }) => (
          <EditableSelect
            label="Responsable"
            value={field.value?.toString() || ""}
            options={responsiblesList.map((resp: any) => ({
              value: resp.id.toString(),
              label: resp.name,
            }))}
            onChange={(value) => field.onChange(parseInt(value, 10))}
            error={errors.responsibleId?.message}
            icon={<UserIcon className="h-5 w-5 text-blue-500" />}
            status={watch("status") || ""}
          />
        )}
      />
    </div>
  );
};

export default React.memo(FormFields);
