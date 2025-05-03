import { NextRequest, NextResponse } from "next/server";

import { getGeneratedNotificationsNested } from "@/actions/notificationActions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page");

  const notifications = await getGeneratedNotificationsNested(
    page ? parseInt(page) : 1
  );

  return NextResponse.json(notifications);
}
