// src/components/ChangeLogContent.tsx
"use client";

import React, { useMemo } from "react";
import { useGetEquipmentChangeLog } from "@/hooks/useQueriesEquipment";
import { useGetResponsibles } from "@/hooks/UseQueriesMaintenance";
import { useShipsByIds } from "@/hooks/useShipsQuery";
import { ChangeRecord, Change } from "@/types/EquipmentType"; // Ajusta la ruta según corresponda
import { Responsible } from "@prisma/client"; // Importa el tipo Responsible
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime24 } from "../../../../../../utils/dateUtils";

type ChangeLogContentProps = {
  equipmentId: number;
};

const ChangeLogContent: React.FC<ChangeLogContentProps> = ({ equipmentId }) => {
  const {
    data: changeLog,
    isLoading: isLoadingChangeLog,
    error: changeLogError,
  } = useGetEquipmentChangeLog(equipmentId, {
    enabled: true, // Ajusta según tus necesidades
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
      id: "ID",
      area: "Área",
      subarea: "Sistema",
      name: "Nombre",
      brand: "Marca",
      model: "Modelo",
      series: "Serie",
      extra: "Instrucciones",
      status: "Comentarios",
      active: "Estado",
      shipId: "Cambio de la nave",
      responsibleId: "Cambio del responsable",
      requests: "Solicitudes",
      ship: "Nave",
      responsible: "Responsable",
      changeLog: "Cambios",
      createdAt: "Creado",
      updatedAt: "Actualizado",
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

  // Ordenar el cambio log por fecha descendente
  const sortedChangeLog = useMemo(() => {
    return changeLog
      ? [...changeLog].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      : [];
  }, [changeLog]);

  return (
    // Contenedor flex para centrar la tarjeta
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Registro de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh]">
            {isLoadingChangeLog || isLoadingResponsibles || isLoadingShips ? (
              <ChangeLogSkeleton />
            ) : changeLogError || responsiblesError || shipsError ? (
              <p className="text-red-500">
                Error al cargar registros:{" "}
                {changeLogError?.message ||
                  responsiblesError?.message ||
                  shipsError?.message ||
                  "Error al cargar datos."}
              </p>
            ) : sortedChangeLog && sortedChangeLog.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha y Usuario</TableHead>
                    <TableHead>Cambios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedChangeLog.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="align-top">
                        <div className="text-xs text-muted-foreground">
                          {formatTime24(record.timestamp)}{" "}
                          {new Date(record.timestamp).toLocaleDateString()}
                        </div>
                        <div className="font-medium">👤 {record.username}</div>
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-sm">
                          {record.changes.map((change, idx) => (
                            <React.Fragment key={idx}>
                              <div className="font-medium">
                                {formatFieldName(change.field)}:
                              </div>
                              <div>
                                <span className="text-red-500 line-through mr-1">
                                  {getFormattedValue(
                                    change.field,
                                    change.oldValue
                                  )}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {getFormattedValue(
                                    change.field,
                                    change.newValue
                                  )}
                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No hay registros de cambios.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const ChangeLogSkeleton = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex space-x-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default ChangeLogContent;
