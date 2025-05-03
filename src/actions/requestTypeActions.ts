"use server";
import db from "@/libs/db";

// ✅ CREATE
export async function createRequestType(data: {
  name: string;
  description?: string;
}) {
  return await db.requestType.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

// ✅ READ ALL
export async function getAllRequestTypes() {
  return await db.requestType.findMany({
    orderBy: { name: 'asc' },
  });
}

// ✅ READ ONE
export async function getRequestTypeById(id: number) {
  return await db.requestType.findUnique({
    where: { id },
  });
}

// ✅ UPDATE
export async function updateRequestType(id: number, data: {
  name?: string;
  description?: string;
  state?: boolean;
}) {
  return await db.requestType.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

// ✅ DELETE
export async function deleteRequestType(id: number) {
  return await db.requestType.delete({
    where: { id },
  });
}
