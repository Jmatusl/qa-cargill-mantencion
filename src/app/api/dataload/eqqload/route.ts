import { NextRequest, NextResponse } from "next/server";
import XlsPopulate from "xlsx-populate";
import path from "path";
import db from "@/libs/db";

const loadEquipmentRecords = async (filePath: string) => {
  try {
    const workbook = await XlsPopulate.fromFileAsync(filePath);
    const sheet = workbook.sheet(0);
    const usedRange = sheet.usedRange();
    if (!usedRange) {
      throw new Error("No used range found in the sheet.");
    }
    const rows = usedRange.value();
    let i = 0;

    for (const row of rows.slice(1)) {
      // Skip header row
      const [
        area,
        subarea,
        responsibleName,
        shipName,
        equipmentName,
        brand,
        model,
        series,
      ] = row;

      console.log("cargando Row ", i, row);
      i++;
      if (!area || !responsibleName || !shipName || !equipmentName) {
        console.log("Skipping row due to missing required fields:", row);
        break;
      }
      // Trim all string values
      const trimmedArea = area ? area.toString().trim() : "";
      const trimmedSubarea = subarea ? subarea.toString().trim() : "";
      const trimmedResponsibleName = responsibleName
        ? responsibleName.toString().trim()
        : "";
      const trimmedShipName = shipName ? shipName.toString().trim() : "";
      const trimmedEquipmentName = equipmentName
        ? equipmentName.toString().trim()
        : "";
      const trimmedBrand = brand ? brand.toString().trim() : "";
      const trimmedModel = model ? model.toString().trim() : "";
      const trimmedSeries = series ? series.toString().trim() : "";

      // Find or create the responsible person
      let responsible = await db.responsible.findUnique({
        where: { name: trimmedResponsibleName },
      });
      console.log("responsible", responsible);

      if (!responsible) {
        console.log("creando responsable");
        responsible = await db.responsible.create({
          data: {
            name: trimmedResponsibleName,
          },
        });
      }

      // Find or create the ship
      let ship = await db.ships.findUnique({
        where: { name: trimmedShipName },
      });
      console.log("ship", ship);

      if (!ship) {
        console.log("creando ship", trimmedShipName);
        ship = await db.ships.create({
          data: {
            name: trimmedShipName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create the equipment record
      await db.equipment.create({
        data: {
          area: trimmedArea,
          subarea: trimmedSubarea,
          name: trimmedEquipmentName,
          shipId: ship.id,
          responsibleId: responsible.id,
          model: trimmedModel,
          series: trimmedSeries,
          brand: trimmedBrand,
        },
      });
    }

    console.log("Equipment records loaded successfully.");
  } catch (error) {
    console.error("Error loading equipment records:", error);
  } finally {
    await db.$disconnect();
  }
};

const filePath = path.resolve("./utils/equipos2.xlsx");
console.log("filePath", filePath);

export async function POST(request: NextRequest) {
  await loadEquipmentRecords(filePath);

  return NextResponse.json({
    message: "Equipment records loaded successfully.",
  });
}

export async function GET(request: NextRequest) {
  const equipment = await db.equipment.findMany({
    include: {
      responsible: true,
      ship: true,
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(equipment);
}

export async function DELETE(request: NextRequest) {
  try {
    //eliminamos las request
    await db.maintenanceRequest.deleteMany({});

    // Obtenemos todos los equipos
    const equipments = await db.equipment.findMany({
      include: {
        requests: true, // Incluir las solicitudes de mantenimiento relacionadas
      },
    });

    // Filtramos los equipos que tienen solicitudes de mantenimiento asociadas
    const equipmentsWithRequests = equipments.filter(
      (equipment) => equipment.requests.length > 0
    );

    if (equipmentsWithRequests.length > 0) {
      return NextResponse.json(
        {
          message:
            "No se pueden eliminar los equipos con solicitudes de mantencion asociadas.",
          equipmentsWithRequests: equipmentsWithRequests.map(
            (equipment) => equipment.id
          ),
        },
        {
          status: 400,
        }
      );
    }

    // Si no hay equipos con solicitudes de mantenimiento, proceder con la eliminación
    await db.equipment.deleteMany({});

    await db.ships.deleteMany({});
    console.log("All equipment records deleted successfully.");

    return NextResponse.json({
      message: "Todos los registros de equipos se eliminaron con éxito.",
    });
  } catch (error) {
    console.error("Error deleting equipment records:", error);

    return NextResponse.json(
      {
        message: "Error al eliminar los registros de equipos.",
      },
      {
        status: 500,
      }
    );
  } finally {
    await db.$disconnect();
  }
}
