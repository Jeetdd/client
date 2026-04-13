import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type CouponDiscountType = "PERCENTAGE" | "FLAT";

export interface CouponRecord {
  id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponInput {
  code?: string;
  description?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "coupons.json");

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readCoupons() {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as CouponRecord[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeCoupons(coupons: CouponRecord[]) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(coupons, null, 2), "utf8");
}

function normalizeCode(code?: string) {
  return (code || "").trim().toUpperCase();
}

function normalizeInput(input: CouponInput): {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
} {
  const discountType: CouponDiscountType = input.discountType === "FLAT" ? "FLAT" : "PERCENTAGE";
  return {
    code: normalizeCode(input.code),
    description: (input.description || "").trim() || undefined,
    discountType,
    discountValue: Number(input.discountValue) || 0,
    minOrderAmount: Math.max(0, Number(input.minOrderAmount) || 0),
    maxDiscountAmount:
      discountType === "PERCENTAGE" && Number(input.maxDiscountAmount) > 0 ? Number(input.maxDiscountAmount) : undefined,
    usageLimit: Number(input.usageLimit) > 0 ? Number(input.usageLimit) : undefined,
    startsAt: input.startsAt || undefined,
    expiresAt: input.expiresAt || undefined,
    isActive: input.isActive ?? true,
  };
}

export async function listCoupons() {
  const coupons = await readCoupons();
  return coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createCoupon(input: CouponInput) {
  const coupons = await readCoupons();
  const normalized = normalizeInput(input);

  if (!normalized.code) {
    throw new Error("Coupon code is required.");
  }
  if (normalized.discountValue <= 0) {
    throw new Error("Discount value must be greater than 0.");
  }
  if (coupons.some((coupon) => coupon.code === normalized.code)) {
    throw new Error("Coupon code already exists.");
  }

  const now = new Date().toISOString();
  const created: CouponRecord = {
    id: randomUUID(),
    code: normalized.code,
    description: normalized.description,
    discountType: normalized.discountType,
    discountValue: normalized.discountValue,
    minOrderAmount: normalized.minOrderAmount,
    maxDiscountAmount: normalized.maxDiscountAmount,
    usageLimit: normalized.usageLimit,
    usedCount: 0,
    startsAt: normalized.startsAt,
    expiresAt: normalized.expiresAt,
    isActive: normalized.isActive,
    createdAt: now,
    updatedAt: now,
  };

  coupons.push(created);
  await writeCoupons(coupons);
  return created;
}

export async function updateCoupon(id: string, input: CouponInput) {
  const coupons = await readCoupons();
  const index = coupons.findIndex((coupon) => coupon.id === id);
  if (index === -1) return null;

  const current = coupons[index];
  const normalized = normalizeInput({
    ...current,
    ...input,
    code: input.code ?? current.code,
    discountType: input.discountType ?? current.discountType,
    discountValue: input.discountValue ?? current.discountValue,
    minOrderAmount: input.minOrderAmount ?? current.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount ?? current.maxDiscountAmount,
    usageLimit: input.usageLimit ?? current.usageLimit,
    isActive: typeof input.isActive === "boolean" ? input.isActive : current.isActive,
  });

  if (!normalized.code) {
    throw new Error("Coupon code is required.");
  }
  if (normalized.discountValue <= 0) {
    throw new Error("Discount value must be greater than 0.");
  }
  if (coupons.some((coupon, couponIndex) => couponIndex !== index && coupon.code === normalized.code)) {
    throw new Error("Coupon code already exists.");
  }

  const updated: CouponRecord = {
    ...current,
    code: normalized.code,
    description: normalized.description,
    discountType: normalized.discountType,
    discountValue: normalized.discountValue,
    minOrderAmount: normalized.minOrderAmount,
    maxDiscountAmount: normalized.maxDiscountAmount,
    usageLimit: normalized.usageLimit,
    startsAt: normalized.startsAt,
    expiresAt: normalized.expiresAt,
    isActive: normalized.isActive,
    updatedAt: new Date().toISOString(),
  };

  coupons[index] = updated;
  await writeCoupons(coupons);
  return updated;
}

export async function deleteCoupon(id: string) {
  const coupons = await readCoupons();
  const nextCoupons = coupons.filter((coupon) => coupon.id !== id);
  if (nextCoupons.length === coupons.length) return false;
  await writeCoupons(nextCoupons);
  return true;
}

export async function validateCoupon(code: string, orderAmount: number) {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    return { valid: false, message: "Coupon code is required." };
  }

  const coupons = await readCoupons();
  const coupon = coupons.find((item) => item.code === normalizedCode);

  if (!coupon) {
    return { valid: false, message: "Coupon not found." };
  }

  if (!coupon.isActive) {
    return { valid: false, message: "Coupon is inactive." };
  }

  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return { valid: false, message: "Coupon is not active yet." };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return { valid: false, message: "Coupon has expired." };
  }

  if (orderAmount < coupon.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}.` };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached." };
  }

  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.max(0, Math.min(discountAmount, orderAmount));
  return {
    valid: discountAmount > 0,
    message: discountAmount > 0 ? "Coupon applied successfully." : "Coupon did not qualify.",
    discountAmount,
    finalAmount: Math.max(orderAmount - discountAmount, 0),
    coupon,
  };
}
