"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Boxes,
  Calendar,
  Check,
  CheckCircle2,
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
  card: "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  cardMuted: "rounded-2xl border border-slate-100 bg-slate-50/50",
  buttonPrimary: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60",
  buttonSecondary: "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60",
  buttonDark: "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60",
  buttonDanger: "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 border border-rose-100 transition hover:bg-rose-100 disabled:opacity-60",
  chip: "inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500",
  chipPrimary: "inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100",
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
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            Securing admin workspace...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] pt-24 pb-10">
      <Navbar />
      <div className="mx-auto flex max-w-[1700px] flex-col gap-8 px-6 lg:flex-row lg:px-10">
        <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-64 lg:self-start lg:h-[calc(100vh-10rem)] flex flex-col pt-4">
          <div className="mb-10 px-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Fina Admin
              </h1>
            </div>
            <p className="px-1 text-xs font-bold uppercase tracking-widest text-slate-400">Workspace</p>
          </div>

          <div className="flex-1 space-y-1.5 px-1">
            <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Menu</p>
            {[
              { id: "orders", label: "Orders", icon: LayoutDashboard },
              { id: "catalog", label: "Medicine", icon: Pill },
              { id: "inventory", label: "Inventory", icon: Boxes },
              { id: "slots", label: "Schedule", icon: Calendar },
              { id: "coupons", label: "Coupen", icon: Tag },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all duration-300 ${active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <item.icon className={`h-5 w-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 px-1">
            <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Other</p>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <ShieldAlert className="h-5 w-5 text-slate-400" />
              Help & Support
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 flex flex-col gap-10 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <header className="px-2">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome to {activeTab === "orders" ? "Orders" : activeTab === "catalog" ? "Medical Catalog" : activeTab === "inventory" ? "Inventory Control" : activeTab === "slots" ? "Schedules" : "Coupen"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  {activeTab === "orders" ? "Manage and fulfill customer orders at a glance." : activeTab === "catalog" ? "Keep your medical inventory detailed and up to date." : activeTab === "inventory" ? "Monitor stock levels and warehouse operations." : activeTab === "slots" ? "Organize store pickup windows for patients." : "Control discount codes and marketing campaigns."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
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
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Today Orders", value: summary.todayOrders, icon: LayoutDashboard },
                  { label: "Pending Review", value: summary.pendingReview, icon: ShieldAlert },
                  { label: "Processing", value: summary.processingOrders, icon: Truck },
                  { label: "Completed", value: summary.completedOrders, icon: Check },
                  { label: "Revenue", value: formatCurrency(summary.revenue), icon: Tag },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
                      <card.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {!selectedOrder ? (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
                  <div className="mb-8 rounded-3xl border border-slate-100 p-4 bg-[#fcfcfd]/50">
                    <div className="grid gap-4 lg:grid-cols-[1fr_repeat(3,180px)]">
                      <label className="relative group">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, customers, medicines..." className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all [color-scheme:light]" />
                      </label>
                      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm text-slate-900 font-semibold outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all cursor-pointer [color-scheme:light]">
                        <option value="ALL">All Statuses</option>
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                      </select>
                      <select value={fulfillmentFilter} onChange={(event) => setFulfillmentFilter(event.target.value)} className="rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm text-slate-900 font-semibold outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all cursor-pointer [color-scheme:light]">
                        <option value="ALL">All Delivery</option>
                        <option value="DELIVERY">Home Delivery</option>
                        <option value="PICKUP">Store Pickup</option>
                      </select>
                      <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm text-slate-900 font-semibold outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all cursor-pointer [color-scheme:light]">
                        <option value="ALL">All Payment</option>
                        {PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                      </select>
                    </div>
                    <div className="mt-4 flex items-center gap-4 px-2">
                      <label className="inline-flex items-center gap-2.5 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" className="sr-only peer" checked={prescriptionOnly} onChange={(event) => setPrescriptionOnly(event.target.checked)} />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">Prescription only</span>
                      </label>
                    </div>
                  </div>

                  <div className="hidden grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] gap-3 rounded-[1.5rem] bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:grid shadow-sm border border-slate-100 mb-4">
                    <span>Customer</span><span>Order</span><span>Status</span><span>Mode</span><span>Amount</span><span></span>
                  </div>
                  <div className="space-y-4">
                    {isOrdersLoading ? (
                      <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" />Preparing dashboard...</div>
                    ) : ordersError ? (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600 font-semibold">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-medium">No records found matching filters.</div>
                    ) : orders.map((order) => (
                      <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`grid w-full gap-4 rounded-[1.5rem] border p-5 text-left transition-all md:grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] md:items-center ${selectedOrderId === order.id ? "border-indigo-200 bg-indigo-50/30 shadow-md shadow-indigo-100/20" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/20"}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcfcfd] shadow-sm text-slate-400 ring-1 ring-slate-100"><UserRound className="h-5 w-5" /></div>
                          <div><p className="font-bold text-slate-900 leading-none">{order.user.name}</p><p className="mt-1.5 text-xs font-bold text-slate-400 tracking-tight">{order.user.phone || order.user.email}</p></div>
                        </div>
                        <div><p className="text-sm font-bold text-slate-900 leading-none">#{order.id.slice(-8)}</p><p className="mt-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{formatDateTime(order.createdAt)}</p></div>
                        <div><span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${order.status === 'PENDING_PHARMACIST_REVIEW' ? 'bg-amber-100 text-amber-600' : 'bg-slate-900 text-white'}`}>{statusLabel(order.status)}</span><p className="mt-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">{statusLabel(order.paymentStatus)}</p></div>
                        <div><p className="text-sm font-bold text-slate-900">{statusLabel(order.fulfillmentMethod)}</p><p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{order.itemsCount} Products</p></div>
                        <div><p className="text-lg font-bold text-indigo-600 tracking-tight">{formatCurrency(order.finalAmount)}</p><p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{order.requiresPrescription ? "Rx Required" : "No Rx"}</p></div>
                        <ChevronRight className={`ml-auto h-5 w-5 transition-colors ${selectedOrderId === order.id ? 'text-indigo-600' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#fcfcfd]/50 p-8 rounded-[2rem] border border-slate-50 mt-2">
                  <button onClick={() => setSelectedOrderId(null)} className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md active:scale-95">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                  </button>

                  <div className="space-y-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Detailed Log</p>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Order #{selectedOrder.id.slice(-8)}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-400">Captured at {formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                      <span className="rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-900">{statusLabel(selectedOrder.status)}</span>
                    </div>

                    <div className="grid gap-6 rounded-[1.5rem] bg-white border border-slate-100 p-6 shadow-sm md:grid-cols-2">
                      <div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Customer Profile</p><p className="text-lg font-bold text-slate-900">{selectedOrder.user.name}</p><p className="mt-1 text-sm font-medium text-slate-500">{selectedOrder.user.email}</p><p className="text-sm font-medium text-slate-500">{selectedOrder.user.phone || "No device contact"}</p></div>
                      <div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Service Mode</p><p className="text-lg font-bold text-slate-900">{statusLabel(selectedOrder.fulfillmentMethod)}</p><p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">{selectedOrder.fulfillmentMethod === "PICKUP" ? selectedOrder.pickupSlotTime || "Awaiting slot" : selectedOrder.shippingAddress || "N/A"}</p></div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white border border-slate-100 p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Inventory Items</p><p className="text-lg font-bold text-indigo-600 tracking-tight">{formatCurrency(selectedOrder.finalAmount)}</p></div>
                      <div className="space-y-4">{selectedOrder.items.map((item) => <div key={item.id || `${item.medicine?.name}-${item.quantity}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-50"><div><p className="font-bold text-slate-900">{item.medicine?.name || "Product"}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.medicine?.category || "Misc"}</p></div><div className="text-right"><p className="font-bold text-slate-900">x{item.quantity}</p><p className="mt-0.5 text-xs font-bold text-indigo-400">{formatCurrency(item.price)}</p></div></div>)}</div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white border border-slate-100 p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Medical Data</p><span className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${selectedOrder.prescriptionImage ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>{selectedOrder.prescriptionImage ? "RX ANALYZED" : "OTC ORDER"}</span></div>
                      {selectedOrder.prescriptionImage ? (
                        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
                          <button onClick={() => window.open(toAssetUrl(selectedOrder.prescriptionImage), "_blank", "noopener,noreferrer")} className="group relative overflow-hidden rounded-2xl border border-slate-100 ring-4 ring-slate-50 shadow-sm"><img src={toAssetUrl(selectedOrder.prescriptionImage)} alt="Prescription" className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white transition-all group-hover:bg-slate-950/40 opacity-0 group-hover:opacity-100"><Eye className="h-6 w-6" /></div></button>
                          <div className="space-y-4"><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} placeholder="Internal verification notes..." className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50" /><button onClick={() => void updateOrder({ pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="inline-flex items-center gap-2.5 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg">{isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Append Verification</button></div>
                        </div>
                      ) : <p className="text-sm font-medium text-slate-400 italic font-medium">Clearance not required for OTC items.</p>}
                    </div>

                    <div className="grid gap-6 rounded-[1.5rem] bg-white border border-slate-100 p-6 shadow-sm sm:grid-cols-2">
                      <label><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Lifecycle Status</p><select value={selectedOrder.status} onChange={(event) => void updateOrder({ status: event.target.value as OrderStatus })} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 [color-scheme:light]">{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                      <label><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Payment State</p><select value={selectedOrder.paymentStatus} onChange={(event) => void updateOrder({ paymentStatus: event.target.value as PaymentStatus })} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 [color-scheme:light]">{PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                    </div>

                    <div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Workflow Actions</p><div className="flex flex-wrap gap-3">{QUICK_ACTIONS[selectedOrder.status].length ? QUICK_ACTIONS[selectedOrder.status].map((status) => <button key={status} onClick={() => void updateOrder({ status, pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">{statusLabel(status)}</button>) : <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Finalized</p>}</div></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Total SKUs", value: inventorySummary.totalSkus, icon: Boxes },
                  { label: "Low Stock", value: inventorySummary.lowStockSkus, icon: ShieldAlert },
                  { label: "Out Of Stock", value: inventorySummary.outOfStockSkus, icon: Truck },
                  { label: "Total Units", value: inventorySummary.totalUnits, icon: Pill },
                  { label: "Stock Value", value: formatCurrency(inventorySummary.totalStockValue), icon: Tag },
                ].map((card) => (
                  <div key={card.label} className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                      <card.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {movementMedicineFilter === "ALL" ? (
                <div className="bg-[#fcfcfd]/50 p-8 rounded-[2rem] border border-slate-50">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Stock Levels</p>
                      <p className="text-sm font-medium text-slate-500">Adjust active stock to keep your catalogue in sync with storefront availability.</p>
                    </div>
                    <button
                      onClick={() => void Promise.all([fetchMedicines(), fetchInventory()])}
                      className="h-10 px-6 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
                    >
                      Refresh
                    </button>
                  </div>

                  {isCatalogLoading && medicines.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      Loading inventory...
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-medium bg-white">
                      No medicines found. Add medicines in the Catalogue tab first.
                    </div>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-950/5">
                      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.6fr)] items-center gap-4 bg-slate-50/50 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        <span>Medicine</span>
                        <span>Stock Remaining</span>
                        <span className="text-right">Action</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {medicines.map((medicine, index) => {
                          const stock = Number(medicine.stock ?? medicine.quantity ?? 0);
                          const isOut = stock <= 0;
                          const isLow = !isOut && stock <= inventorySummary.lowStockThreshold;
                          const badgeClass = isOut
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : isLow
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100";
                          const badgeLabel = isOut ? "Out" : isLow ? "Low" : "OK";

                          return (
                            <button
                              key={medicine.id || medicine._id || `${medicine.name}-${index}`}
                              onClick={() => setMovementMedicineFilter((medicine.id || medicine._id) as string)}
                              className="w-full text-left grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.6fr)] items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">{medicine.name}</p>
                                <p className="mt-1 truncate text-[11px] font-bold tracking-wider uppercase text-slate-400">{medicine.category}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>{badgeLabel}</span>
                                <span className="text-lg font-bold text-slate-900">{stock}</span>
                              </div>
                              <div className="flex justify-end">
                                <ChevronRight className="h-5 w-5 text-slate-300" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#fcfcfd]/50 p-8 rounded-[2rem] border border-slate-50 mt-2">
                  <div className="mb-8 flex items-center justify-between">
                    <button onClick={() => setMovementMedicineFilter("ALL")} className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md active:scale-95">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Inventory
                    </button>
                    {(() => {
                      const selectedMedicine = medicines.find(m => (m.id || m._id) === movementMedicineFilter);
                      if (!selectedMedicine) return null;
                      return (
                        <button onClick={() => openAdjustModal(selectedMedicine)} className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                          Adjust Stock
                        </button>
                      );
                    })()}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Detailed Log</p>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900">{medicines.find(m => (m.id || m._id) === movementMedicineFilter)?.name || "Movement History"}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-400">Recent inventory modifications.</p>
                    </div>
                  </div>

                  {isInventoryLoading && inventoryMovements.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center gap-4 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      Loading movements...
                    </div>
                  ) : inventoryMovements.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 bg-white">
                      No stock movements found for this item.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inventoryMovements.map((movement) => (
                        <div key={movement.id} className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4 mb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">{movement.medicine?.name ?? "Medicine"}</p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{new Date(movement.createdAt).toLocaleString("en-IN")}</p>
                            </div>
                            <span className="rounded-xl border border-slate-50 bg-slate-50/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">{statusLabel(movement.type)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Delta</p>
                              <p className={`mt-1 font-bold ${movement.delta < 0 ? "text-rose-600" : "text-emerald-600"}`}>{movement.delta > 0 ? `+${movement.delta}` : movement.delta}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Before</p>
                              <p className="mt-1 font-bold text-slate-900">{movement.beforeStock}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">After</p>
                              <p className="mt-1 font-bold text-slate-900">{movement.afterStock}</p>
                            </div>
                          </div>
                          {(movement.reason || movement.orderId) && (
                            <div className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-50 pt-3">
                              {movement.reason && <p>Reason: {movement.reason}</p>}
                              {movement.orderId && <p>Order Ref: #{movement.orderId.slice(-8)}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="bg-[#fcfcfd]/50 p-8 rounded-[2rem] border border-slate-50">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Medical Catalog</p>
                  <p className="text-sm font-medium text-slate-500">Manage all pharmaceutical entries, classes, and metadata.</p>
                </div>
              </div>

              {isCatalogLoading && medicines.length === 0 ? (
                <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" />Loading medicine catalogue...</div>
              ) : medicines.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-medium bg-white">Catalog is empty. Add your first medicine to make it available for checkout.</div>
              ) : (
                <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-950/5">
                  <table className="w-full min-w-[980px] text-sm text-left">
                    <thead className="bg-slate-50/50">
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4">ID / Reference</th>
                        <th className="px-6 py-4">Compound</th>
                        <th className="px-6 py-4">Classification</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Unit Price</th>
                        <th className="px-6 py-4 text-right">In Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {medicines.map((medicine, index) => (
                        <tr
                          key={medicine.id || medicine._id || `${medicine.name}-${index}`}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            #{medicine.medicineId || "AUTO-GEN"}
                          </td>
                          <td className="max-w-[260px] px-6 py-4">
                            <p className="truncate font-bold text-slate-900">{medicine.name}</p>
                            <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">{medicine.strength || "—"}</p>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-xs font-bold text-slate-600">
                            {medicine.category}
                          </td>
                          <td className="px-6 py-4">
                            {medicine.requiresPrescription ? (
                              <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 border border-amber-100/50">
                                Rx Restricted
                              </span>
                            ) : (
                              <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 border border-emerald-100/50">
                                Over Counter
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-indigo-600">
                            {formatCurrency(medicine.price)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-slate-900">
                            {medicine.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { label: "Active Slots", value: slots.length, icon: Calendar },
                  { label: "Booked Capacity", value: slots.reduce((sum, slot) => sum + slot.currentBookings, 0), icon: UserRound },
                  { label: "Open Capacity", value: slots.reduce((sum, slot) => sum + Math.max(slot.maxBookings - slot.currentBookings, 0), 0), icon: Boxes },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                      <card.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pick-up Scheduler</p>
                  <h3 className="text-xl font-bold text-slate-900">Active Time Slots</h3>
                </div>
                {isSlotsLoading && slots.length === 0 ? (
                  <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" />Loading pickup slots...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot, index) => {
                      const fill = slot.maxBookings ? (slot.currentBookings / slot.maxBookings) * 100 : 0;
                      return (
                        <div key={slot.id || `${slot.date}-${slot.timeSlot}-${index}`} className="group rounded-2xl border border-slate-100 bg-[#fcfcfd] p-6 transition-all hover:shadow-xl hover:shadow-indigo-50/50 hover:bg-white">
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">
                              {new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
                            </span>
                            <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                              <Clock className="h-4 w-4 text-slate-400" />
                            </div>
                          </div>
                          <p className="mt-6 text-xl font-bold text-slate-900">{slot.timeSlot}</p>
                          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${fill}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-violet-600" />
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-400 uppercase tracking-wider">Booked Capacity</span>
                            <span className="text-slate-900">{slot.currentBookings} / {slot.maxBookings}</span>
                          </div>
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
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total Coupons", value: couponStats.total, icon: Tag, color: "indigo" },
                  { label: "Active", value: couponStats.active, icon: Check, color: "emerald" },
                  { label: "Expiring Soon", value: couponStats.expiringSoon, icon: Clock, color: "amber" },
                  { label: "Exhausted", value: couponStats.exhausted, icon: ShieldAlert, color: "rose" },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] font-bold uppercase tracking-widest text-slate-400`}>{card.label}</p>
                      <card.icon className={`h-5 w-5 text-${card.color}-600`} />
                    </div>
                    <p className={`mt-4 text-3xl font-bold tracking-tight text-slate-900`}>{card.value}</p>
                  </div>
                ))}
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
                        <div key={couponId} className="group rounded-2xl border border-slate-100 bg-[#fcfcfd] p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">{coupon.code}</span>
                                <span
                                  className={`rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-widest border ${coupon.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}
                                >
                                  {coupon.isActive ? "Active" : "Inactive"}
                                </span>
                                {isExhausted ? <span className="rounded-lg bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100">Exhausted</span> : null}
                              </div>
                              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{formatCouponValue(coupon)} OFF</p>
                              <p className="mt-2 text-sm font-medium text-slate-400">{coupon.description || "Active discount campaign"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditCouponModal(coupon)} className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => void deleteCoupon(coupon)} disabled={deletingCouponId === couponId} className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50">{deletingCouponId === couponId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl bg-white p-4 border border-slate-50">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Order</p>
                              <p className="mt-1 font-bold text-slate-900">{formatCurrency(Number(coupon.minOrderAmount || 0))}</p>
                            </div>
                            <div className="rounded-xl bg-white p-4 border border-slate-50">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Usage Track</p>
                              <p className="mt-1 font-bold text-slate-900">{usageLimit > 0 ? `${usedCount} / ${usageLimit}` : `${usedCount} used`}</p>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">
                                {coupon.expiresAt ? `Ends ${new Date(coupon.expiresAt).toLocaleDateString("en-IN")}` : "Perpetual"}
                              </span>
                            </div>
                            <button
                              onClick={() => void toggleCouponStatus(coupon, !coupon.isActive)}
                              className={`rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 ${coupon.isActive ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-indigo-600 text-white"
                                }`}
                            >
                              {coupon.isActive ? "Pause" : "Start"}
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
