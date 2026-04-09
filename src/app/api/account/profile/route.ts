import { NextResponse } from "next/server";

import { createSessionCookie } from "@/lib/auth/session";
import { buildBackendHeaders, getBackendBase, requireSessionUser } from "../_backend";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${getBackendBase()}/api/users/me`, {
    method: "GET",
    headers: buildBackendHeaders(user.email),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
}

export async function PATCH(req: Request) {
  const user = await requireSessionUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string; phone?: string };

  const res = await fetch(`${getBackendBase()}/api/users/me`, {
    method: "PATCH",
    headers: buildBackendHeaders(user.email),
    body: JSON.stringify({ ...body }),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(payload ?? { message: "Failed to update profile" }, { status: res.status });
  }

  const updatedUser = {
    ...user,
    ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim() } : {}),
    ...(typeof body.phone === "string" ? { phone: body.phone.trim() || undefined } : {}),
  };

  const next = NextResponse.json(payload);
  const cookie = createSessionCookie(updatedUser);
  next.cookies.set(cookie.name, cookie.value, cookie.options);

  return next;
}

