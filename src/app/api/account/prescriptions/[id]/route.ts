import { NextResponse } from "next/server";

import { buildBackendHeaders, getBackendBase, requireSessionUser } from "../../_backend";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const res = await fetch(`${getBackendBase()}/api/prescriptions/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: buildBackendHeaders(user.email),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id } = await context.params;

  const res = await fetch(`${getBackendBase()}/api/prescriptions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: buildBackendHeaders(user.email),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const res = await fetch(`${getBackendBase()}/api/prescriptions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildBackendHeaders(user.email),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
}

