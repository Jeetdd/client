"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  Eye,
  LayoutDashboard,
  Loader2,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type AdminTab = "orders" | "catalog" | "slots" | "coupons";
type OrderStatus = "PENDING_PHARMACIST_REVIEW" | "APPROVED" | "REJECTED" | "DISPATCHED" | "DELIVERED" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface Medicine {
  id?: string;
  _id?: string;
  medicineId: string;
  name: string;
  strength: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  requiresPrescription: boolean;
  image?: string;
}

interface Slot {
  id?: string;
  date: string;
  timeSlot: string;
  maxBookings: number;
  currentBookings: number;
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

const EMPTY_SUMMARY: OrderSummary = {
  totalOrders: 0,
  todayOrders: 0,
  pendingReview: 0,
  processingOrders: 0,
  completedOrders: 0,
  revenue: 0,
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

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
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
    if (activeTab === "slots") void fetchSlots();
  }, [activeTab, user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN" || activeTab !== "orders") return;
    const timeout = setTimeout(() => void fetchOrders(), 250);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, fulfillmentFilter, paymentFilter, prescriptionOnly, activeTab, user]);

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_45%,#ffffff_100%)] pt-24 pb-8">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 lg:flex-row lg:px-6">
        <aside className="w-full shrink-0 rounded-[2rem] border border-primary/10 bg-white/80 p-4 shadow-[0_24px_80px_-48px_rgba(30,64,175,0.45)] backdrop-blur lg:sticky lg:top-28 lg:w-80 lg:self-start">
          <div className="mb-6 rounded-[1.75rem] bg-[linear-gradient(135deg,#0f4c81_0%,#1f7aa8_100%)] p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">Admin Backend</p>
            <h1 className="mt-3 text-3xl font-black leading-tight">Order Management</h1>
            <p className="mt-3 text-sm text-white/80">Live visibility from prescription review to delivery and pick-up.</p>
          </div>
          <div className="space-y-3">
            {[
              { id: "orders", label: "Orders", icon: LayoutDashboard },
              { id: "catalog", label: "Medicine Catalogue", icon: Pill },
              { id: "slots", label: "Pick-up Slots", icon: Calendar },
              { id: "coupons", label: "Coupons", icon: Tag },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex w-full items-center gap-4 rounded-[1.4rem] border p-4 text-left font-bold transition ${activeTab === item.id ? "border-primary bg-primary text-primary-foreground" : "border-transparent bg-slate-50 text-slate-800 hover:border-primary/10 hover:bg-white"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          <header className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(30,64,175,0.45)] backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/70">Module 10</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{activeTab === "orders" ? "Order Management" : activeTab === "catalog" ? "Medicine Catalogue" : activeTab === "slots" ? "Pick-up Management" : "Coupons"}</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{activeTab === "orders" ? "The admin panel provides full visibility and control over all orders from placement to completion." : activeTab === "catalog" ? "Manage medicine metadata and prescription-safe inventory." : activeTab === "slots" ? "Create and monitor collection windows for pick-up orders." : "Coupon management can be added in the same admin shell next."}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === "orders" && (
                  <button onClick={exportOrders} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                )}
                {activeTab === "catalog" && (
                  <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Add Medicine
                  </button>
                )}
                {activeTab === "slots" && (
                  <button onClick={() => setShowAddSlotModal(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </button>
                )}
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                  <ShieldAlert className="h-5 w-5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Review Authority</p>
                    <p className="text-sm font-bold">Admin verification active</p>
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
                  <div key={card.label} className="rounded-[1.6rem] border border-primary/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-5 text-3xl font-black text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-5 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order id, customer, email, phone, medicine" className="w-full rounded-2xl border border-border bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                  <select value={fulfillmentFilter} onChange={(event) => setFulfillmentFilter(event.target.value)} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Fulfillment</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP">Pick-up</option>
                  </select>
                  <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">
                    <option value="ALL">All Payment</option>
                    {PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                </div>
                <label className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={prescriptionOnly} onChange={(event) => setPrescriptionOnly(event.target.checked)} />
                  Prescription orders only
                </label>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-4 shadow-sm">
                  <div className="hidden grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] gap-3 rounded-[1.3rem] bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 md:grid">
                    <span>Customer</span><span>Order</span><span>Status</span><span>Mode</span><span>Amount</span><span></span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {isOrdersLoading ? (
                      <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading order dashboard...</div>
                    ) : ordersError ? (
                      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">No orders matched the current filters.</div>
                    ) : orders.map((order) => (
                      <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`grid w-full gap-4 rounded-[1.5rem] border p-4 text-left transition md:grid-cols-[1.1fr_0.85fr_0.75fr_0.75fr_0.8fr_36px] md:items-center ${selectedOrderId === order.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/20 hover:bg-slate-50"}`}>
                        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><UserRound className="h-5 w-5" /></div><div><p className="font-bold text-slate-900">{order.user.name}</p><p className="text-xs text-muted-foreground">{order.user.phone || order.user.email}</p></div></div>
                        <div><p className="text-sm font-bold text-slate-900">#{order.id.slice(-8)}</p><p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p></div>
                        <div><span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">{statusLabel(order.status)}</span><p className="mt-2 text-xs text-muted-foreground">{statusLabel(order.paymentStatus)}</p></div>
                        <div><p className="text-sm font-bold text-slate-900">{statusLabel(order.fulfillmentMethod)}</p><p className="text-xs text-muted-foreground">{order.itemsCount} item(s)</p></div>
                        <div><p className="text-base font-black text-primary">{formatCurrency(order.finalAmount)}</p><p className="text-xs text-muted-foreground">{order.requiresPrescription ? "Rx required" : "No prescription"}</p></div>
                        <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-primary/10 bg-white/90 p-5 shadow-sm">
                  {selectedOrder ? (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-primary/70">Order Detail View</p><h3 className="mt-2 text-2xl font-black text-slate-900">#{selectedOrder.id.slice(-8)}</h3><p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(selectedOrder.createdAt)}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">{statusLabel(selectedOrder.status)}</span></div>
                      <div className="grid gap-3 rounded-[1.6rem] bg-slate-50 p-4 sm:grid-cols-2">
                        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Customer</p><p className="mt-2 font-bold text-slate-900">{selectedOrder.user.name}</p><p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p><p className="text-sm text-muted-foreground">{selectedOrder.user.phone || "Phone unavailable"}</p></div>
                        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fulfillment</p><p className="mt-2 font-bold text-slate-900">{statusLabel(selectedOrder.fulfillmentMethod)}</p><p className="text-sm text-muted-foreground">{selectedOrder.fulfillmentMethod === "PICKUP" ? selectedOrder.pickupSlotTime || "Pick-up slot pending" : selectedOrder.shippingAddress || "Delivery address unavailable"}</p></div>
                      </div>
                      <div className="rounded-[1.6rem] border border-border p-4">
                        <div className="mb-4 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Medicines</p><p className="text-sm font-bold text-primary">{formatCurrency(selectedOrder.finalAmount)}</p></div>
                        <div className="space-y-3">{selectedOrder.items.map((item) => <div key={item.id || `${item.medicine?.name}-${item.quantity}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"><div><p className="font-bold text-slate-900">{item.medicine?.name || "Medicine"}</p><p className="text-xs text-muted-foreground">{item.medicine?.category || "Category unavailable"}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900">Qty {item.quantity}</p><p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p></div></div>)}</div>
                      </div>
                      <div className="rounded-[1.6rem] border border-border p-4">
                        <div className="mb-4 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Prescription Verification</p><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${selectedOrder.prescriptionImage ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{selectedOrder.prescriptionImage ? "File Available" : "No Upload"}</span></div>
                        {selectedOrder.prescriptionImage ? (
                          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                            <button onClick={() => window.open(toAssetUrl(selectedOrder.prescriptionImage), "_blank", "noopener,noreferrer")} className="group relative overflow-hidden rounded-[1.5rem] border border-border"><img src={toAssetUrl(selectedOrder.prescriptionImage)} alt="Prescription" className="h-36 w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white transition group-hover:bg-slate-950/45"><Eye className="h-6 w-6 opacity-0 transition group-hover:opacity-100" /></div></button>
                            <div className="space-y-3"><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} placeholder="Add review notes for this order" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" /><button onClick={() => void updateOrder({ pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary disabled:opacity-60">{isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save Review Note</button></div>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">This order does not include an uploaded prescription file.</p>}
                      </div>
                      <div className="grid gap-4 rounded-[1.6rem] border border-border p-4 sm:grid-cols-2">
                        <label><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Order Status</p><select value={selectedOrder.status} onChange={(event) => void updateOrder({ status: event.target.value as OrderStatus })} className="mt-2 w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                        <label><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Payment Status</p><select value={selectedOrder.paymentStatus} onChange={(event) => void updateOrder({ paymentStatus: event.target.value as PaymentStatus })} className="mt-2 w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white">{PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                      </div>
                      <div><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Quick Actions</p><div className="flex flex-wrap gap-3">{QUICK_ACTIONS[selectedOrder.status].length ? QUICK_ACTIONS[selectedOrder.status].map((status) => <button key={status} onClick={() => void updateOrder({ status, pharmacistReviewComment: reviewComment })} disabled={isSavingOrder} className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{statusLabel(status)}</button>) : <p className="text-sm text-muted-foreground">No quick actions left for the current order state.</p>}</div></div>
                    </div>
                  ) : <div className="flex min-h-72 items-center justify-center text-center text-muted-foreground">Select an order to inspect its customer, prescription, and fulfillment details.</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-5 shadow-sm">
              {isCatalogLoading && medicines.length === 0 ? (
                <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading medicine catalogue...</div>
              ) : medicines.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">Catalog is empty. Add your first medicine to make it available for checkout.</div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {medicines.map((medicine, index) => (
                    <div key={medicine.id || medicine._id || `${medicine.name}-${index}`} className="flex items-center gap-5 rounded-[1.5rem] border border-border bg-white p-4 transition hover:border-primary/20">
                      <img src={medicine.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400"} alt={medicine.name} className="h-24 w-24 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]"><span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{medicine.medicineId || "AUTO"}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{medicine.category}</span>{medicine.requiresPrescription && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Rx only</span>}</div>
                        <p className="truncate text-lg font-black text-slate-900">{medicine.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{medicine.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-4"><p className="font-bold text-primary">{formatCurrency(medicine.price)}</p><p className="text-sm text-muted-foreground">Stock: {medicine.quantity}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.6rem] border border-primary/10 bg-white p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Active Slots</p><p className="mt-5 text-3xl font-black text-slate-900">{slots.length}</p></div>
                <div className="rounded-[1.6rem] border border-primary/10 bg-white p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Booked Capacity</p><p className="mt-5 text-3xl font-black text-slate-900">{slots.reduce((sum, slot) => sum + slot.currentBookings, 0)}</p></div>
                <div className="rounded-[1.6rem] border border-primary/10 bg-white p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Open Capacity</p><p className="mt-5 text-3xl font-black text-slate-900">{slots.reduce((sum, slot) => sum + Math.max(slot.maxBookings - slot.currentBookings, 0), 0)}</p></div>
              </div>
              <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-5 shadow-sm">
                {isSlotsLoading && slots.length === 0 ? (
                  <div className="flex min-h-72 items-center justify-center gap-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-primary" />Loading pickup slots...</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot, index) => {
                      const fill = slot.maxBookings ? (slot.currentBookings / slot.maxBookings) * 100 : 0;
                      return (
                        <div key={slot.id || `${slot.date}-${slot.timeSlot}-${index}`} className="rounded-[1.6rem] border border-border bg-white p-5">
                          <div className="flex items-center justify-between"><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">{new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span><Clock className="h-5 w-5 text-muted-foreground" /></div>
                          <p className="mt-5 text-xl font-black text-slate-900">{slot.timeSlot}</p>
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
            <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-10 text-center shadow-sm">
              <Tag className="mx-auto h-10 w-10 text-primary/40" />
              <h3 className="mt-5 text-2xl font-black text-slate-900">Coupon Management Placeholder</h3>
              <p className="mt-3 text-sm text-muted-foreground">We can extend the same admin shell for coupon creation and discount rules next.</p>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900">Add Medicine</h3>
              <form onSubmit={handleAddMedicine} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Medicine ID</span>
                    <input required value={newMed.medicineId} onChange={(event) => setNewMed({ ...newMed, medicineId: event.target.value })} placeholder="SKIN-001" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Medicine Name</span>
                    <input required value={newMed.name} onChange={(event) => setNewMed({ ...newMed, name: event.target.value })} placeholder="Tretinoin Cream" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Strength</span>
                    <input required value={newMed.strength} onChange={(event) => setNewMed({ ...newMed, strength: event.target.value })} placeholder="10mg / 0.05%" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Category</span>
                    <input required value={newMed.category} onChange={(event) => setNewMed({ ...newMed, category: event.target.value })} placeholder="Skin Care" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Price</span>
                    <input required type="number" value={newMed.price} onChange={(event) => setNewMed({ ...newMed, price: Number(event.target.value) })} placeholder="499" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Quantity</span>
                    <input required type="number" value={newMed.quantity} onChange={(event) => setNewMed({ ...newMed, quantity: Number(event.target.value) })} placeholder="25" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                  </label>
                </div>
                <label className="space-y-2 block">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Description</span>
                  <textarea required rows={4} value={newMed.description} onChange={(event) => setNewMed({ ...newMed, description: event.target.value })} placeholder="Describe the medicine, usage, or key notes" className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white" />
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={newMed.requiresPrescription} onChange={(event) => setNewMed({ ...newMed, requiresPrescription: event.target.checked })} />Requires prescription</label>
                <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowAddModal(false)} className="rounded-2xl border border-border px-5 py-3 font-bold text-slate-700">Cancel</button><button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground">Save Medicine</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddSlotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddSlotModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="relative w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900">Create Pick-up Slot</h3>
              <form onSubmit={handleAddSlot} className="mt-6 space-y-4">
                <input type="date" required value={newSlot.date} onChange={(event) => setNewSlot({ ...newSlot, date: event.target.value })} className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white" />
                <select value={newSlot.timeSlot} onChange={(event) => setNewSlot({ ...newSlot, timeSlot: event.target.value })} className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"><option>09:00 AM - 11:00 AM</option><option>11:00 AM - 01:00 PM</option><option>01:00 PM - 03:00 PM</option><option>03:00 PM - 05:00 PM</option><option>05:00 PM - 07:00 PM</option><option>07:00 PM - 09:00 PM</option></select>
                <input type="number" min="1" required value={newSlot.maxBookings} onChange={(event) => setNewSlot({ ...newSlot, maxBookings: Number(event.target.value) })} className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white" />
                <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowAddSlotModal(false)} className="rounded-2xl border border-border px-5 py-3 font-bold text-slate-700">Cancel</button><button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground">Save Slot</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
