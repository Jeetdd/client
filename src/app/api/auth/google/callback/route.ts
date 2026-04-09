import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  clearOauthStateCookie,
  createSessionCookie,
  getOauthStateCookieName,
  getRoleForEmail,
  type AuthUser,
} from "@/lib/auth/session";

export const runtime = "nodejs";

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function redirectWithError(request: Request, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", reason);

  const response = NextResponse.redirect(url);
  const cookie = clearOauthStateCookie();

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}

export async function GET(request: Request) {
  try {
    getRequiredEnv("GOOGLE_CLIENT_ID");
    getRequiredEnv("GOOGLE_CLIENT_SECRET");
    getRequiredEnv("AUTH_SESSION_SECRET");

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const savedState = cookieStore.get(getOauthStateCookieName())?.value;

    if (!code || !state || !savedState || savedState !== state) {
      return redirectWithError(request, "google_oauth_state_mismatch");
    }

    const redirectUri = new URL("/api/auth/google/callback", url.origin).toString();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      return redirectWithError(request, tokenData.error ?? "google_token_exchange_failed");
    }

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      return redirectWithError(request, "google_profile_fetch_failed");
    }

    const profile = (await profileResponse.json()) as GoogleUserInfo;

    if (!profile.email || profile.email_verified === false) {
      return redirectWithError(request, "google_email_not_verified");
    }

    const user: AuthUser = {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      role: getRoleForEmail(profile.email),
    };

    const response = NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/", request.url));
    const sessionCookie = createSessionCookie(user);
    const oauthStateCookie = clearOauthStateCookie();

    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    response.cookies.set(oauthStateCookie.name, oauthStateCookie.value, oauthStateCookie.options);

    return response;
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    const message = error instanceof Error ? error.message : "";

    if (message.includes("GOOGLE_CLIENT_ID")) {
      return redirectWithError(request, "google_oauth_missing_client_id");
    }

    if (message.includes("GOOGLE_CLIENT_SECRET")) {
      return redirectWithError(request, "google_oauth_missing_client_secret");
    }

    if (message.includes("AUTH_SESSION_SECRET")) {
      return redirectWithError(request, "google_oauth_missing_session_secret");
    }

    return redirectWithError(request, "google_oauth_callback_failed");
  }
}
