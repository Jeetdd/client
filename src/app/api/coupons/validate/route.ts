import { NextResponse } from "next/server";

import { getBackendBase, getInternalToken, requireSessionUser } from "../../account/_backend";
import { validateCoupon } from "@/lib/coupons/store";

export const runtime = "nodejs";

interface ValidateCouponBody {
  code?: string;
  orderAmount?: number;
  email?: string;
}

export async function POST(request: Request) {
  const sessionUser = await requireSessionUser();
  const body = (await request.json().catch(() => ({}))) as ValidateCouponBody;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const email = sessionUser?.email || (typeof body.email === "string" ? body.email.trim() : "");
  if (email) {
    headers["x-user-email"] = email;
  }

  const internalToken = getInternalToken();
  if (internalToken) {
    headers["x-internal-token"] = internalToken;
  }

  const payload = {
    code: typeof body.code === "string" ? body.code.trim().toUpperCase() : "",
    orderAmount: Number(body.orderAmount) || 0,
  };

  try {
    const res = await fetch(`${getBackendBase()}/api/coupons/validate`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    if (res.status === 404 || res.status === 405 || res.status >= 500) {
      const local = await validateCoupon(payload.code, payload.orderAmount);
      return NextResponse.json(local, { status: local.valid ? 200 : 400 });
    }
    return NextResponse.json(json ?? { valid: false }, { status: res.status });
  } catch {
    const local = await validateCoupon(payload.code, payload.orderAmount);
    return NextResponse.json(local, { status: local.valid ? 200 : 400 });
  }
}
