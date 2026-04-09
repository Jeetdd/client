import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSessionCookie, getSessionCookieName, type AuthUser, verifySessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const user = verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { user?: AuthUser };
    const user = body?.user;

    if (!user?.id || !user?.name || !user?.email || !user?.role) {
      return NextResponse.json({ message: "Invalid user payload." }, { status: 400 });
    }

    const response = NextResponse.json({ user });
    const sessionCookie = createSessionCookie(user);
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

    return response;
  } catch {
    return NextResponse.json({ message: "Failed to create session." }, { status: 500 });
  }
}
