"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  Loader2,
  LogOut,
  ShoppingCart,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://server-hw5w.onrender.com").replace(/\/$/, "");

type AccountTab = "orders" | "prescriptions" | "rewards" | "profile";

type OrderStatus =
  | "PENDING_PHARMACIST_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DISPATCHED"
  | "DELIVERED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface OrderItem {
  id?: string;
  quantity: number;
  price: number;
  medicine?: {
    id?: string;
    name: string;
    category: string;
    requiresPrescription?: boolean;
  };
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  shippingAddress?: string | null;
  pickupSlotTime?: string | null;
  prescriptionImage?: string | null;
  createdAt: string;
}

interface PrescriptionListItem {
  id: string;
  label?: string | null;
  imageUrl: string;
  createdAt: string;
}

interface PrescriptionDetail {
  id: string;
  label?: string | null;
  imageUrl: string;
  createdAt: string;
  detectedMedicines: any[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  referralCode?: string | null;
  loyaltyPoints?: number;
}

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

export default function AccountPage() {
  const { user, isLoading: isAuthLoading, logout, refreshSession } = useAuth();
  const { addItem, setPrescriptionUrl } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState<PrescriptionDetail | null>(null);
  const [selectedDetected, setSelectedDetected] = useState<number[]>([]);
  const [isPrescriptionsLoading, setIsPrescriptionsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: "", phone: "" });

  const selectedPrescription = useMemo(
    () => prescriptions.find((p) => p.id === selectedPrescriptionId) ?? null,
    [prescriptions, selectedPrescriptionId],
  );

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return void router.replace("/login");
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    void fetchOrders();
    void fetchPrescriptions();
    void fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!selectedPrescriptionId) {
      setPrescriptionDetail(null);
      return;
    }
    void fetchPrescriptionDetail(selectedPrescriptionId);
  }, [selectedPrescriptionId]);

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch(`/api/account/orders`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Not signed in.");
      if (res.status === 500) throw new Error("Account service misconfigured. Set BACKEND_INTERNAL_TOKEN on Vercel and INTERNAL_API_TOKEN on Render.");
      if (!res.ok) throw new Error("Failed");
      setOrders((await res.json()) as Order[]);
    } catch (error) {
      console.error(error);
      setOrders([]);
      const message = error instanceof Error ? error.message : "";
      if (message) alert(message);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setIsPrescriptionsLoading(true);
    try {
      const res = await fetch(`/api/account/prescriptions`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Not signed in.");
      if (res.status === 500) throw new Error("Account service misconfigured. Set BACKEND_INTERNAL_TOKEN on Vercel and INTERNAL_API_TOKEN on Render.");
      if (!res.ok) throw new Error("Failed");
      const list = (await res.json()) as PrescriptionListItem[];
      setPrescriptions(list);
      setSelectedPrescriptionId((current) => current ?? list[0]?.id ?? null);
    } catch (error) {
      console.error(error);
      setPrescriptions([]);
      setSelectedPrescriptionId(null);
      const message = error instanceof Error ? error.message : "";
      if (message) alert(message);
    } finally {
      setIsPrescriptionsLoading(false);
    }
  };

  const fetchPrescriptionDetail = async (id: string) => {
    setIsPrescriptionsLoading(true);
    try {
      const res = await fetch(`/api/account/prescriptions/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const detail = (await res.json()) as PrescriptionDetail;
      setPrescriptionDetail(detail);
      const availableIndices =
        Array.isArray(detail.detectedMedicines)
          ? detail.detectedMedicines
              .map((med: any, idx: number) => (med?.matchedMedicine?.id && med?.price ? idx : -1))
              .filter((idx: number) => idx >= 0)
          : [];
      setSelectedDetected(availableIndices);
    } catch (error) {
      console.error(error);
      setPrescriptionDetail(null);
      setSelectedDetected([]);
    } finally {
      setIsPrescriptionsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
      const res = await fetch(`/api/account/profile`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Not signed in.");
      if (res.status === 500) throw new Error("Account service misconfigured. Set BACKEND_INTERNAL_TOKEN on Vercel and INTERNAL_API_TOKEN on Render.");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setProfileDraft({ name: data.name ?? "", phone: data.phone ?? "" });
    } catch (error) {
      console.error(error);
      setProfile(null);
      setProfileDraft({ name: user?.name ?? "", phone: "" });
      const message = error instanceof Error ? error.message : "";
      if (message) alert(message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/account/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileDraft.name, phone: profileDraft.phone }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to update profile");
      }

      await refreshSession();

      await fetchProfile();
      alert("Profile updated.");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to update profile right now.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addPrescriptionToCart = () => {
    if (!prescriptionDetail) return;
    const meds = Array.isArray(prescriptionDetail.detectedMedicines) ? prescriptionDetail.detectedMedicines : [];

    const indices = selectedDetected.length ? selectedDetected : meds.map((_m, idx) => idx);
    const toAdd = indices
      .map((idx) => meds[idx])
      .map((med) => {
        const matched = med?.matchedMedicine;
        const medicineId = matched?.id;
        const name = typeof med?.name === "string" ? med.name : matched?.name;
        const price = Number(med?.price ?? matched?.price ?? 0);
        const quantity = Number(med?.quantity ?? 1);

        if (!medicineId || !name || !Number.isFinite(price) || price <= 0) return null;
        return { medicineId, name, price, quantity, image: med?.image || matched?.image, dosage: med?.dosage, frequency: med?.frequency };
      })
      .filter(Boolean) as any[];

    if (toAdd.length === 0) {
      alert("No matched medicines found in this prescription.");
      return;
    }

    // Use prescription image as the order's prescription attachment.
    setPrescriptionUrl(`${API_BASE}${prescriptionDetail.imageUrl}`);
    toAdd.forEach((item) => addItem(item));
    router.push("/cart");
  };

  const renamePrescription = async (id: string) => {
    const label = window.prompt("Enter a label for this prescription (optional):");
    if (label === null) return;

    try {
      const res = await fetch(`/api/account/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed");
      await fetchPrescriptions();
      if (selectedPrescriptionId === id) {
        await fetchPrescriptionDetail(id);
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to rename prescription.");
    }
  };

  const removePrescription = async (id: string) => {
    const ok = window.confirm("Delete this prescription? This cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`/api/account/prescriptions/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed");
      setSelectedPrescriptionId((current) => (current === id ? null : current));
      await fetchPrescriptions();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to delete prescription.");
    }
  };

  if (isAuthLoading || !user) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <div className="flex items-center gap-4 font-bold text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Loading your account...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_45%,#ffffff_100%)] pt-24 pb-8">
      <Navbar />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 lg:flex-row lg:px-6">
        <aside className="w-full shrink-0 rounded-[2rem] border border-primary/10 bg-white/80 p-4 shadow-[0_24px_80px_-48px_rgba(30,64,175,0.45)] backdrop-blur lg:sticky lg:top-28 lg:w-80 lg:self-start">
          <div className="mb-6 rounded-[1.75rem] bg-[linear-gradient(135deg,#0f4c81_0%,#1f7aa8_100%)] p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">My Account</p>
            <h1 className="mt-3 text-2xl font-black leading-tight">{user.name}</h1>
            <p className="mt-2 text-sm text-white/80">{user.email}</p>
            <button
              onClick={logout}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: "orders", label: "My Orders", icon: ClipboardList },
              { id: "prescriptions", label: "My Prescriptions", icon: FileText },
              { id: "rewards", label: "Rewards & Referrals", icon: ShieldCheck },
              { id: "profile", label: "Profile", icon: UserRound },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AccountTab)}
                className={`flex w-full items-center gap-4 rounded-[1.4rem] border p-4 text-left font-bold transition ${
                  activeTab === item.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent bg-slate-50 text-slate-800 hover:border-primary/10 hover:bg-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          {activeTab === "orders" && (
            <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Orders</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Track your order status and view what you purchased.</p>
                </div>
                <button onClick={fetchOrders} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-primary/20">
                  Refresh
                </button>
              </div>

              {isOrdersLoading ? (
                <div className="mt-10 flex items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-10 rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">
                  No orders yet. Upload a prescription or add medicines to your cart to place your first order.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-[1.5rem] border border-border bg-white p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Order</p>
                          <p className="mt-1 font-black text-slate-900">{order.id}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">{statusLabel(order.status)}</span>
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700">{statusLabel(order.paymentStatus)}</span>
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700">{statusLabel(order.fulfillmentMethod)}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 rounded-[1.2rem] bg-slate-50 p-4">
                        {order.items.map((item, index) => (
                          <div key={item.id || `${order.id}-${index}`} className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">{item.medicine?.name ?? "Medicine"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{item.medicine?.category ?? ""}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{formatCurrency(item.price)}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {order.shippingAddress ? <span>Address: {order.shippingAddress}</span> : null}
                          {order.pickupSlotTime ? <span> Pick-up: {order.pickupSlotTime}</span> : null}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total</p>
                          <p className="mt-1 text-xl font-black text-slate-900">{formatCurrency(order.finalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Prescriptions</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Your uploaded prescriptions are saved here automatically.</p>
                  </div>
                  <button onClick={fetchPrescriptions} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-primary/20">
                    Refresh
                  </button>
                </div>

                {isPrescriptionsLoading && prescriptions.length === 0 ? (
                  <div className="mt-10 flex items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    Loading prescriptions...
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="mt-10 rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">
                    No saved prescriptions yet. Upload one on the Upload page.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                  {prescriptions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPrescriptionId(p.id)}
                        className={`flex w-full items-center gap-4 rounded-[1.5rem] border p-4 text-left transition ${
                          p.id === selectedPrescriptionId ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/20"
                        }`}
                      >
                        <img src={toAssetUrl(p.imageUrl)} alt="Prescription" className="h-16 w-16 rounded-[1rem] object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-900">{p.label?.trim() ? p.label : p.id}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(p.createdAt)}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void renamePrescription(p.id);
                            }}
                            className="rounded-2xl border border-border bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-primary/20"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void removePrescription(p.id);
                            }}
                            className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:border-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-sm">
                <h3 className="text-xl font-black text-slate-900">Prescription Detail</h3>
                <p className="mt-2 text-sm text-muted-foreground">Pick a saved prescription to add matched medicines to your cart.</p>

                {!selectedPrescription ? (
                  <div className="mt-10 rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">
                    Select a prescription to preview.
                  </div>
                ) : !prescriptionDetail ? (
                  <div className="mt-10 flex items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    Loading detail...
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={() => window.open(toAssetUrl(prescriptionDetail.imageUrl), "_blank", "noopener,noreferrer")}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-border"
                    >
                      <img src={toAssetUrl(prescriptionDetail.imageUrl)} alt="Prescription" className="h-64 w-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/35" />
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Detected Items</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(prescriptionDetail.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            const meds = Array.isArray(prescriptionDetail.detectedMedicines) ? prescriptionDetail.detectedMedicines : [];
                            const available = meds
                              .map((med: any, idx: number) => (med?.matchedMedicine?.id && med?.price ? idx : -1))
                              .filter((idx: number) => idx >= 0);
                            setSelectedDetected(available);
                          }}
                          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:border-primary/20"
                        >
                          Select Matched
                        </button>
                        <button
                          onClick={addPrescriptionToCart}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add Selected To Cart
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(prescriptionDetail.detectedMedicines || []).slice(0, 12).map((med: any, idx: number) => {
                        const available = Boolean(med?.matchedMedicine?.id && med?.price);
                        const checked = selectedDetected.includes(idx);
                        return (
                          <button
                            key={`${prescriptionDetail.id}-${idx}`}
                            type="button"
                            onClick={() => {
                              setSelectedDetected((current) =>
                                current.includes(idx) ? current.filter((value) => value !== idx) : [...current, idx],
                              );
                            }}
                            className="w-full rounded-[1.3rem] border border-border bg-white p-4 text-left transition hover:border-primary/20"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-black text-slate-900">{med?.name ?? "Medicine"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {med?.dosage ? `${med.dosage} ` : ""}
                                  {med?.frequency ? `• ${med.frequency}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full border px-3 py-1 text-xs font-black ${available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                                  {available ? "Available" : "Not Matched"}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-xs font-black ${checked ? "border-primary bg-primary/10 text-primary" : "border-border bg-slate-50 text-slate-600"}`}>
                                  {checked ? "Selected" : "Tap"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Rewards & Referrals</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Earn points for every order and by referring your friends.</p>
                </div>
                <button onClick={fetchProfile} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-primary/20">
                  Refresh
                </button>
              </div>

              <div className="mt-10 grid gap-8 md:grid-cols-2">
                {/* Loyalty Points Card */}
                <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#059669_0%,#10b981_100%)] p-8 text-white shadow-xl shadow-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-200" />
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-100">SkinShop Loyalty</span>
                  </div>
                  <div className="mt-6 flex items-baseline gap-2">
                    <h3 className="text-6xl font-black">{profile?.loyaltyPoints || 0}</h3>
                    <p className="text-xl font-bold text-emerald-100">Points</p>
                  </div>
                  <p className="mt-4 text-sm font-medium text-emerald-50/80 leading-relaxed">
                    You earn 1 point for every ₹100 spent. <br />
                    100 points = ₹1 worth of discount.
                  </p>
                  <button className="mt-8 w-full rounded-2xl bg-white/20 py-4 text-sm font-black text-white hover:bg-white/30 transition">
                    View Points History
                  </button>
                </div>

                {/* Referral Card */}
                <div className="rounded-[2.5rem] border border-primary/10 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-6 w-6 text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Refer & Earn</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-slate-900">Invite a Friend</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share your code and get <span className="font-bold text-primary">50 Points</span> when they place their first order.
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <div className="group relative flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-4 transition-all hover:border-primary/50">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Referral Code</p>
                        <p className="mt-1 font-mono text-xl font-black text-primary">{profile?.referralCode || "GETTING-CODE..."}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (profile?.referralCode) {
                            navigator.clipboard.writeText(profile.referralCode);
                            alert("Code copied to clipboard!");
                          }
                        }}
                        className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="mt-12 rounded-[2rem] bg-slate-50 p-8">
                <h4 className="font-black text-slate-900">How to earn more?</h4>
                <div className="mt-6 grid gap-6 sm:grid-cols-3">
                  {[
                    { label: "Order Medicines", content: "Earn points on every purchase automatically.", icon: "🛍️" },
                    { label: "Refer Friends", content: "Share your code and earn 50pts per friend.", icon: "🤝" },
                    { label: "Special Sales", content: "Look out for 2X points events in our store.", icon: "🔥" }
                  ].map((step, i) => (
                    <div key={i} className="space-y-2">
                       <span className="text-2xl">{step.icon}</span>
                       <p className="font-bold text-slate-900">{step.label}</p>
                       <p className="text-xs text-muted-foreground">{step.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "profile" && (
            <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Profile</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Update your profile details used for orders and delivery.</p>
                </div>
                <button onClick={fetchProfile} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-primary/20">
                  Refresh
                </button>
              </div>

              {isProfileLoading ? (
                <div className="mt-10 flex items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  Loading profile...
                </div>
              ) : (
                <form onSubmit={saveProfile} className="mt-8 grid gap-4 sm:max-w-xl">
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Name</span>
                    <input
                      value={profileDraft.name}
                      onChange={(event) => setProfileDraft((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Email</span>
                    <input
                      value={user.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-border bg-slate-100 px-4 py-3 text-slate-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Phone</span>
                    <input
                      value={profileDraft.phone}
                      onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+91..."
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:bg-white"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-primary-foreground disabled:opacity-60"
                  >
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Profile
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {activeTab === "prescriptions" && prescriptionDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
            <div className="pointer-events-auto flex max-w-xl items-center justify-between gap-4 rounded-[2rem] border border-primary/10 bg-white/90 px-6 py-4 shadow-[0_24px_80px_-48px_rgba(30,64,175,0.45)] backdrop-blur">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">Ready to reorder from this prescription?</p>
                <p className="mt-1 text-xs text-muted-foreground">We will add only matched catalogue medicines to your cart.</p>
              </div>
              <button onClick={addPrescriptionToCart} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
