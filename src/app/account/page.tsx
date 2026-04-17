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
  Sparkles,
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
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setIsPrescriptionsLoading(true);
    try {
      const res = await fetch(`/api/account/prescriptions`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Not signed in.");
      const list = (await res.json()) as PrescriptionListItem[];
      setPrescriptions(list);
      setSelectedPrescriptionId((current) => current ?? list[0]?.id ?? null);
    } catch (error) {
      console.error(error);
      setPrescriptions([]);
      setSelectedPrescriptionId(null);
    } finally {
      setIsPrescriptionsLoading(false);
    }
  };

  const fetchPrescriptionDetail = async (id: string) => {
    setIsPrescriptionsLoading(true);
    try {
      const res = await fetch(`/api/account/prescriptions/${id}`, { cache: "no-store" });
      if (!res.ok) return;
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
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setProfileDraft({ name: data.name ?? "", phone: data.phone ?? "" });
    } catch (error) {
      console.error(error);
      setProfile(null);
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
      if (!res.ok) throw new Error("Failed");
      await refreshSession();
      await fetchProfile();
    } catch (error: any) {
      console.error(error);
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

    if (toAdd.length === 0) return;

    setPrescriptionUrl(`${API_BASE}${prescriptionDetail.imageUrl}`);
    toAdd.forEach((item) => addItem(item));
    router.push("/cart");
  };

  // Remove helper functions that are better handled by state or simplified
  
  if (isAuthLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-950 pt-32">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20 relative overflow-hidden">
      {/* Ambient Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] -z-10 opacity-30 translate-x-1/2 -translate-y-1/2" />
      
      <Navbar />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="premium-card p-10 bg-indigo-600 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <UserRound className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200/60 mb-4">Patient Profile</p>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1 truncate">{user.name}</h1>
            <p className="text-indigo-200/80 text-sm font-medium mb-8 truncate">{user.email}</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          <nav className="premium-card p-3 bg-white/[0.02] border-white/5 space-y-2">
            {[
              { id: "orders", label: "Analytics & Orders", icon: ClipboardList },
              { id: "prescriptions", label: "Stored Evidence", icon: FileText },
              { id: "rewards", label: "SkinShop Rewards", icon: ShieldCheck },
              { id: "profile", label: "Configurations", icon: UserRound },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AccountTab)}
                className={`flex w-full items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between px-2">
                  <div>
                    <h2 className="text-6xl font-black text-white tracking-tighter">Orders.</h2>
                    <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] mt-3">Verified Purchase History</p>
                  </div>
                  <button onClick={fetchOrders} className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <Loader2 className={`w-5 h-5 ${isOrdersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isOrdersLoading && orders.length === 0 ? (
                  <div className="premium-card h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="premium-card p-20 text-center border-dashed border-2 border-white/10">
                    <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-400">No Orders Found.</h3>
                    <p className="text-slate-600 mt-2">Start your clinical journey by uploading a prescription.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="premium-card p-10 bg-white/[0.02] border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-10">
                          <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap gap-3">
                              <span className="px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                {statusLabel(order.status)}
                              </span>
                              <span className="px-5 py-2 rounded-full bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                {statusLabel(order.paymentStatus)}
                              </span>
                            </div>
                            <div>
                              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Deployment ID</p>
                              <p className="text-xl font-black text-white font-mono uppercase truncate">{order.id}</p>
                              <p className="text-slate-500 text-sm mt-2">{formatDateTime(order.createdAt)}</p>
                            </div>
                          </div>
                          <div className="lg:text-right space-y-1">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Investment</p>
                            <p className="text-5xl font-black text-white tracking-tighter">{formatCurrency(order.finalAmount)}</p>
                          </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 grid gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                              <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-wider">{item.medicine?.name}</h4>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">{item.medicine?.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-black">{formatCurrency(item.price)}</p>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "prescriptions" && (
              <motion.div
                key="prescriptions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-10"
              >
                <div className="xl:col-span-5 space-y-8">
                  <div className="px-2">
                    <h2 className="text-6xl font-black text-white tracking-tighter">Vault.</h2>
                    <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] mt-3">Digitized Evidence Storage</p>
                  </div>

                  <div className="grid gap-4">
                    {prescriptions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPrescriptionId(p.id)}
                        className={`premium-card p-6 flex gap-6 text-left transition-all ${
                          selectedPrescriptionId === p.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/20 shrink-0">
                          <img src={toAssetUrl(p.imageUrl)} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-black uppercase text-xs tracking-widest truncate">{p.label?.trim() ? p.label : "UNNAMED_FILE"}</p>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1.5">{formatDateTime(p.createdAt)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-7">
                  {prescriptionDetail ? (
                    <div className="premium-card p-10 bg-white/[0.02] border-white/5 space-y-10">
                      <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 group cursor-pointer relative">
                         <img 
                          src={toAssetUrl(prescriptionDetail.imageUrl)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt="" 
                          onClick={() => window.open(toAssetUrl(prescriptionDetail.imageUrl), "_blank")}
                        />
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-black uppercase tracking-widest text-[10px]">Expand view</span>
                         </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-3xl font-black text-white tracking-tight leading-none">Detection Map</h3>
                          <button 
                            onClick={addPrescriptionToCart}
                            className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-400 transition-all"
                          >
                            Add Matched to Cart
                          </button>
                        </div>

                        <div className="grid gap-3">
                          {prescriptionDetail.detectedMedicines.map((med: any, idx: number) => {
                            const available = Boolean(med?.matchedMedicine?.id && med?.price);
                            return (
                              <div key={idx} className="flex items-center justify-between p-6 rounded-3xl bg-black/20 border border-white/5">
                                <div>
                                  <p className="text-white font-black uppercase text-sm tracking-wider">{med.name}</p>
                                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{med.dosage} • {med.frequency}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  available ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  {available ? 'Available' : 'Missing'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="premium-card h-full flex flex-col items-center justify-center p-20 text-center text-slate-600">
                      <FileText className="w-16 h-16 mb-6 opacity-20" />
                      <p className="text-xl font-bold uppercase tracking-widest opacity-40 italic">Decrypt Selection To Preview</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "rewards" && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="px-2">
                  <h2 className="text-6xl font-black text-white tracking-tighter">Points.</h2>
                  <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] mt-3">Loyalty & Reward Matrix</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="premium-card p-12 bg-indigo-600 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Sparkles className="w-32 h-32 text-white" />
                    </div>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Internal Balance</p>
                    <h3 className="text-8xl font-black text-white tracking-tighter mb-4">{profile?.loyaltyPoints || 0}</h3>
                    <p className="text-indigo-100 text-xl font-medium italic">"Clinical Credits Earned"</p>
                    <div className="mt-12 p-8 rounded-[2.5rem] bg-black/20 border border-white/10">
                      <p className="text-xs text-indigo-100 leading-relaxed font-medium">Earn 1 credit for every ₹100 invested. Credits can be deployed as discounts on future prescriptions.</p>
                    </div>
                  </div>

                  <div className="premium-card p-12 bg-white/[0.02] border-white/5 space-y-10">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Referral Expansion</p>
                      <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-3">Invite Collaborators</h3>
                      <p className="text-slate-400 font-medium">Expand the clinical network and earn 50 Credits per successful referral.</p>
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-black/30 border border-white/5 flex items-center justify-between gap-6 group">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Unique Access Key</p>
                        <p className="text-3xl font-black text-indigo-400 font-mono tracking-tighter truncate">{profile?.referralCode || "---"}</p>
                      </div>
                      <button 
                         onClick={() => {
                          if (profile?.referralCode) {
                            navigator.clipboard.writeText(profile.referralCode);
                          }
                        }}
                        className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-12"
              >
                <div className="px-2">
                  <h2 className="text-6xl font-black text-white tracking-tighter">Config.</h2>
                  <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] mt-3">Account Parameter Adjustment</p>
                </div>

                <form onSubmit={saveProfile} className="premium-card p-12 bg-white/[0.02] border-white/5 space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Identity Name</label>
                    <input
                      value={profileDraft.name}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Verified Endpoint</label>
                    <input
                      value={user.email}
                      disabled
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Telemetry Contact</label>
                    <input
                      value={profileDraft.phone}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="w-full bg-indigo-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-400 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.2)] disabled:opacity-50"
                    >
                      {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Deploy Updates"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

