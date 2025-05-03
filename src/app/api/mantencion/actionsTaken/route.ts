import { NextRequest, NextResponse } from "next/server";
import {
  getActionTakenLogs,
  addActionTakenLog,
  deleteActionTakenLog,
} from "@/actions/maintenanceAction";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const actionTaken = await request.json();

  console.log("actionTaken", actionTaken);

  if (!id) {
    return NextResponse.json({ message: "No se encontró la solicitud." });
  }

  try {
    const maintenanceLogs = await getActionTakenLogs(parseInt(id));

    if (maintenanceLogs) {
      const newLogs = await addActionTakenLog(parseInt(id), actionTaken);
      return NextResponse.json(newLogs);
    } else {
      return NextResponse.json({ message: "No se encontró la solicitud." });
    }
  } catch (error) {
    return NextResponse.json({
      message: "Error al agregar el log de acción.",
      error: error,
    });
  }
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "No se encontró la solicitud." });
  }

  const maintenanceLogs = await getActionTakenLogs(parseInt(id));

  return NextResponse.json(maintenanceLogs);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const logId = searchParams.get("logId");

  if (!id || !logId) {
    return NextResponse.json({
      message: "No se encontró la solicitud o el log.",
    });
  }

  try {
    const maintenanceLogs = await deleteActionTakenLog(
      parseInt(id),
      parseInt(logId)
    );
    return NextResponse.json(maintenanceLogs);
  } catch (error) {
    return NextResponse.json({
      message: "Error al eliminar el log de acción.",
      error: error,
    });
  }
}
