import { NextResponse } from "next/server";

import { buildBackendHeaders, getBackendBase, requireSessionUser } from "../_backend";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${getBackendBase()}/api/orders/my`, {
    method: "GET",
    headers: buildBackendHeaders(user.email),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  return NextResponse.json(payload ?? [], { status: res.status });
}

