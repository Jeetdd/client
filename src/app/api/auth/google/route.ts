import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { createOauthStateCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

export async function GET(request: Request) {
  try {
    const state = randomBytes(24).toString("hex");
    const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
    const redirectUri = new URL("/api/auth/google/callback", new URL(request.url).origin).toString();
    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    googleUrl.searchParams.set("client_id", clientId);
    googleUrl.searchParams.set("redirect_uri", redirectUri);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "openid email profile");
    googleUrl.searchParams.set("prompt", "select_account");
    googleUrl.searchParams.set("state", state);
    googleUrl.searchParams.set("access_type", "offline");

    const response = NextResponse.redirect(googleUrl);
    const oauthStateCookie = createOauthStateCookie(state);

    response.cookies.set(oauthStateCookie.name, oauthStateCookie.value, oauthStateCookie.options);

    return response;
  } catch (error) {
    console.error("Google OAuth init failed:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "google_oauth_not_configured");
    return NextResponse.redirect(loginUrl);
  }
}
