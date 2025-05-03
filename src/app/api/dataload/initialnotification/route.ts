import { NextRequest, NextResponse } from "next/server";
import { initializeNotificationGroups } from "@/libs/initializeNotificationData";

export async function POST(req: NextRequest) {
  const res = await initializeNotificationGroups();

  return NextResponse.json(res);
}
