import { NextResponse } from "next/server";

import { buildBackendHeaders, getBackendBase, requireSessionUser } from "../../account/_backend";
import { deleteCoupon, updateCoupon } from "@/lib/coupons/store";

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const guard = ensureAdmin(user);
  if (guard) return guard;

  const { id } = await context.params;
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
    const res = await fetch(`${getBackendBase()}/api/coupons/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: buildBackendHeaders(user.email),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);
    if (shouldUseLocalFallback(res.status)) {
      try {
        const updated = await updateCoupon(id, body);
        if (!updated) {
          return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
        }
        return NextResponse.json(updated, { status: 200 });
      } catch (error) {
        return NextResponse.json(
          { message: error instanceof Error ? error.message : "Failed to update coupon." },
          { status: 400 },
        );
      }
    }
    return NextResponse.json(payload ?? { message: "Failed" }, { status: res.status });
  } catch {
    try {
      const updated = await updateCoupon(id, body);
      if (!updated) {
        return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
      }
      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Unable to update coupon right now." },
        { status: 400 },
      );
    }
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const guard = ensureAdmin(user);
  if (guard) return guard;

  const { id } = await context.params;

  try {
    const res = await fetch(`${getBackendBase()}/api/coupons/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: buildBackendHeaders(user.email),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);
    if (shouldUseLocalFallback(res.status)) {
      const deleted = await deleteCoupon(id);
      if (!deleted) {
        return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json(payload ?? { success: res.ok }, { status: res.status });
  } catch {
    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
