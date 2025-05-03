import React from "react";

interface BatteryMeterProps {
  percentage: number;
  daysElapsed?: number; // Ahora opcional
  daysRemaining?: number; // Ahora opcional
}

const BatteryMeter: React.FC<BatteryMeterProps> = ({
  percentage,
  daysElapsed = 0,
  daysRemaining = 0,
}) => {
  const getBgColorClass = (daysElapsed: number, daysRemaining: number): string => {
    const totalDays = daysElapsed + daysRemaining;

    if (totalDays === 0) return "bg-gray-400"; // Caso especial: Sin fechas asignadas
    const progress = daysElapsed / totalDays;

    if (progress >= 1) return "bg-red-500"; // Se ha completado
    if (progress >= 0.66) return "bg-yellow-400"; // Más de dos tercios del tiempo
    if (progress >= 0.33) return "bg-green-500"; // Más de un tercio del tiempo
    return "bg-blue-500"; // Menos de un tercio del tiempo
  };

  const bgColorClass = getBgColorClass(daysElapsed, daysRemaining);

  return (
    <div className="relative w-full bg-gray-200 rounded-full h-6 mb-4">
      {daysElapsed + daysRemaining > 0 ? (
        <>
          {/* Parte llena de la barra */}
          <div
            className={`h-6 rounded-full ${bgColorClass} flex items-center pl-2`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <span className="text-xs font-semibold text-gray-700">
              {daysElapsed} Días Transcurridos
            </span>
          </div>
          {/* Texto de días restantes */}
          {percentage < 100 && (
            <div className="absolute inset-0 flex items-center justify-end pr-2">
              <span className="text-xs font-semibold text-gray-700">
                {daysRemaining} Días Restantes
              </span>
            </div>
          )}
        </>
      ) : (
        // Caso especial: Sin fechas asignadas
        <div className="flex items-center justify-center h-6 text-gray-500">
          <span className="text-sm font-semibold">Sin fecha asignada</span>
        </div>
      )}
    </div>
  );
};

export default BatteryMeter;
