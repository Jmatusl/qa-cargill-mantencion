import { NextRequest, NextResponse } from "next/server";

import { getNotificationsByEquipment } from "@/actions/equipmentAction";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({
      message: "No se encontró la solicitud o el log.",
    });
  }

  try {
    const maintenanceLogs = await getNotificationsByEquipment(parseInt(id));

    return NextResponse.json(maintenanceLogs);
  } catch (error) {
    return NextResponse.json({
      message: "Error al obtener los logs de acciones realizadas.",
      error: error,
    });
  }
}
