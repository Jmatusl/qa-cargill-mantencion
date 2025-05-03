import {
  CalendarIcon,
  ClipboardListIcon,
  ClockIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statuses } from "../../consolidado-solicitudes/data/data";

import React, { memo } from "react";
import Modal from "@/components/Modal";
import MaintenanceRequestForm from "../../consolidado-solicitudes/components/ContentModal";

function ExistingFailures({ maintenanceList }: any): JSX.Element {
  const getStatusInfo = (status: "SOLICITADO" | "EN_PROCESO") => {
    return statuses.find((s) => s.value === status) || statuses[0];
  };

  return (
    <div className="space-y-4">
      {maintenanceList.toReversed().map((maintenance: any) => {

        const possibleSolutionDate = maintenance.estimatedSolutions?.[0]?.date;
        const statusInfo = getStatusInfo(maintenance.status);

        return (
          <li
            key={maintenance.id}
            className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <h3
                  className="text-lg font-semibold text-gray-800 flex items-center"
                  title={maintenance.description} // Tooltip con la descripción completa
                >
                  <Modal
                    trigger={
                      <button
                        onClick={() => console.log(maintenance)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full p-1 mr-2"
                      >
                        <WrenchIcon className="w-5 h-5 text-blue-500" />
                      </button>
                    }
                    data={maintenance}
                  >
                    <MaintenanceRequestForm setOpen={() => {}} />
                  </Modal>
                  {maintenance.description.length > 50
                    ? `${maintenance.description.substring(0, 50)}...`
                    : maintenance.description}
                </h3>
                <Badge variant="outline" className="flex items-center">
                  {React.createElement(statusInfo.icon, {
                    className: "w-4 h-4 mr-2",
                  })}
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                <p className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                  Creado: {new Date(maintenance.createdAt).toLocaleString()}
                </p>
                {possibleSolutionDate && (
                  <p className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                    Posible solución:{" "}
                    {new Date(possibleSolutionDate).toLocaleString()}
                  </p>
                )}
                <p className="flex items-center">
                  <WrenchIcon className="w-4 h-4 mr-1 text-gray-400" />
                  Tipo de requerimiento: {maintenance.faultType}
                </p>
                {maintenance.responsible && (
                  <p className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
                    Responsable: {maintenance.responsible.name}
                  </p>
                )}
                {maintenance.folio && (
                  <p className="flex items-center">
                    <ClipboardListIcon className="w-4 h-4 mr-1 text-gray-400" />
                    Folio: {maintenance.folio}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </div>
  );
}

export default memo(ExistingFailures);
