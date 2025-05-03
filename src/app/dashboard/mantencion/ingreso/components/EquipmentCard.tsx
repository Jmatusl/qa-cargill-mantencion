"use client";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React from "react";

function EquipmentCard({ selectedEquipment }: { selectedEquipment: any }) {
  if (!selectedEquipment) {
    return null; // Maneja el caso donde no se selecciona ningún equipo
  }

  return (
    <Card className="flex-1 w-full mt-4 bg-white dark:bg-gray-800 rounded">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          Detalles del Equipo Seleccionado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="ship" className="text-gray-700 dark:text-gray-300">
              Nave
            </Label>
            <div
              id="ship"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.ship?.name ?? "No disponible"}
            </div>
          </div>
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Nombre
            </Label>
            <div
              id="name"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.name ?? "No disponible"}
            </div>
          </div>
          <div>
            <Label htmlFor="brand" className="text-gray-700 dark:text-gray-300">
              Marca
            </Label>
            <div
              id="brand"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.brand ?? "No disponible"}
            </div>
          </div>
          <div>
            <Label htmlFor="model" className="text-gray-700 dark:text-gray-300">
              Modelo
            </Label>
            <div
              id="model"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.model ?? "No disponible"}
            </div>
          </div>
          <div>
            <Label
              htmlFor="series"
              className="text-gray-700 dark:text-gray-300"
            >
              Serie
            </Label>
            <div
              id="series"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.series ?? "No disponible"}
            </div>
          </div>
          <div>
            <Label htmlFor="extra" className="text-gray-700 dark:text-gray-300">
              Encargado
            </Label>
            <div
              id="extra"
              className="py-2 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {selectedEquipment.responsible?.name ?? "No disponible"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EquipmentCard;
