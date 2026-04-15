"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Boxes,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  Eye,
  LayoutDashboard,
  Loader2,
  Pencil,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  Trash2,
  Truck,
  Upload,
  UserRound,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";

// Default to the production Render API so Vercel deployments work even if the env var isn't set.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://server-hw5w.onrender.com").replace(/\/$/, "");

type AdminTab = "orders" | "catalog" | "inventory" | "slots" | "coupons";
type OrderStatus = "PENDING_PHARMACIST_REVIEW" | "APPROVED" | "REJECTED" | "DISPATCHED" | "DELIVERED" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface Medicine {
  id?: string;
  _id?: string;
  medicineId: string;
  name: string;
  strength: string;
  price: number;
  stock?: number;
  quantity: number;
  category: string;
  description: string;
  requiresPrescription: boolean;
  image?: string;
}

interface ImportMedicineRow {
  rowNumber: number;
  medicine: Medicine;
  selected: boolean;
  issues: string[];
}

interface Slot {
  id?: string;
  date: string;
  timeSlot: string;
  maxBookings: number;
  currentBookings: number;
}

interface InventorySummary {
  totalSkus: number;
  outOfStockSkus: number;
  lowStockSkus: number;
  lowStockThreshold: number;
  totalUnits: number;
  totalStockValue: number;
}

type InventoryMovementType =
  | "INITIAL_STOCK"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "SALE"
  | "RESTOCK"
  | "RETURN"
  | "CANCELLED_ORDER";

interface InventoryMovement {
  id: string;
  medicineId: string;
  type: InventoryMovementType;
  delta: number;
  beforeStock: number;
  afterStock: number;
  reason?: string | null;
  orderId?: string | null;
  actorEmail?: string | null;
  createdAt: string;
  medicine?: { id: string; name: string; category: string };
}

interface OrderItem {
  id?: string;
  quantity: number;
  price: number;
  medicine?: {
    name: string;
    category: string;
  };
}

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  shippingAddress?: string | null;
  pickupSlotTime?: string | null;
  pharmacistReviewComment?: string | null;
  prescriptionImage?: string | null;
  createdAt: string;
  itemsCount: number;
  requiresPrescription: boolean;
}

interface OrderSummary {
  totalOrders: number;
  todayOrders: number;
  pendingReview: number;
  processingOrders: number;
  completedOrders: number;
  revenue: number;
}

type CouponDiscountType = "PERCENTAGE" | "FLAT";

interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
}

interface CouponDraft {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}

const EMPTY_SUMMARY: OrderSummary = {
  totalOrders: 0,
  todayOrders: 0,
  pendingReview: 0,
  processingOrders: 0,
  completedOrders: 0,
  revenue: 0,
};

const EMPTY_INVENTORY_SUMMARY: InventorySummary = {
  totalSkus: 0,
  outOfStockSkus: 0,
  lowStockSkus: 0,
  lowStockThreshold: 10,
  totalUnits: 0,
  totalStockValue: 0,
};

const EMPTY_COUPON_DRAFT: CouponDraft = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

const STATUS_OPTIONS: OrderStatus[] = ["PENDING_PHARMACIST_REVIEW", "APPROVED", "REJECTED", "DISPATCHED", "DELIVERED", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["PENDING", "SUCCESS", "FAILED"];

const QUICK_ACTIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PHARMACIST_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["DISPATCHED", "READY_FOR_PICKUP", "CANCELLED"],
  REJECTED: [],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  READY_FOR_PICKUP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const statusLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const UI = {
  card: "rounded-lg border border-slate-200 bg-white shadow-sm",
  cardMuted: "rounded-lg border border-slate-200 bg-slate-50 shadow-sm",
  buttonPrimary: "inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60",
  buttonSecondary: "inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60",
  buttonDark: "inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60",
  buttonDanger: "inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60",
  chip: "inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800",
  chipPrimary: "inline-flex items-center rounded-md bg-slate-900/5 px-2.5 py-0.5 text-xs font-medium text-slate-900 border border-slate-200",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCouponValue = (coupon: Coupon) =>
  coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue);

const getCouponId = (coupon: Coupon) => coupon.id || coupon._id || coupon.code;
const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);
const toDateInputValue = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const couponToDraft = (coupon: Coupon): CouponDraft => ({
  code: coupon.code || "",
  description: coupon.description || "",
  discountType: coupon.discountType || "PERCENTAGE",
  discountValue: Number(coupon.discountValue || 0),
  minOrderAmount: Number(coupon.minOrderAmount || 0),
  maxDiscountAmount: Number(coupon.maxDiscountAmount || 0),
  usageLimit: Number(coupon.usageLimit || 0),
  expiresAt: toDateInputValue(coupon.expiresAt),
  isActive: Boolean(coupon.isActive),
});
const buildCouponPayload = (coupon: CouponDraft) => ({
  code: coupon.code.trim().toUpperCase(),
  description: coupon.description.trim() || undefined,
  discountType: coupon.discountType,
  discountValue: Number(coupon.discountValue),
  minOrderAmount: Math.max(0, Number(coupon.minOrderAmount) || 0),
  maxDiscountAmount: coupon.discountType === "PERCENTAGE" && Number(coupon.maxDiscountAmount) > 0 ? Number(coupon.maxDiscountAmount) : undefined,
  usageLimit: Number(coupon.usageLimit) > 0 ? Number(coupon.usageLimit) : undefined,
  expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : undefined,
  isActive: coupon.isActive,
});

const toAssetUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/uploads")) return `${API_BASE}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE}/${value}`;
  return value;
};

export default function AdminDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary>(EMPTY_SUMMARY);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>(EMPTY_INVENTORY_SUMMARY);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [movementMedicineFilter, setMovementMedicineFilter] = useState<string>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [prescriptionOnly, setPrescriptionOnly] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState(false);
  const [isCouponSaving, setIsCouponSaving] = useState(false);
  const [isCouponUpdating, setIsCouponUpdating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState<CouponDraft>(EMPTY_COUPON_DRAFT);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [editCoupon, setEditCoupon] = useState<CouponDraft>(EMPTY_COUPON_DRAFT);
  const [adjustTarget, setAdjustTarget] = useState<Medicine | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("");
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const [isImportParsing, setIsImportParsing] = useState(false);
  const [isImportSubmitting, setIsImportSubmitting] = useState(false);
  const [importRows, setImportRows] = useState<ImportMedicineRow[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [newMed, setNewMed] = useState<Medicine>({
    medicineId: "",
    name: "",
    strength: "",
    price: 0,
    quantity: 0,
    category: "Skin Care",
    description: "",
    requiresPrescription: true,
  });
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split("T")[0],
    timeSlot: "09:00 AM - 11:00 AM",
    maxBookings: 5,
  });

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);
  const couponStats = useMemo(() => {
    const now = Date.now();
    const active = coupons.filter((coupon) => coupon.isActive).length;
    const expiringSoon = coupons.filter((coupon) => {
      if (!coupon.expiresAt) return false;
      const diff = new Date(coupon.expiresAt).getTime() - now;
      return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 7;
    }).length;
    const exhausted = coupons.filter((coupon) => {
      const limit = Number(coupon.usageLimit || 0);
      const used = Number(coupon.usedCount || 0);
      return limit > 0 && used >= limit;
    }).length;
    return { total: coupons.length, active, expiringSoon, exhausted };
  }, [coupons]);

  const importSelectableCount = useMemo(() => importRows.filter((row) => row.issues.length === 0).length, [importRows]);
  const importSelectedCount = useMemo(() => importRows.filter((row) => row.selected && row.issues.length === 0).length, [importRows]);
  const isImportAllSelected = importSelectableCount > 0 && importSelectedCount === importSelectableCount;

  useEffect(() => {
    if (selectedOrder) {
      setReviewComment(selectedOrder.pharmacistReviewComment || "");
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return void router.replace("/login");
    if (user.role !== "ADMIN") return void router.replace("/");
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    if (activeTab === "orders") void fetchOrders();
    if (activeTab === "catalog") void fetchMedicines();
    if (activeTab === "inventory") {
      void fetchMedicines();
      void fetchInventory();
    }
    if (activeTab === "slots") void fetchSlots();
    if (activeTab === "coupons") void fetchCoupons();
  }, [activeTab, user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN" || activeTab !== "orders") return;
    const timeout = setTimeout(() => void fetchOrders(), 250);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, fulfillmentFilter, paymentFilter, prescriptionOnly, activeTab, user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN" || activeTab !== "inventory") return;
    const timeout = setTimeout(() => void fetchInventory(), 150);
    return () => clearTimeout(timeout);
  }, [movementMedicineFilter, activeTab, user]);

  async function fetchOrders() {
    setIsOrdersLoading(true);
    setOrdersError(null);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (fulfillmentFilter !== "ALL") params.set("fulfillmentMethod", fulfillmentFilter);
    if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
    if (prescriptionOnly) params.set("prescriptionOnly", "true");

    try {
      const [ordersRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders?${params.toString()}`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/orders/summary?${params.toString()}`, { cache: "no-store" }),
      ]);
      if (!ordersRes.ok || !summaryRes.ok) throw new Error("Failed to load order data");
      const nextOrders = (await ordersRes.json()) as Order[];
      const nextSummary = (await summaryRes.json()) as OrderSummary;
      setOrders(nextOrders);
      setSummary(nextSummary);
      setSelectedOrderId((current) => current ?? nextOrders[0]?.id ?? null);
    } catch (error) {
      console.error(error);
      setOrders([]);
      setSummary(EMPTY_SUMMARY);
      setSelectedOrderId(null);
      setOrdersError("Unable to reach the order service. Please run the local backend server.");
    } finally {
      setIsOrdersLoading(false);
    }
  }

  const fetchMedicines = async () => {
    setIsCatalogLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/medicines`, { cache: "no-store" });
      if (res.ok) setMedicines(await res.json());
    } finally {
      setIsCatalogLoading(false);
    }
  };

  const fetchSlots = async () => {
    setIsSlotsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/slots`, { cache: "no-store" });
      if (res.ok) setSlots(await res.json());
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const fetchInventory = async () => {
    setIsInventoryLoading(true);
    try {
      const movementParams = new URLSearchParams();
      if (movementMedicineFilter !== "ALL") movementParams.set("medicineId", movementMedicineFilter);
      movementParams.set("limit", "50");

      const [summaryRes, movementsRes] = await Promise.all([
        fetch(`${API_BASE}/api/inventory/summary`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/inventory/movements?${movementParams.toString()}`, { cache: "no-store" }),
      ]);

      if (summaryRes.ok) {
        setInventorySummary((await summaryRes.json()) as InventorySummary);
      } else {
        setInventorySummary(EMPTY_INVENTORY_SUMMARY);
      }

      if (movementsRes.ok) {
        setInventoryMovements((await movementsRes.json()) as InventoryMovement[]);
      } else {
        setInventoryMovements([]);
      }
    } catch (error) {
      console.error(error);
      setInventorySummary(EMPTY_INVENTORY_SUMMARY);
      setInventoryMovements([]);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsCouponsLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to load coupons");
      setCoupons(Array.isArray(payload) ? (payload as Coupon[]) : []);
    } catch (error) {
      console.error(error);
      setCoupons([]);
      setCouponError(getErrorMessage(error, "Unable to load coupons right now."));
    } finally {
      setIsCouponsLoading(false);
    }
  };

  const handleAddCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedCode = newCoupon.code.trim().toUpperCase();
    if (!normalizedCode) {
      alert("Coupon code is required.");
      return;
    }

    if (newCoupon.discountValue <= 0) {
      alert("Discount value must be greater than zero.");
      return;
    }

    setIsCouponSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCouponPayload(newCoupon)),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to create coupon");

      setShowAddCouponModal(false);
      setNewCoupon(EMPTY_COUPON_DRAFT);
      await fetchCoupons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Unable to create coupon."));
    } finally {
      setIsCouponSaving(false);
    }
  };

  const openEditCouponModal = (coupon: Coupon) => {
    setEditingCouponId(getCouponId(coupon));
    setEditCoupon(couponToDraft(coupon));
    setShowEditCouponModal(true);
  };

  const handleUpdateCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCouponId) return;

    const normalizedCode = editCoupon.code.trim().toUpperCase();
    if (!normalizedCode) {
      alert("Coupon code is required.");
      return;
    }

    if (editCoupon.discountValue <= 0) {
      alert("Discount value must be greater than zero.");
      return;
    }

    setIsCouponUpdating(true);
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(editingCouponId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCouponPayload(editCoupon)),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to update coupon");

      setShowEditCouponModal(false);
      setEditingCouponId(null);
      setEditCoupon(EMPTY_COUPON_DRAFT);
      await fetchCoupons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Unable to update coupon."));
    } finally {
      setIsCouponUpdating(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon, nextStatus: boolean) => {
    const couponId = getCouponId(coupon);
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(couponId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to update coupon");
      await fetchCoupons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Unable to update coupon."));
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    const couponId = getCouponId(coupon);
    if (!confirm(`Delete coupon ${coupon.code}? This action cannot be undone.`)) return;

    setDeletingCouponId(couponId);
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(couponId)}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to delete coupon");
      await fetchCoupons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Unable to delete coupon."));
    } finally {
      setDeletingCouponId(null);
    }
  };

  const openAdjustModal = (medicine: Medicine) => {
    setAdjustTarget(medicine);
    setAdjustDelta(0);
    setAdjustReason("");
    setShowAdjustModal(true);
  };

  const handleAdjustInventory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adjustTarget) return;

    const delta = Number(adjustDelta);
    if (!Number.isFinite(delta) || delta === 0) {
      alert("Enter a non-zero stock adjustment (positive to add, negative to remove).");
      return;
    }

    setIsAdjustingStock(true);
    try {
      const targetId = adjustTarget.id || adjustTarget._id;
      if (!targetId) throw new Error("Missing medicine id");

      const res = await fetch(`${API_BASE}/api/inventory/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: targetId,
          delta,
          reason: adjustReason,
          actorEmail: user?.email,
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to adjust inventory");
      }

      setShowAdjustModal(false);
      setAdjustTarget(null);
      await Promise.all([fetchMedicines(), fetchInventory()]);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Unable to adjust inventory right now."));
    } finally {
      setIsAdjustingStock(false);
    }
  };

  const updateOrder = async (payload: { status?: OrderStatus; paymentStatus?: PaymentStatus; pharmacistReviewComment?: string }) => {
    if (!selectedOrder) return;
    setIsSavingOrder(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");
      await fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Unable to update order right now.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const resetImport = () => {
    setImportError(null);
    setImportRows([]);
    setImportProgress(null);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const normalizeExcelHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const parseExcelBoolean = (value: unknown, fallback: boolean) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const text = String(value ?? "").trim().toLowerCase();
    if (!text) return fallback;
    if (["true", "yes", "y", "1", "rx", "required"].includes(text)) return true;
    if (["false", "no", "n", "0", "otc", "notrequired"].includes(text)) return false;
    return fallback;
  };

  const buildImportRow = (raw: Record<string, unknown>, index: number): ImportMedicineRow => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) normalized[normalizeExcelHeader(key)] = value;

    const medicineId = String(
      normalized.medicineid ?? normalized.medicinecode ?? normalized.sku ?? normalized.code ?? normalized.id ?? "",
    ).trim();
    const name = String(normalized.name ?? normalized.medicinename ?? normalized.productname ?? "").trim();
    const strength = String(normalized.strength ?? normalized.dosage ?? normalized.power ?? "").trim();
    const category = String(normalized.category ?? normalized.type ?? "Skin Care").trim() || "Skin Care";
    const description = String(normalized.description ?? normalized.desc ?? "").trim();

    const priceValue = Number(normalized.price ?? normalized.mrp ?? normalized.cost ?? 0);
    const quantityValue = Number(normalized.quantity ?? normalized.stock ?? normalized.qty ?? 0);
    const requiresPrescription = parseExcelBoolean(normalized.requiresprescription ?? normalized.rx ?? normalized.requiresrx, true);

    const issues: string[] = [];
    if (!medicineId) issues.push("Missing medicineId");
    if (!name) issues.push("Missing name");
    if (!Number.isFinite(priceValue) || priceValue < 0) issues.push("Invalid price");
    if (!Number.isFinite(quantityValue) || quantityValue < 0) issues.push("Invalid stock");

    const medicine: Medicine = {
      medicineId,
      name,
      strength,
      price: Number.isFinite(priceValue) ? priceValue : 0,
      quantity: Number.isFinite(quantityValue) ? Math.trunc(quantityValue) : 0,
      category,
      description,
      requiresPrescription,
    };

    return {
      rowNumber: index + 2, // header row is usually 1
      medicine,
      selected: issues.length === 0,
      issues,
    };
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setIsImportParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("Excel file has no sheets");
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows = rawRows
        .map((raw, rawIndex) => ({ raw, rawIndex }))
        .filter(({ raw }) => Object.values(raw).some((value) => String(value ?? "").trim() !== ""))
        .map(({ raw, rawIndex }) => buildImportRow(raw, rawIndex));
      if (rows.length === 0) throw new Error("No medicine rows found in the uploaded file");
      setImportRows(rows);
    } catch (error) {
      console.error(error);
      setImportError(getErrorMessage(error, "Unable to read this Excel file."));
      setImportRows([]);
    } finally {
      setIsImportParsing(false);
    }
  };

  const toggleImportAll = (checked: boolean) => {
    setImportRows((prev) =>
      prev.map((row) => (row.issues.length > 0 ? { ...row, selected: false } : { ...row, selected: checked })),
    );
  };

  const toggleImportRow = (rowNumber: number, checked: boolean) => {
    setImportRows((prev) => prev.map((row) => (row.rowNumber === rowNumber ? { ...row, selected: checked } : row)));
  };

  const createMedicine = async (medicine: Medicine) => {
    const res = await fetch(`${API_BASE}/api/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicine),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message || "Failed to add medicine");
    }
  };

  const submitImport = async () => {
    if (isImportSubmitting) return;
    const selected = importRows.filter((row) => row.selected && row.issues.length === 0);
    if (selected.length === 0) return alert("Select at least one valid medicine row to import.");

    setIsImportSubmitting(true);
    setImportProgress({ done: 0, total: selected.length });
    setImportError(null);

    const failures: Array<{ rowNumber: number; message: string }> = [];
    try {
      for (let idx = 0; idx < selected.length; idx += 1) {
        const row = selected[idx];
        try {
          await createMedicine(row.medicine);
        } catch (error) {
          failures.push({ rowNumber: row.rowNumber, message: getErrorMessage(error, "Failed to add medicine") });
        } finally {
          setImportProgress({ done: idx + 1, total: selected.length });
        }
      }

      await fetchMedicines();
      if (failures.length === 0) {
        setShowImportModal(false);
        resetImport();
        alert(`Imported ${selected.length} medicines.`);
      } else {
        setImportError(`Imported ${selected.length - failures.length}/${selected.length}. Failed rows: ${failures.map((f) => f.rowNumber).join(", ")}`);
      }
    } finally {
      setIsImportSubmitting(false);
    }
  };

  const handleAddMedicine = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCatalogLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to add medicine" }));
        throw new Error(errorData.message || "Failed to add medicine");
      }
      setShowAddModal(false);
      setNewMed({ medicineId: "", name: "", strength: "", price: 0, quantity: 0, category: "Skin Care", description: "", requiresPrescription: true });
      await fetchMedicines();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to add medicine.");
    } finally {
      setIsCatalogLoading(false);
    }
  };

  const handleAddSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSlotsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      if (!res.ok) throw new Error("Failed to add slot");
      setShowAddSlotModal(false);
      await fetchSlots();
    } catch (error) {
      console.error(error);
      alert("Unable to create slot.");
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const exportOrders = () => {
    const header = ["Order ID", "Customer", "Email", "Phone", "Created At", "Status", "Payment", "Fulfillment", "Items", "Amount"];
    const rows = orders.map((order) => [order.id, order.user.name, order.user.email, order.user.phone || "", formatDateTime(order.createdAt), statusLabel(order.status), statusLabel(order.paymentStatus), statusLabel(order.fulfillmentMethod), String(order.itemsCount), String(order.finalAmount)]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("`n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isAuthLoading || !user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-background pt-24">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <div className="flex items-center gap-4 font-bold text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Securing admin workspace...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-10">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 lg:flex-row lg:px-6">
        <aside className={`${UI.card} w-full shrink-0 p-5 lg:sticky lg:top-28 lg:w-80 lg:self-start`}>
          <div className="mb-6 rounded-lg bg-slate-100 p-5 text-slate-900 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Panel</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">
              {activeTab === "orders"
                ? "Orders"
                : activeTab === "catalog"
                  ? "Medicine Catalogue"
                  : activeTab === "inventory"
                    ? "Inventory"
                    : activeTab === "slots"
                      ? "Pick-up Slots"
                      : "Coupons"}
            </h1>
            <p className="mt-2 text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="space-y-2">
            {[
              { id: "orders", label: "Orders", icon: LayoutDashboard },
              { id: "catalog", label: "Medicine Catalogue", icon: Pill },
              { id: "inventory", label: "Inventory", icon: Boxes },
              { id: "slots", label: "Pick-up Slots", icon: Calendar },
              { id: "coupons", label: "Coupons", icon: Tag },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm font-bold transition ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? "text-primary-foreground" : "text-slate-600"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          <header className={`${UI.card} p-6`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Workspace</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {activeTab === "orders"
                    ? "Order Management"
                    : activeTab === "catalog"
                      ? "Medicine Catalogue"
                      : activeTab === "inventory"
                        ? "Inventory Management"
                        : activeTab === "slots"
                          ? "Pick-up Management"
                          : "Coupons"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {activeTab === "orders"
                    ? "The admin panel provides full visibility and control over all orders from placement to completion."
                    : activeTab === "catalog"
                      ? "Manage medicine metadata and create new products."
                      : activeTab === "inventory"
                        ? "Track stock levels, adjust quantities, and review every inventory movement."
                        : activeTab === "slots"
                          ? "Create and monitor collection windows for pick-up orders."
                          : "Create promo codes, control discount rules, and activate/deactivate campaigns instantly."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === "orders" && (
                  <button onClick={exportOrders} className={UI.buttonDark}>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                )}
                {activeTab === "catalog" && (
                  <>
                    <button
                      onClick={() => {
                        resetImport();
                        setShowImportModal(true);
                      }}
                      className={UI.buttonSecondary}
                    >
                      <Upload className="h-4 w-4" />
                      Import Excel
                    </button>
                    <button onClick={() => setShowAddModal(true)} className={UI.buttonPrimary}>
                      <Plus className="h-4 w-4" />
                      Add Medicine
                    </button>
                  </>
                )}
                {activeTab === "slots" && (
                  <button onClick={() => setShowAddSlotModal(true)} className={UI.buttonPrimary}>
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </button>
                )}
                {activeTab === "coupons" && (
                  <button onClick={() => setShowAddCouponModal(true)} className={UI.buttonPrimary}>
                    <Plus className="h-4 w-4" />
                    Create Coupon
                  </button>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Access</p>
                    <p className="text-sm font-bold">Admin verified</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Today Orders", value: summary.todayOrders, icon: LayoutDashboard },
                  { label: "Pending Review", value: summary.pendingReview, icon: ShieldAlert },
                  { label: "Processing", value: summary.processingOrders, icon: Truck },
                  { label: "Completed", value: summary.completedOrders, icon: Check },
                  { label: "Revenue", value: formatCurrency(summary.revenue), icon: Tag },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-5 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className={`${UI.card} p-5`}>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order id, customer, email, phone, medicine" className="w-full rounded-lg border border-border bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                  <select value={fulfillmentFilter} onChange={(event) => setFulfillmentFilter(event.target.value)} className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Fulfillment</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP">Pick-up</option>
                  </select>
                  <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Payment</option>
                    {PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                </div>
                <label className="mt-4 inline-flex items-center gap-3 rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={prescriptionOnly} onChange={(event) => setPrescriptionOnly(event.target.checked)} />
                  Prescription orders only
                </label>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                <div className={`${UI.card} p-4`}>
                  <div className="hidden grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] gap-3 rounded-lg bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
                    <span>Customer</span><span>Order</span><span>Status</span><span>Mode</span><span>Amount</span><span></span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {isOrdersLoading ? (
                      <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading order dashboard...</div>
                    ) : ordersError ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No orders matched the current filters.</div>
                    ) : orders.map((order) => (
                      <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`grid w-full gap-4 rounded-lg border p-4 text-left transition md:grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] md:items-center ${selectedOrderId === order.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/20 hover:bg-slate-50"}`}>
                        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><UserRound className="h-5 w-5" /></div><div><p className="font-bold text-slate-900">{order.user.name}</p><p className="text-xs text-muted-foreground">{order.user.phone || order.user.email}</p></div></div>
                        <div><p className="text-sm font-bold text-slate-900">#{order.id.slice(-8)}</p><p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p></div>
                        <div><span className="inline-flex rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">{statusLabel(order.status)}</span><p className="mt-2 text-xs text-muted-foreground">{statusLabel(order.paymentStatus)}</p></div>
                        <div><p className="text-sm font-bold text-slate-900">{statusLabel(order.fulfillmentMethod)}</p><p className="text-xs text-muted-foreground">{order.itemsCount} item(s)</p></div>
                        <div><p className="text-base font-semibold text-primary">{formatCurrency(order.finalAmount)}</p><p className="text-xs text-muted-foreground">{order.requiresPrescription ? "Rx required" : "No prescription"}</p></div>
                        <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${UI.card} p-5`}>
                  {selectedOrder ? (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary/70">Order Detail View</p><h3 className="mt-2 text-2xl font-semibold text-slate-900">#{selectedOrder.id.slice(-8)}</h3><p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(selectedOrder.createdAt)}</p></div><span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">{statusLabel(selectedOrder.status)}</span></div>
                      <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</p><p className="mt-2 font-bold text-slate-900">{selectedOrder.user.name}</p><p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p><p className="text-sm text-muted-foreground">{selectedOrder.user.phone || "Phone unavailable"}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fulfillment</p><p className="mt-2 font-bold text-slate-900">{statusLabel(selectedOrder.fulfillmentMethod)}</p><p className="text-sm text-muted-foreground">{selectedOrder.fulfillmentMethod === "PICKUP" ? selectedOrder.pickupSlotTime || "Pick-up slot pending" : selectedOrder.shippingAddress || "Delivery address unavailable"}</p></div>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medicines</p><p className="text-sm font-bold text-primary">{formatCurrency(selectedOrder.finalAmount)}</p></div>
                        <div className="space-y-3">{selectedOrder.items.map((item) => <div key={item.id || `${item.medicine?.name}-${item.quantity}`} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3"><div><p className="font-bold text-slate-900">{item.medicine?.name || "Medicine"}</p><p className="text-xs text-muted-foreground">{item.medicine?.category || "Category unavailable"}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900">Qty {item.quantity}</p><p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p></div></div>)}</div>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prescription Verification</p><span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider ${selectedOrder.prescriptionImage ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{selectedOrder.prescriptionImage ? "File Available" : "No Upload"}</span></div>
                        {selectedOrder.prescriptionImage ? (
                          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                            <button onClick={() => window.open(toAssetUrl(selectedOrder.prescriptionImage), "_blank", "noopener,noreferrer")} className="group relative overflow-hidden rounded-lg border border-border"><img src={toAssetUrl(selectedOrder.prescriptionImage)} alt="Prescription" className="h-36 w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white transition group-hover:bg-slate-950/45"><Eye className="h-6 w-6 opacity-0 transition group-hover:opacity-100" /></div></button>
                            <div className="space-y-3"><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} placeholder="Add review notes for this order" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" /><button onClick={() => void updateOrder({ pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-60">{isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save Review Note</button></div>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">This order does not include an uploaded prescription file.</p>}
                      </div>
                      <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
                        <label><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order Status</p><select value={selectedOrder.status} onChange={(event) => void updateOrder({ status: event.target.value as OrderStatus })} className="mt-2 w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                        <label><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Status</p><select value={selectedOrder.paymentStatus} onChange={(event) => void updateOrder({ paymentStatus: event.target.value as PaymentStatus })} className="mt-2 w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">{PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                      </div>
                      <div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Actions</p><div className="flex flex-wrap gap-3">{QUICK_ACTIONS[selectedOrder.status].length ? QUICK_ACTIONS[selectedOrder.status].map((status) => <button key={status} onClick={() => void updateOrder({ status, pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{statusLabel(status)}</button>) : <p className="text-sm text-muted-foreground">No quick actions left for the current order state.</p>}</div></div>
                    </div>
                  ) : <div className="flex min-h-72 items-center justify-center text-center text-muted-foreground">Select an order to inspect its customer, prescription, and fulfillment details.</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Total SKUs", value: inventorySummary.totalSkus, icon: Boxes },
                  { label: "Low Stock", value: inventorySummary.lowStockSkus, icon: ShieldAlert },
                  { label: "Out Of Stock", value: inventorySummary.outOfStockSkus, icon: Truck },
                  { label: "Total Units", value: inventorySummary.totalUnits, icon: Pill },
                  { label: "Stock Value", value: formatCurrency(inventorySummary.totalStockValue), icon: Tag },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-5 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
                <div className={`${UI.card} p-5`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Levels</p>
                      <p className="mt-2 text-sm text-muted-foreground">Adjust stock and keep your catalogue in sync with checkout availability.</p>
                    </div>
                    <button
                      onClick={() => void Promise.all([fetchMedicines(), fetchInventory()])}
                      className={UI.buttonSecondary}
                    >
                      Refresh
                    </button>
                  </div>

                  {isCatalogLoading && medicines.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      Loading inventory...
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                      No medicines found. Add medicines in the Catalogue tab first.
                    </div>
                  ) : (
                    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-white">
                      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.6fr)] items-center gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <span>Medicine</span>
                        <span>Stock</span>
                        <span className="text-right">Action</span>
                      </div>
                      <div className="divide-y divide-border">
                        {medicines.map((medicine, index) => {
                          const stock = Number(medicine.stock ?? medicine.quantity ?? 0);
                          const isOut = stock <= 0;
                          const isLow = !isOut && stock <= inventorySummary.lowStockThreshold;
                          const badgeClass = isOut
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isLow
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200";
                          const badgeLabel = isOut ? "Out" : isLow ? "Low" : "OK";

                          return (
                            <div key={medicine.id || medicine._id || `${medicine.name}-${index}`} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.6fr)] items-center gap-4 px-5 py-4">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{medicine.name}</p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">{medicine.category}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{badgeLabel}</span>
                                <span className="text-sm font-semibold text-slate-900">{stock}</span>
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => openAdjustModal(medicine)} className={UI.buttonPrimary}>
                                  Adjust
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`${UI.card} p-5`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Movement History</p>
                      <p className="mt-2 text-sm text-muted-foreground">Last 50 stock events (sales, adjustments, restocks).</p>
                    </div>
                    <select
                      value={movementMedicineFilter}
                      onChange={(event) => setMovementMedicineFilter(event.target.value)}
                      className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:bg-white [color-scheme:light]"
                    >
                      <option value="ALL">All medicines</option>
                      {medicines.map((m) => (
                        <option key={m.id || m._id || m.name} value={(m.id || m._id) as string}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isInventoryLoading && inventoryMovements.length === 0 ? (
                    <div className="mt-6 flex min-h-64 items-center justify-center gap-4 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      Loading movements...
                    </div>
                  ) : inventoryMovements.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                      No movements yet.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {inventoryMovements.map((movement) => (
                        <div key={movement.id} className="rounded-lg border border-border bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{movement.medicine?.name ?? "Medicine"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleString("en-IN")}</p>
                            </div>
                            <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabel(movement.type)}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delta</p>
                              <p className={`mt-2 font-semibold ${movement.delta < 0 ? "text-rose-700" : "text-emerald-700"}`}>{movement.delta}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Before</p>
                              <p className="mt-2 font-semibold text-slate-900">{movement.beforeStock}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">After</p>
                              <p className="mt-2 font-semibold text-slate-900">{movement.afterStock}</p>
                            </div>
                          </div>
                          {movement.reason ? <p className="mt-3 text-xs text-muted-foreground">Reason: {movement.reason}</p> : null}
                          {movement.orderId ? <p className="mt-1 text-xs text-muted-foreground">Order: {movement.orderId}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "catalog" && (
            <div className={`${UI.card} p-6`}>
              {isCatalogLoading && medicines.length === 0 ? (
                <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading medicine catalogue...</div>
              ) : medicines.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Catalog is empty. Add your first medicine to make it available for checkout.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3">Medicine ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Strength</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Rx</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {medicines.map((medicine, index) => (
                        <tr
                          key={medicine.id || medicine._id || `${medicine.name}-${index}`}
                          className="bg-white hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-primary">
                            {medicine.medicineId || "AUTO"}
                          </td>
                          <td className="max-w-[260px] px-4 py-3 text-sm font-semibold text-slate-900">
                            <p className="truncate">{medicine.name}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">{medicine.strength || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">{medicine.category}</td>
                          <td className="px-4 py-3">
                            {medicine.requiresPrescription ? (
                              <span className="inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                                Rx only
                              </span>
                            ) : (
                              <span className="inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-primary">{formatCurrency(medicine.price)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-800">{medicine.quantity}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <p className="max-w-[360px] truncate">{medicine.description}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Slots</p><p className="mt-5 text-2xl font-semibold text-slate-900">{slots.length}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booked Capacity</p><p className="mt-5 text-2xl font-semibold text-slate-900">{slots.reduce((sum, slot) => sum + slot.currentBookings, 0)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Capacity</p><p className="mt-5 text-2xl font-semibold text-slate-900">{slots.reduce((sum, slot) => sum + Math.max(slot.maxBookings - slot.currentBookings, 0), 0)}</p></div>
              </div>
              <div className={`${UI.card} p-5`}>
                {isSlotsLoading && slots.length === 0 ? (
                  <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading pickup slots...</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot, index) => {
                      const fill = slot.maxBookings ? (slot.currentBookings / slot.maxBookings) * 100 : 0;
                      return (
                        <div key={slot.id || `${slot.date}-${slot.timeSlot}-${index}`} className="rounded-lg border border-border bg-white p-5">
                          <div className="flex items-center justify-between"><span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">{new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span><Clock className="h-5 w-5 text-muted-foreground" /></div>
                          <p className="mt-5 text-xl font-semibold text-slate-900">{slot.timeSlot}</p>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${fill}%` }} className="h-full bg-primary" /></div>
                          <div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-bold text-slate-900">{slot.currentBookings}/{slot.maxBookings}</span></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Coupons</p>
                  <p className="mt-5 text-2xl font-semibold text-slate-900">{couponStats.total}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Active</p>
                  <p className="mt-4 text-2xl font-semibold text-emerald-900">{couponStats.active}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Expiring In 7 Days</p>
                  <p className="mt-4 text-2xl font-semibold text-amber-900">{couponStats.expiringSoon}</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">Usage Exhausted</p>
                  <p className="mt-4 text-2xl font-semibold text-rose-900">{couponStats.exhausted}</p>
                </div>
              </div>

              <div className={`${UI.card} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Campaign Rules</p>
                    <p className="mt-1 text-sm text-muted-foreground">Toggle coupons instantly or remove obsolete codes.</p>
                  </div>
                  <button
                    onClick={() => void fetchCoupons()}
                    className={UI.buttonSecondary}
                  >
                    Refresh
                  </button>
                </div>

                {isCouponsLoading ? (
                  <div className="flex min-h-56 items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    Loading coupons...
                  </div>
                ) : couponError ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{couponError}</div>
                ) : coupons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                    No coupons found. Create your first code to unlock discount campaigns.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {coupons.map((coupon) => {
                      const couponId = getCouponId(coupon);
                      const usageLimit = Number(coupon.usageLimit || 0);
                      const usedCount = Number(coupon.usedCount || 0);
                      const isExhausted = usageLimit > 0 && usedCount >= usageLimit;

                      return (
                        <div key={couponId} className="rounded-lg border border-border bg-white p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">{coupon.code}</span>
                                <span
                                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                    coupon.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {coupon.isActive ? "Active" : "Inactive"}
                                </span>
                                {isExhausted ? <span className="rounded-md bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">Exhausted</span> : null}
                              </div>
                              <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCouponValue(coupon)} OFF</p>
                              <p className="mt-1 text-sm text-muted-foreground">{coupon.description || "No description provided."}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditCouponModal(coupon)}
                                className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
                                aria-label={`Edit ${coupon.code}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => void deleteCoupon(coupon)}
                                disabled={deletingCouponId === couponId}
                                className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                                aria-label={`Delete ${coupon.code}`}
                              >
                                {deletingCouponId === couponId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Min Order</p>
                              <p className="mt-2 font-semibold text-slate-900">{formatCurrency(Number(coupon.minOrderAmount || 0))}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usage</p>
                              <p className="mt-2 font-semibold text-slate-900">{usageLimit > 0 ? `${usedCount}/${usageLimit}` : `${usedCount} used`}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                              {coupon.expiresAt ? `Expires ${new Date(coupon.expiresAt).toLocaleDateString("en-IN")}` : "No expiry date"}
                            </p>
                            <button
                              onClick={() => void toggleCouponStatus(coupon, !coupon.isActive)}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                                coupon.isActive ? "bg-slate-100 text-slate-700" : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {coupon.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showAdjustModal && adjustTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isAdjustingStock) return;
                setShowAdjustModal(false);
                setAdjustTarget(null);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-xl rounded-lg bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-semibold text-slate-900">Adjust Inventory</h3>
              <p className="mt-2 text-sm text-muted-foreground">Positive adds stock, negative removes stock.</p>

              <form onSubmit={handleAdjustInventory} className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{adjustTarget.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{adjustTarget.category}</p>
                </div>

                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delta</span>
                  <input
                    type="number"
                    required
                    value={adjustDelta}
                    onChange={(event) => setAdjustDelta(Number(event.target.value))}
                    placeholder="e.g. 25 or -10"
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reason (Optional)</span>
                  <input
                    value={adjustReason}
                    onChange={(event) => setAdjustReason(event.target.value)}
                    placeholder="Restock delivery, expiry, manual correction"
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdjustingStock) return;
                      setShowAdjustModal(false);
                      setAdjustTarget(null);
                    }}
                    className={UI.buttonSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdjustingStock}
                    className={UI.buttonPrimary}
                  >
                    {isAdjustingStock ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isImportParsing || isImportSubmitting) return;
                setShowImportModal(false);
                resetImport();
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-5xl rounded-lg bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-semibold text-slate-900">Import Medicines (Excel)</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload an Excel file with columns like <span className="font-semibold text-slate-700">medicineId</span>,{" "}
                <span className="font-semibold text-slate-700">name</span>, <span className="font-semibold text-slate-700">strength</span>,{" "}
                <span className="font-semibold text-slate-700">category</span>, <span className="font-semibold text-slate-700">price</span>,{" "}
                <span className="font-semibold text-slate-700">quantity</span>, <span className="font-semibold text-slate-700">description</span>,{" "}
                <span className="font-semibold text-slate-700">requiresPrescription</span>.
              </p>

              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => void handleImportFileChange(event)}
                className="hidden"
                disabled={isImportParsing || isImportSubmitting}
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => importFileRef.current?.click()}
                  disabled={isImportParsing || isImportSubmitting}
                  className={UI.buttonSecondary}
                >
                  {isImportParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Choose Excel File
                </button>

                {importRows.length > 0 ? (
                  <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isImportAllSelected}
                      onChange={(event) => toggleImportAll(event.target.checked)}
                      disabled={isImportSubmitting || importSelectableCount === 0}
                    />
                    Select all ({importSelectedCount}/{importSelectableCount})
                  </label>
                ) : null}
              </div>

              {importError ? (
                <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{importError}</div>
              ) : null}

              {importRows.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {isImportParsing ? "Reading file..." : "No file selected yet. Click “Choose Excel File” to start."}
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="w-12 px-4 py-3">Add</th>
                        <th className="w-20 px-4 py-3">Row</th>
                        <th className="px-4 py-3">Medicine ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Strength</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3">Rx</th>
                        <th className="px-4 py-3">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importRows.map((row) => (
                        <tr key={row.rowNumber} className="bg-white">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              disabled={isImportSubmitting || row.issues.length > 0}
                              onChange={(event) => toggleImportRow(row.rowNumber, event.target.checked)}
                            />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{row.rowNumber}</td>
                          <td className="px-4 py-3 font-semibold text-primary">{row.medicine.medicineId || "—"}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.medicine.name || "—"}</td>
                          <td className="px-4 py-3 text-slate-800">{row.medicine.strength || "—"}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(row.medicine.price)}</td>
                          <td className="px-4 py-3 text-right text-slate-800">{row.medicine.quantity}</td>
                          <td className="px-4 py-3 text-slate-800">{row.medicine.requiresPrescription ? "Rx" : "OTC"}</td>
                          <td className="px-4 py-3 text-xs">
                            {row.issues.length > 0 ? (
                              <span className="font-bold text-rose-700">{row.issues.join(", ")}</span>
                            ) : (
                              <span className="font-bold text-emerald-700">Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {importProgress ? (
                    <span>
                      Importing {importProgress.done}/{importProgress.total}…
                    </span>
                  ) : importRows.length > 0 ? (
                    <span>Choose which medicines to add, or select all.</span>
                  ) : (
                    <span />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isImportParsing || isImportSubmitting) return;
                      setShowImportModal(false);
                      resetImport();
                    }}
                    className={UI.buttonSecondary}
                    disabled={isImportParsing || isImportSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitImport()}
                    disabled={importRows.length === 0 || importSelectedCount === 0 || isImportSubmitting}
                    className={UI.buttonPrimary}
                  >
                    {isImportSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add Selected
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-2xl rounded-lg bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-slate-900">Add Medicine</h3>
              <form onSubmit={handleAddMedicine} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine ID</span>
                    <input required value={newMed.medicineId} onChange={(event) => setNewMed({ ...newMed, medicineId: event.target.value })} placeholder="SKIN-001" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine Name</span>
                    <input required value={newMed.name} onChange={(event) => setNewMed({ ...newMed, name: event.target.value })} placeholder="Tretinoin Cream" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Strength</span>
                    <input required value={newMed.strength} onChange={(event) => setNewMed({ ...newMed, strength: event.target.value })} placeholder="10mg / 0.05%" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</span>
                    <input required value={newMed.category} onChange={(event) => setNewMed({ ...newMed, category: event.target.value })} placeholder="Skin Care" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Price</span>
                    <input required type="number" value={newMed.price} onChange={(event) => setNewMed({ ...newMed, price: Number(event.target.value) })} placeholder="499" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</span>
                    <input required type="number" value={newMed.quantity} onChange={(event) => setNewMed({ ...newMed, quantity: Number(event.target.value) })} placeholder="25" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                </div>
                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
                  <textarea required rows={4} value={newMed.description} onChange={(event) => setNewMed({ ...newMed, description: event.target.value })} placeholder="Describe the medicine, usage, or key notes" className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={newMed.requiresPrescription} onChange={(event) => setNewMed({ ...newMed, requiresPrescription: event.target.checked })} />Requires prescription</label>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className={UI.buttonSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={UI.buttonPrimary}>
                    Save Medicine
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddSlotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddSlotModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-xl rounded-lg bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-slate-900">Create Pick-up Slot</h3>
              <form onSubmit={handleAddSlot} className="mt-6 space-y-4">
                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</span>
                  <input
                    type="date"
                    required
                    value={newSlot.date}
                    onChange={(event) => setNewSlot({ ...newSlot, date: event.target.value })}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>
                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time Slot</span>
                  <select
                    value={newSlot.timeSlot}
                    onChange={(event) => setNewSlot({ ...newSlot, timeSlot: event.target.value })}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  >
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>01:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 05:00 PM</option>
                    <option>05:00 PM - 07:00 PM</option>
                    <option>07:00 PM - 09:00 PM</option>
                  </select>
                </label>
                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Bookings</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSlot.maxBookings}
                    onChange={(event) => setNewSlot({ ...newSlot, maxBookings: Number(event.target.value) })}
                    placeholder="10"
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddSlotModal(false)} className={UI.buttonSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={UI.buttonPrimary}>
                    Save Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCouponModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isCouponSaving) return;
                setShowAddCouponModal(false);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-2xl rounded-lg bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-slate-900">Create Coupon</h3>
              <p className="mt-2 text-sm text-muted-foreground">Set discount logic and control campaign limits.</p>

              <form onSubmit={handleAddCoupon} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Code</span>
                    <input
                      required
                      value={newCoupon.code}
                      onChange={(event) => setNewCoupon({ ...newCoupon, code: event.target.value.toUpperCase() })}
                      placeholder="SKIN20"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discount Type</span>
                    <select
                      value={newCoupon.discountType}
                      onChange={(event) => setNewCoupon({ ...newCoupon, discountType: event.target.value as CouponDiscountType })}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FLAT">Flat Amount</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discount Value</span>
                    <input
                      required
                      type="number"
                      min="1"
                      value={newCoupon.discountValue}
                      onChange={(event) => setNewCoupon({ ...newCoupon, discountValue: Number(event.target.value) })}
                      placeholder={newCoupon.discountType === "PERCENTAGE" ? "20" : "150"}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Min Order Amount</span>
                    <input
                      type="number"
                      min="0"
                      value={newCoupon.minOrderAmount}
                      onChange={(event) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(event.target.value) })}
                      placeholder="0"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Discount (for %)</span>
                    <input
                      type="number"
                      min="0"
                      value={newCoupon.maxDiscountAmount}
                      onChange={(event) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(event.target.value) })}
                      placeholder="0 = no cap"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usage Limit</span>
                    <input
                      type="number"
                      min="0"
                      value={newCoupon.usageLimit}
                      onChange={(event) => setNewCoupon({ ...newCoupon, usageLimit: Number(event.target.value) })}
                      placeholder="0 = unlimited"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
                  <textarea
                    rows={3}
                    value={newCoupon.description}
                    onChange={(event) => setNewCoupon({ ...newCoupon, description: event.target.value })}
                    placeholder="20% off on skin-care essentials"
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry Date (optional)</span>
                    <input
                      type="date"
                      value={newCoupon.expiresAt}
                      onChange={(event) => setNewCoupon({ ...newCoupon, expiresAt: event.target.value })}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="mt-7 inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newCoupon.isActive}
                      onChange={(event) => setNewCoupon({ ...newCoupon, isActive: event.target.checked })}
                    />
                    Activate immediately
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCouponModal(false)}
                    className="rounded-lg border border-border px-5 py-3 font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCouponSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {isCouponSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditCouponModal && editingCouponId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isCouponUpdating) return;
                setShowEditCouponModal(false);
                setEditingCouponId(null);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-2xl rounded-lg bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-slate-900">Edit Coupon</h3>
              <p className="mt-2 text-sm text-muted-foreground">Update discount values, limits, or expiry rules.</p>

              <form onSubmit={handleUpdateCoupon} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Code</span>
                    <input
                      required
                      value={editCoupon.code}
                      onChange={(event) => setEditCoupon({ ...editCoupon, code: event.target.value.toUpperCase() })}
                      placeholder="SKIN20"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discount Type</span>
                    <select
                      value={editCoupon.discountType}
                      onChange={(event) => setEditCoupon({ ...editCoupon, discountType: event.target.value as CouponDiscountType })}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FLAT">Flat Amount</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discount Value</span>
                    <input
                      required
                      type="number"
                      min="1"
                      value={editCoupon.discountValue}
                      onChange={(event) => setEditCoupon({ ...editCoupon, discountValue: Number(event.target.value) })}
                      placeholder={editCoupon.discountType === "PERCENTAGE" ? "20" : "150"}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Min Order Amount</span>
                    <input
                      type="number"
                      min="0"
                      value={editCoupon.minOrderAmount}
                      onChange={(event) => setEditCoupon({ ...editCoupon, minOrderAmount: Number(event.target.value) })}
                      placeholder="0"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Discount (for %)</span>
                    <input
                      type="number"
                      min="0"
                      value={editCoupon.maxDiscountAmount}
                      onChange={(event) => setEditCoupon({ ...editCoupon, maxDiscountAmount: Number(event.target.value) })}
                      placeholder="0 = no cap"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usage Limit</span>
                    <input
                      type="number"
                      min="0"
                      value={editCoupon.usageLimit}
                      onChange={(event) => setEditCoupon({ ...editCoupon, usageLimit: Number(event.target.value) })}
                      placeholder="0 = unlimited"
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
                  <textarea
                    rows={3}
                    value={editCoupon.description}
                    onChange={(event) => setEditCoupon({ ...editCoupon, description: event.target.value })}
                    placeholder="20% off on skin-care essentials"
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry Date (optional)</span>
                    <input
                      type="date"
                      value={editCoupon.expiresAt}
                      onChange={(event) => setEditCoupon({ ...editCoupon, expiresAt: event.target.value })}
                      className="w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="mt-7 inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={editCoupon.isActive}
                      onChange={(event) => setEditCoupon({ ...editCoupon, isActive: event.target.checked })}
                    />
                    Keep active
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCouponUpdating) return;
                      setShowEditCouponModal(false);
                      setEditingCouponId(null);
                    }}
                    className="rounded-lg border border-border px-5 py-3 font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCouponUpdating}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {isCouponUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Update Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
