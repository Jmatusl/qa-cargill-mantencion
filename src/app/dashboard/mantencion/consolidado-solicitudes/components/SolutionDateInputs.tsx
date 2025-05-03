// components/SolutionDateInputs.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Controller } from "react-hook-form";

interface SolutionDateInputsProps {
  newSolutionDates: string[];
  setNewSolutionDates: React.Dispatch<React.SetStateAction<string[]>>;
  addSolutionDate: () => void;
  editButtons: boolean;
  data?: any;
  dateAdded: boolean;
  control: any; 
}

const SolutionDateInputs: React.FC<SolutionDateInputsProps> = ({
  newSolutionDates,
  setNewSolutionDates,
  addSolutionDate,
  editButtons,
  data,
  dateAdded,
  control, 
}) => {
  return (
    <div className="flex flex-col items-center mt-4">
      {newSolutionDates.map((date, index) => (
        <div
          key={index}
          className="flex flex-col space-y-1 items-center"
        >
          <label className="text-sm font-medium text-gray-500">
            Nueva Fecha Estimada
          </label>
          <Controller
            name={`newSolutionDates.${index}`}
            control={control}
            defaultValue={date}
            render={({ field }) => (
              <Input
                type="date"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setNewSolutionDates((prevDates) => {
                    const newDates = [...prevDates];
                    newDates[index] = e.target.value;
                    return newDates;
                  });
                }}
                className="bg-gray-50 p-2 rounded-lg w-64"
              />
            )}
          />
        </div>
      ))}
      {editButtons &&
        !dateAdded &&
        data?.status !== "COMPLETADO" &&
        data?.status !== "CANCELADO" &&
        (data?.estimatedSolutions?.length || 0) +
          newSolutionDates.length <
          3 && (
        <Button
          type="button"
          onClick={addSolutionDate}
          className="bg-blue-500 text-white hover:bg-blue-600 transition-colors mt-4 px-4 py-2"
        >
          {Array.isArray(data?.estimatedSolutions) &&
          data?.estimatedSolutions?.length > 0
            ? "Agregar Fecha"
            : "Crear Fecha "}
        </Button>
      )}
    </div>
  );
};

// Memorizar el componente para evitar renders innecesarios
export default React.memo(SolutionDateInputs);
