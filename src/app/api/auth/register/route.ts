import { NextResponse } from "next/server";

import { createSessionCookie, type AuthUser } from "@/lib/auth/session";

export const runtime = "nodejs";

function getBackendBase() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://server-hw5w.onrender.com";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${getBackendBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(payload ?? { message: "Registration failed" }, { status: response.status });
  }

  const user = payload?.user as AuthUser | undefined;
  if (!user?.email || !user?.id) {
    return NextResponse.json({ message: "Invalid registration response" }, { status: 500 });
  }

  const next = NextResponse.json({ user });
  const cookie = createSessionCookie(user);
  next.cookies.set(cookie.name, cookie.value, cookie.options);

  return next;
}

