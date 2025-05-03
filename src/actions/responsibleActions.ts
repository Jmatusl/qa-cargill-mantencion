"use server";

import db from "@/libs/db";

export async function getResponsibleList() {
  try {
    return await db.responsible.findMany({
      include: {
        user: true,
      },
    });
  } catch (error) {
    console.error("Error fetching responsibles:", error);
    throw new Error("Error fetching responsibles.");
  }
}
