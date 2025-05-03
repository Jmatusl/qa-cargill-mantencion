import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const kmlFilePath = path.join(process.cwd(), "KML", "Barrios.kml");

async function kmlResponse() {
  try {
    const kmlData = fs.readFileSync(kmlFilePath, "utf8");

    return new NextResponse(kmlData, {
      status: 200,
      headers: {
        "Content-Type": "document/kml",
      },
    });
  } catch (error) {
    console.error("Error leyendo el archivo KML:", error);

    // En caso de error, devuelve una respuesta de error.
    return new NextResponse("Error al procesar la solicitud", { status: 500 });
  }
}

export async function GET() {
  return await kmlResponse();
}
