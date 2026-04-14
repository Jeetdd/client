export type CouponDiscountType = "percentage" | "flat";

export interface CouponConfig {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  isActive: boolean;
}

export type ApplyCouponResult = {
  success: boolean;
  message: string;
  discount: number;
  finalAmount: number;
};

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeDiscountType(value: unknown): CouponDiscountType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "percentage" || normalized === "percent") return "percentage";
  if (normalized === "flat" || normalized === "fixed") return "flat";
  return null;
}

/**
 * Apply coupon discount on `cartTotal` (not on delivery).
 *
 * Requirements implemented:
 * - Validate coupon exists & isActive
 * - Check minOrderValue
 * - percentage: discount = cartTotal * value / 100, capped by maxDiscount
 * - flat: discount = value
 * - discount never exceeds cartTotal, never negative final
 */
export function applyCoupon(cartTotal: number, couponCode: string, coupons: CouponConfig[]): ApplyCouponResult {
  const safeCartTotal = toNumber(cartTotal);
  if (!Number.isFinite(safeCartTotal) || safeCartTotal < 0) {
    return { success: false, message: "Invalid cart total.", discount: 0, finalAmount: 0 };
  }

  const normalizedCode = normalizeCode(couponCode);
  if (!normalizedCode) {
    return { success: false, message: "Coupon code is required.", discount: 0, finalAmount: safeCartTotal };
  }

  const coupon = coupons.find((c) => normalizeCode(c.code) === normalizedCode);
  if (!coupon) {
    return { success: false, message: "Invalid coupon.", discount: 0, finalAmount: safeCartTotal };
  }

  if (!coupon.isActive) {
    return { success: false, message: "Coupon is inactive.", discount: 0, finalAmount: safeCartTotal };
  }

  const minOrderValue = Number.isFinite(coupon.minOrderValue ?? NaN) ? Number(coupon.minOrderValue) : 0;
  if (minOrderValue > 0 && safeCartTotal < minOrderValue) {
    return {
      success: false,
      message: `Cart total must be at least ${minOrderValue}.`,
      discount: 0,
      finalAmount: safeCartTotal,
    };
  }

  const discountValue = toNumber(coupon.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { success: false, message: "Invalid coupon discount value.", discount: 0, finalAmount: safeCartTotal };
  }

  const discountType = normalizeDiscountType(coupon.discountType);
  if (!discountType) {
    return { success: false, message: "Invalid coupon discount type.", discount: 0, finalAmount: safeCartTotal };
  }

  let discount = 0;
  if (discountType === "percentage") {
    discount = (safeCartTotal * discountValue) / 100;
    const maxDiscount = toNumber(coupon.maxDiscount);
    if (Number.isFinite(maxDiscount) && maxDiscount > 0) {
      discount = Math.min(discount, maxDiscount);
    }
  } else {
    discount = discountValue;
  }

  discount = clamp(discount, 0, safeCartTotal);
  const finalAmount = clamp(safeCartTotal - discount, 0, safeCartTotal);

  if (discount <= 0) {
    return { success: false, message: "Coupon not applicable.", discount: 0, finalAmount: safeCartTotal };
  }

  return {
    success: true,
    message: "Coupon applied",
    discount,
    finalAmount,
  };
}
