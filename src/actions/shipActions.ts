"use server";

import db from "@/libs/db";

export async function getShipsList() {
  try {
    const ships = await db.ships.findMany({});
    // console.log("ships", ships);

    return ships;
  } catch (error) {
    console.error("Error fetching ships:", error);
    throw new Error("Error fetching ships.");
  }
}

export async function getShipById(id: number) {
  try {
    const ship = await db.ships.findUnique({
      where: {
        id,
      },
      include: {
        maintenanceRequests: true,
      },
    });
    // console.log("ship", ship);

    return {
      ship,
    };
  } catch (error) {
    console.error("Error fetching ship:", error);
    throw new Error("Error fetching ship.");
  }
}

export async function getShipsByIds(ids: number[]): Promise<{ id: number; name: string }[]> {
  try {
    const ships = await db.ships.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return ships;
  } catch (error) {
    console.error("Error fetching ships by IDs:", error);
    throw new Error("Error fetching ships.");
  }
}
