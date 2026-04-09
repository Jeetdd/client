import { cookies } from "next/headers";

import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export function getBackendBase() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://server-hw5w.onrender.com";
}

export function getInternalToken() {
  return process.env.BACKEND_INTERNAL_TOKEN || "";
}

export async function requireSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const user = verifySessionToken(token);
  return user;
}

export function buildBackendHeaders(userEmail: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-email": userEmail,
  };

  const internalToken = getInternalToken();
  if (internalToken) {
    headers["x-internal-token"] = internalToken;
  }

  return headers;
}

