import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookie = clearSessionCookie();

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
