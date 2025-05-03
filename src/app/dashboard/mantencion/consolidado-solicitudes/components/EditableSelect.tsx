// components/EditableSelect.tsx
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import useUserRoles from "@/hooks/useUserRoles";

interface Option {
  value: string;
  label: string;
  // Eliminamos la propiedad 'icon' ya que no se utilizará en las opciones
}

interface EditableSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode; // Este icono se mostrará junto al label y al valor seleccionado
  status: string;
}

const EditableSelect: React.FC<EditableSelectProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  icon,
  status,
}) => {
  const { isAllowed } = useUserRoles([3, 4, 7, 8]);

  const selectedOption = options.find((option) => option.value === value);

  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    if (isAllowed && status !== "COMPLETADO" && status !== "CANCELADO") {
      setIsEditing(!isEditing);
    }
  };

  return (
    <div className="relative bg-gray-50 p-3 rounded-lg w-full">
      <p className="text-xs md:text-sm text-gray-500 mb-2">{label}</p>
      {isEditing && isAllowed ? (
        <>
          <Select onValueChange={onChange} defaultValue={value}>
            <SelectTrigger className="w-full flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <SelectValue
                placeholder={`Selecciona un ${label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-blue-500">{icon}</span>}
            <span className="font-semibold text-sm md:text-base">
              {selectedOption?.label || "No asignado"}
            </span>
          </div>
        </div>
      )}
      {isAllowed && status !== "COMPLETADO" && status !== "CANCELADO" && (
        <span
          onClick={handleToggleEdit}
          className={`absolute top-3 right-3 cursor-pointer ${
            isEditing
              ? "scale-125 filter drop-shadow-[0_0_4px_rgb(96,165,250)]"
              : ""
          }`}
        >
          <Pencil
            className={`h-4 w-4 ${
              isEditing ? "text-blue-600" : "text-slate-600"
            }`}
          />
        </span>
      )}
    </div>
  );
};

export default EditableSelect;
