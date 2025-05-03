// components/SolutionDates.tsx
import React, { useMemo } from "react";
import DateItem from "@/app/dashboard/mantencion/consolidado-solicitudes/components/DateItem";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SolutionDatesProps {
  createdAt: string | Date; // Actualizado para aceptar string o Date
  realSolution?: Date | null;
  estimatedSolutionDates: Date[];
  data?: any;
  showPreviousDates: boolean;
  setShowPreviousDates: React.Dispatch<React.SetStateAction<boolean>>;
  showEstimatedDates: boolean;
  setShowEstimatedDates: React.Dispatch<React.SetStateAction<boolean>>;
}

const SolutionDates: React.FC<SolutionDatesProps> = ({
  createdAt,
  realSolution,
  estimatedSolutionDates,
  data,
  showPreviousDates,
  setShowPreviousDates,
  showEstimatedDates,
  setShowEstimatedDates,
}) => {
  // Memorizar los formatos de fechas para evitar recalculaciones
  const formattedCreatedAt = useMemo(() => {
    return format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: es });
  }, [createdAt]);

  const formattedRealSolution = useMemo(() => {
    if (realSolution) {
      return format(new Date(realSolution), "dd/MM/yyyy", { locale: es });
    }
    return "";
  }, [realSolution]);

  const formattedEstimatedDates = useMemo(() => {
    return estimatedSolutionDates.map((date) =>
      format(date, "dd/MM/yyyy", { locale: es })
    );
  }, [estimatedSolutionDates]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Fecha de Ingreso */}
      <DateItem
        label="Fecha de Ingreso"
        value={formattedCreatedAt}
        className="bg-gray-50"
      />

      {/* Fecha de Solución Real o Fecha Estimada de Solución */}
      <div className="relative">
        {data?.status === "COMPLETADO" && realSolution ? (
          <div>
            <DateItem
              label="Fecha de Solución Real"
              value={formattedRealSolution}
              className="bg-gray-50 text-lg"
            />
            {formattedEstimatedDates.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowEstimatedDates(!showEstimatedDates)}
                  className="flex items-center text-blue-500 underline mt-2 transition-all duration-300"
                >
                  {showEstimatedDates
                    ? "Ocultar fechas estimadas"
                    : "Ver fechas estimadas"}
                  <ChevronDown
                    className={`ml-1 transition-transform duration-300 ${
                      showEstimatedDates ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {showEstimatedDates && (
                  <div className="mt-2">
                    {formattedEstimatedDates.map((formattedDate, index) => (
                      <DateItem
                        key={index}
                        label={`Fecha Estimada ${index + 1}`}
                        value={formattedDate}
                        className="bg-gray-50 text-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : formattedEstimatedDates.length > 0 ? (
          <div>
            <DateItem
              label="Fecha Estimada de Solución"
              value={formattedEstimatedDates[0]}
              className="bg-gray-50 text-lg"
            />
            {formattedEstimatedDates.length > 1 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreviousDates(!showPreviousDates)}
                  className="flex items-center text-blue-500 underline mt-2 transition-all duration-300"
                >
                  {showPreviousDates
                    ? "Ocultar fechas anteriores"
                    : "Ver fechas anteriores"}
                  <ChevronDown
                    className={`ml-1 transition-transform duration-300 ${
                      showPreviousDates ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {showPreviousDates && (
                  <div className="mt-2">
                    {formattedEstimatedDates.slice(1).map((formattedDate, index) => (
                      <DateItem
                        key={index}
                        label={`Fecha Estimada Anterior ${index + 1}`}
                        value={formattedDate}
                        className="bg-gray-50 text-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <DateItem
            label="Fecha Estimada de Solución"
            value="No definida"
            className="bg-gray-50"
          />
        )}
      </div>
    </div>
  );
};

// Memorizar el componente para evitar renders innecesarios
export default React.memo(SolutionDates);
