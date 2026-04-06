"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LayoutDashboard, ShoppingBag, Pill, Calendar, Tag, Check, X, Eye, ShieldAlert, Plus, Loader2, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com';

interface Medicine {
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
  name: string;
  price: number;
  quantity: number;
  dosage?: string;
  frequency?: string;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  prescriptionUrl?: string;
  createdAt: string;
}

const initialOrders = [
  { _id: "FALLBACK-1", user: { name: "John Doe", email: "john@example.com", phone: "9876543210" }, totalAmount: 1240, items: [], status: "PENDING_PHARMACIST_REVIEW", createdAt: new Date().toISOString(), prescriptionUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400" },
];

export default function AdminDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbSlots, setDbSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  
  const [newMed, setNewMed] = useState<Medicine>({
    medicineId: '',
    name: '',
    strength: '',
    price: 0,
    quantity: 0,
    category: 'Skin Care',
    description: '',
    requiresPrescription: true
  });

  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 11:00 AM',
    maxBookings: 5
  });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }

    if (activeTab === 'catalog') {
      fetchMedicines();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'slots') {
      fetchSlots();
    }
  }, [activeTab, user]);

  if (isAuthLoading || !user || user.role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-background pt-24">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="flex items-center gap-4 text-muted-foreground font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            Securing admin workspace...
          </div>
        </div>
      </main>
    );
  }

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/medicines`);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/slots`);
      if (res.ok) {
        const data = await res.json();
        setDbSlots(data);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.length > 0 ? data : initialOrders);
      } else {
        setOrders(initialOrders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders(initialOrders);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewMed({ medicineId: '', name: '', strength: '', price: 0, quantity: 0, category: 'Skin Care', description: '', requiresPrescription: true });
        fetchMedicines();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add medicine');
      }
    } catch (err) {
      console.error('Error adding medicine:', err);
      alert('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });
      if (res.ok) {
        setShowAddSlotModal(false);
        fetchSlots();
      }
    } catch (err) {
      console.error('Error adding slot:', err);
    } finally {
      setIsLoading(false);
    }
  };
   
  return (
    <main className="min-h-screen bg-background pt-24 pb-8 flex flex-col md:flex-row">
      <Navbar />

      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-border p-8 sticky top-24 h-auto md:h-[calc(100vh-6rem)] flex flex-col gap-4">
        {[
          { id: 'orders', label: 'Orders', icon: LayoutDashboard },
          { id: 'catalog', label: 'Medicine Catalogue', icon: Pill },
          { id: 'slots', label: 'Pick-up Slots', icon: Calendar },
          { id: 'coupons', label: 'Coupons', icon: Tag },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-1 px-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Management Terminal — {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
          </div>
          
          <div className="flex items-center gap-6">
            {activeTab === 'catalog' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                Add Medicine
              </button>
            )}
            <div className="flex items-center gap-4 p-4 glass rounded-[2rem] border border-primary/20">
              <ShieldAlert className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Role</p>
                <p className="font-bold text-sm">Pharmacist: ACTIVE</p>
              </div>
            </div>
          </div>
        </header>

        <section className="animate-fade-in-up">
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order, index) => (
                <div key={order._id || `order-${index}`} className="p-8 bg-secondary/30 border border-border rounded-[2.5rem] flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 hover:bg-secondary/50 transition-colors">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border border-border flex-shrink-0 group relative cursor-pointer" onClick={() => order.prescriptionUrl && window.open(order.prescriptionUrl, '_blank')}>
                    <img src={order.prescriptionUrl || "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Prescription" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 text-white transition-opacity">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{order._id.slice(-8)}</span>
                      <span className="text-muted-foreground text-sm font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold font-outfit">{order.user.name}</h3>
                    <p className="text-muted-foreground text-sm">{order.user.phone} • {order.items.length} Medicines</p>
                    <p className="font-bold text-lg text-primary">₹{order.totalAmount}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    {order.status === "PENDING_PHARMACIST_REVIEW" ? (
                      <>
                        <button 
                          onClick={() => handleUpdateOrderStatus(order._id, 'REJECTED')}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-5 h-5" />
                          Reject
                        </button>
                        <button 
                          onClick={() => handleUpdateOrderStatus(order._id, 'APPROVED')}
                          className="flex-[2] lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                        >
                          <Check className="w-5 h-5" />
                          Approve Dispatch
                        </button>
                      </>
                    ) : (
                      <div className={`flex items-center gap-2 font-bold px-8 ${order.status === 'REJECTED' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {order.status === 'REJECTED' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        {order.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {isLoading && medicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground font-bold">Connecting to Database...</p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="text-center py-20 space-y-4 glass rounded-[3rem] border-dashed">
                  <Pill className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                  <h3 className="text-2xl font-bold">Catalog is Empty</h3>
                  <p className="text-muted-foreground">Add your first medicine to the secure database terminal.</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold"
                  >
                    Add Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {medicines.map((med, index) => (
                    <div key={med._id || med.medicineId || `med-${index}`} className="p-6 bg-secondary/20 border border-border rounded-[2rem] flex items-center gap-6 hover:border-primary/30 transition-all group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary border border-border flex-shrink-0">
                        <img 
                          src={med.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400"} 
                          alt={med.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-black uppercase tracking-wider">{med.medicineId}</span>
                          <span className="px-2 py-0.5 bg-secondary text-primary rounded-md text-[9px] font-black uppercase tracking-wider">{med.category}</span>
                          {med.requiresPrescription && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[9px] font-black uppercase tracking-wider">RX Only</span>}
                        </div>
                        <h3 className="font-bold text-lg truncate font-outfit">{med.name} — <span className="text-muted-foreground text-sm font-medium">{med.strength}</span></h3>
                        <p className="text-primary font-black">₹{med.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">Stock: {med.quantity} units available</p>
                      </div>
                      <button className="p-3 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="space-y-8">
              <header className="flex justify-between items-center bg-secondary/10 p-8 rounded-[2.5rem] border border-border">
                <div>
                  <h3 className="text-2xl font-bold font-outfit">Active Time Slots</h3>
                  <p className="text-muted-foreground text-sm">Managing {dbSlots.length} active pickup windows.</p>
                </div>
                <button 
                  onClick={() => setShowAddSlotModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Slot
                </button>
              </header>

              {isLoading && dbSlots.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="font-bold text-muted-foreground">Syncing Slots...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbSlots.map((slot, index) => (
                    <div key={slot.id || `slot-${index}`} className="p-8 bg-secondary/20 border border-border rounded-[2.5rem] hover:border-primary/30 transition-all group relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 p-8 text-primary opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Clock className="w-24 h-24" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                          {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${slot.currentBookings >= slot.maxBookings ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {slot.currentBookings >= slot.maxBookings ? 'FULL' : 'AVAILABLE'}
                        </span>
                      </div>

                      <h4 className="text-xl font-bold mb-4 font-outfit">{slot.timeSlot}</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-muted-foreground">Booked Capacity</span>
                          <span className="text-primary">{slot.currentBookings} / {slot.maxBookings}</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(slot.currentBookings / slot.maxBookings) * 100}%` }}
                            className={`h-full transition-all ${slot.currentBookings >= slot.maxBookings ? 'bg-red-500' : 'bg-primary'}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="py-32 text-center text-muted-foreground glass rounded-[3rem]">
              <h3 className="text-2xl font-bold mb-2 font-outfit">Management Sync Pending</h3>
              <p>Management UI for {activeTab} will be available in the next build.</p>
            </div>
          )}
        </section>
      </div>

      {/* Add Medicine Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-background rounded-[3rem] p-10 shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-3xl font-bold mb-8 font-outfit">Add New Medication</h2>
              <form onSubmit={handleAddMedicine} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Medicine ID</label>
                    <input 
                      required
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.medicineId}
                      onChange={e => setNewMed({...newMed, medicineId: e.target.value})}
                      placeholder="e.g. SKIN-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Medicine Name</label>
                    <input 
                      required
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.name}
                      onChange={e => setNewMed({...newMed, name: e.target.value})}
                      placeholder="e.g. Tretinoin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Strength (MG/%)</label>
                    <input 
                      required
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.strength}
                      onChange={e => setNewMed({...newMed, strength: e.target.value})}
                      placeholder="e.g. 500mg or 0.05%"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <input 
                      required
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.category}
                      onChange={e => setNewMed({...newMed, category: e.target.value})}
                      placeholder="e.g. Acne Control"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.price}
                      onChange={e => setNewMed({...newMed, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Initial Quantity</label>
                    <input 
                      required
                      type="number"
                      className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                      value={newMed.quantity}
                      onChange={e => setNewMed({...newMed, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none resize-none"
                    value={newMed.description}
                    onChange={e => setNewMed({...newMed, description: e.target.value})}
                  />
                </div>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${newMed.requiresPrescription ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                    {newMed.requiresPrescription && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={newMed.requiresPrescription}
                    onChange={e => setNewMed({...newMed, requiresPrescription: e.target.checked})}
                  />
                  <span className="font-bold">Requires Physician Prescription</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-secondary hover:bg-secondary/70 rounded-2xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Confirm Store Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showAddSlotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSlotModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-background rounded-[3rem] p-10 shadow-2xl border border-white/10"
            >
              <h2 className="text-3xl font-bold mb-8 font-outfit">Create Pickup Window</h2>
              <form onSubmit={handleAddSlot} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                    value={newSlot.date}
                    onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Time Window</label>
                  <select 
                    className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                    value={newSlot.timeSlot}
                    onChange={e => setNewSlot({...newSlot, timeSlot: e.target.value})}
                  >
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>01:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 05:00 PM</option>
                    <option>05:00 PM - 07:00 PM</option>
                    <option>07:00 PM - 09:00 PM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Booking Capacity</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full p-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary transition-all outline-none"
                    value={newSlot.maxBookings}
                    onChange={e => setNewSlot({...newSlot, maxBookings: Number(e.target.value)})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddSlotModal(false)}
                    className="flex-1 py-4 bg-secondary hover:bg-secondary/70 rounded-2xl font-bold transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Deploy Window
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
