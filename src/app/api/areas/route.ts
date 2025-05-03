import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/db";

export async function GET(request: NextRequest) {
  try {
    const uniqueAreas = await db.equipment.groupBy({
      by: ["area"],
      _count: {
        area: true,
      },
    });

    const uniqueSubareas = await db.equipment.groupBy({
      by: ["area", "subarea"],
      _count: {
        subarea: true,
      },
    });

    return NextResponse.json({
      uniqueAreas,
      uniqueSubareas,
    });
  } catch (error) {
    console.error("Error fetching unique areas and subareas:", error);
    return NextResponse.json(
      { message: "Error fetching unique areas and subareas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
  const { subarea } = await request.json();

  let equipment;

  if (subarea) {
    equipment = await db.equipment.findMany({
      where: {
        subarea: subarea,
      },
      include: {
        responsible: true,
        ship: true,
      },
    });
  } else {
    equipment = await db.equipment.findMany({
      include: {
        responsible: true,
        ship: true,
      },
    });
  }

  return NextResponse.json(equipment);
}
