// src/components/ChangeLogModal.tsx
import React, { useMemo } from "react";
import { useGetEquipmentChangeLog } from "@/hooks/useQueriesEquipment";
import { useGetResponsibles } from "@/hooks/UseQueriesMaintenance";
import { useShipsByIds } from "@/hooks/useShipsQuery";
import { ChangeRecord, Change } from "@/types/EquipmentType"; // Ajusta la ruta según corresponda
import { Responsible } from "@prisma/client"; // Importa el tipo Responsible
import { TabsContent } from "@radix-ui/react-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationsTab } from "./NotificationsTab";
import { formatTime24 } from "../../../../../../utils/dateUtils";

type ChangeLogModalProps = {
  equipmentId: number;
  isOpen: boolean;
  onClose: () => void;
};

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({
  equipmentId,
  isOpen,
  onClose,
}) => {
  const {
    data: changeLog,
    isLoading: isLoadingChangeLog,
    error: changeLogError,
  } = useGetEquipmentChangeLog(equipmentId, {
    enabled: isOpen,
  });

  // Obtener todos los responsables
  const {
    data: responsibles,
    isLoading: isLoadingResponsibles,
    error: responsiblesError,
  } = useGetResponsibles();

  // Extraer todos los shipIds únicos del changeLog
  const shipIds = useMemo(() => {
    if (!changeLog) return [];
    const ids = changeLog.flatMap((record) =>
      record.changes
        .filter((change) => change.field === "shipId")
        .map((change) => Number(change.newValue))
    );
    return Array.from(new Set(ids));
  }, [changeLog]);

  // Obtener las naves por sus IDs
  const {
    data: shipsData,
    isLoading: isLoadingShips,
    error: shipsError,
  } = useShipsByIds(shipIds);

  // Crear un mapa de responsables
  const responsiblesMap = useMemo(() => {
    const map: Record<number, string> = {};
    responsibles?.forEach((responsible: Responsible) => {
      // Tipar el parámetro
      map[responsible.id] = responsible.name;
    });
    return map;
  }, [responsibles]);

  // Crear un mapa de naves
  const shipsMap = useMemo(() => {
    const map: Record<number, string> = {};
    shipsData?.forEach((ship) => {
      map[ship.id] = ship.name;
    });
    return map;
  }, [shipsData]);

  // Función para formatear nombres de campos
  const formatFieldName = (field: string) => {
    const fieldMappings: Record<string, string> = {
      id: "Identificador",
      area: "Área",
      subarea: "Subárea",
      name: "Nombre del equipo",
      brand: "Marca",
      model: "Modelo",
      series: "Serie",
      extra: "Instrucciones previas",
      status: "Comentarios",
      active: "Estado",
      shipId: "Cambio de la nave",
      responsibleId: "Cambio del responsable",
      requests: "Solicitudes de mantenimiento",
      ship: "Nave",
      responsible: "Responsable",
      changeLog: "Registro de cambios",
      createdAt: "Fecha de creación",
      updatedAt: "Fecha de última actualización",
    };

    return fieldMappings[field] || field;
  };

  // Función para obtener el nombre del valor según el campo
  const getFormattedValue = (field: string, value: any) => {
    if (field === "shipId") {
      const shipName = shipsMap[value];
      return shipName ? shipName : `Nave ID ${value}`;
    }
    if (field === "responsibleId") {
      const responsibleName = responsiblesMap[value];
      return responsibleName ? responsibleName : `Responsable ID ${value}`;
    }
    if (field === "active") {
      return value ? "Activo" : "Inactivo";
    }
    return String(value);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <div
            className="bg-white rounded shadow-lg p-6 max-w-lg w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <Tabs defaultValue="changeLog">
                <TabsList className="flex align-middle justify-center mb-4">
                  <TabsTrigger
                    value="changeLog"
                    className="mx-2 text-lg font-semibold"
                  >
                    Registro de Cambios
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="mx-2 text-lg font-semibold"
                  >
                    Notificaciones del Equipo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="changeLog">
                  <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {" "}
                    {/* <h2 className="text-xl font-bold mb-4">
                    Registro de Cambios
                  </h2> */}
                    {isLoadingChangeLog ||
                    isLoadingResponsibles ||
                    isLoadingShips ? (
                      <p className="text-gray-600">Cargando registros...</p>
                    ) : changeLogError || responsiblesError || shipsError ? (
                      <p className="text-red-500">
                        Error al cargar registros:{" "}
                        {changeLogError?.message ||
                          responsiblesError?.message ||
                          shipsError?.message ||
                          "Error al cargar naves."}
                      </p>
                    ) : changeLog && changeLog.length > 0 ? (
                      <ul className="space-y-6">
                        {changeLog
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() -
                              new Date(a.timestamp).getTime()
                          ) // Ordenar por fecha descendente
                          .map((record, index) => (
                            <li
                              key={index}
                              className="border-b pb-4 last:border-none"
                            >
                              <p className="font-semibold text-gray-800">
                                <span className="text-blue-500">🕒</span>{" "}
                                {formatTime24(new Date(record.timestamp))} -{" "}
                                {new Date(
                                  record.timestamp
                                ).toLocaleDateString()}
                              </p>

                              <p className="text-sm text-gray-600">
                                <span className="text-green-600">
                                  👤 Usuario:
                                </span>{" "}
                                {record.username}
                              </p>
                              <ul className="mt-2 ml-6 list-disc text-gray-700">
                                {record.changes.map((change, idx) => (
                                  <li key={idx}>
                                    <em>{formatFieldName(change.field)}</em>:{" "}
                                    <strong>de</strong>{" "}
                                    <em className="text-red-600">
                                      {getFormattedValue(
                                        change.field,
                                        change.oldValue
                                      )}
                                    </em>
                                    , <strong>a</strong>{" "}
                                    <em className="text-green-600">
                                      {getFormattedValue(
                                        change.field,
                                        change.newValue
                                      )}
                                    </em>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">
                        No hay registros de cambios.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="notifications">
                  <NotificationsTab equipmentId={equipmentId} />
                </TabsContent>
              </Tabs>
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeLogModal;
