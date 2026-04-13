import { NextRequest, NextResponse } from "next/server";

import { buildBackendHeaders, getBackendBase, requireSessionUser } from "../account/_backend";
import { createCoupon, listCoupons } from "@/lib/coupons/store";

export const runtime = "nodejs";

function ensureAdmin(user: Awaited<ReturnType<typeof requireSessionUser>>) {
  if (!user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}

function shouldUseLocalFallback(status: number) {
  return status === 404 || status === 405 || status >= 500;
}

export async function GET(request: NextRequest) {
  const user = await requireSessionUser();
  const guard = ensureAdmin(user);
  if (guard) return guard;
  const userEmail = user?.email;
  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.search;

  try {
    const res = await fetch(`${getBackendBase()}/api/coupons${search}`, {
      method: "GET",
      headers: buildBackendHeaders(userEmail),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);
    if (shouldUseLocalFallback(res.status)) {
      const coupons = await listCoupons();
      return NextResponse.json(coupons, { status: 200 });
    }
    return NextResponse.json(payload ?? [], { status: res.status });
  } catch {
    const coupons = await listCoupons();
    return NextResponse.json(coupons, { status: 200 });
  }
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const guard = ensureAdmin(user);
  if (guard) return guard;
  const userEmail = user?.email;
  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    description?: string;
    discountType?: "PERCENTAGE" | "FLAT";
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    startsAt?: string;
    expiresAt?: string;
    isActive?: boolean;
  };

  try {
    const res = await fetch(`${getBackendBase()}/api/coupons`, {
      method: "POST",
      headers: buildBackendHeaders(userEmail),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);
    if (shouldUseLocalFallback(res.status)) {
      try {
        const created = await createCoupon(body);
        return NextResponse.json(created, { status: 201 });
      } catch (error) {
        return NextResponse.json(
          { message: error instanceof Error ? error.message : "Failed to create coupon." },
          { status: 400 },
        );
      }
    }
    return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
  } catch {
    try {
      const created = await createCoupon(body);
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Unable to create coupon right now." },
        { status: 400 },
      );
    }
  }
}
