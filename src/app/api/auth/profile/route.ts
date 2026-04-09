import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSessionCookie, getSessionCookieName, verifySessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const currentUser = verifySessionToken(token);

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string; phone?: string };

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;

  const updatedUser = {
    ...currentUser,
    ...(name ? { name } : {}),
    ...(typeof phone === "string" ? { phone: phone || undefined } : {}),
  };

  const response = NextResponse.json({ user: updatedUser });
  const cookie = createSessionCookie(updatedUser);
  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}

