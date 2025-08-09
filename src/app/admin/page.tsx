"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Order, OrderStatus } from "@/types/menu";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | OrderStatus>(
    "active"
  );
  const [lastOrderIds, setLastOrderIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const NOTIFICATION_DURATION_SEC = 1.8;
  const NOTIFICATION_VOLUME = 0.35;

  // Check authentication status after component mounts (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const authStatus =
          localStorage.getItem("admin-authenticated") === "true";
        setIsAuthenticated(authStatus);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Create audio context for notifications
  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext: typeof AudioContext;
            }
          ).webkitAudioContext)();
      } catch (error) {
        console.log("AudioContext not available:", error);
      }
    }
    return audioContextRef.current;
  };

  const playNotificationSound = () => {
    try {
      const audioContext = ensureAudioContext();
      if (!audioContext) return;
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      const t0 = audioContext.currentTime;

      // Master envelope for overall level
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0, t0);
      masterGain.gain.linearRampToValueAtTime(NOTIFICATION_VOLUME, t0 + 0.03);
      masterGain.gain.exponentialRampToValueAtTime(
        0.0001,
        t0 + NOTIFICATION_DURATION_SEC
      );

      // Gentle low-pass to soften the tone
      const filter = audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, t0);
      filter.Q.setValueAtTime(0.8, t0);

      // Simple echo for a pleasant tail
      const delay = audioContext.createDelay();
      delay.delayTime.value = 0.16;
      const feedback = audioContext.createGain();
      feedback.gain.value = 0.22;

      // Wiring
      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      filter.connect(masterGain);
      delay.connect(masterGain);
      masterGain.connect(audioContext.destination);

      const scheduleNote = (freq: number, start: number, dur: number) => {
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const noteGain = audioContext.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(freq, t0 + start);
        osc2.frequency.setValueAtTime(freq, t0 + start);
        osc1.detune.setValueAtTime(-6, t0 + start);
        osc2.detune.setValueAtTime(6, t0 + start);

        // Per-note envelope
        noteGain.gain.setValueAtTime(0, t0 + start);
        noteGain.gain.linearRampToValueAtTime(
          NOTIFICATION_VOLUME,
          t0 + start + 0.02
        );
        noteGain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);

        osc1.connect(noteGain);
        osc2.connect(noteGain);
        noteGain.connect(filter);

        osc1.start(t0 + start);
        osc2.start(t0 + start);
        osc1.stop(t0 + start + dur);
        osc2.stop(t0 + start + dur);
      };

      // Soft triad arpeggio: A5 -> C#6 -> E6
      scheduleNote(880, 0.0, 0.55);
      scheduleNote(1108.73, 0.35, 0.55);
      scheduleNote(1318.51, 0.7, 0.7);
    } catch (error) {
      console.log("Audio notification not supported or failed:", error);
    }
  };

  // Create a user-gesture to unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      const ctx = ensureAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    const onVisibility = () => {
      const ctx = ensureAudioContext();
      if (
        document.visibilityState === "visible" &&
        ctx &&
        ctx.state === "suspended"
      ) {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const fetchOrders = async (showNotification = false) => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const ordersData = await response.json();
        const currentOrderIds = new Set(
          ordersData.map((order: Order) => order.id)
        );

        // Check for new orders by comparing IDs, not just counts
        if (showNotification && lastOrderIds.size > 0) {
          const newOrders = ordersData.filter(
            (order: Order) => !lastOrderIds.has(order.id)
          );
          if (newOrders.length > 0) {
            // Always play notification sound for real new orders
            playNotificationSound();

            // Show toast notification
            toast.success(
              `🔔 ${newOrders.length} new order${
                newOrders.length > 1 ? "s" : ""
              } received!`,
              {
                duration: 4000,
              }
            );
          }
        }

        setOrders(ordersData);
        setLastOrderIds(new Set(ordersData.map((order: Order) => order.id)));
        setLastUpdated(new Date());
      } else {
        console.error("Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      fetchOrders();
      // Set up polling to refresh orders every 10 seconds (faster for real-time updates)
      const interval = setInterval(() => fetchOrders(true), 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isCheckingAuth]);

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem("admin-authenticated", "true");
        toast.success("Welcome to Admin Dashboard");
      } else {
        toast.error("Invalid password");
      }
    } catch (error) {
      toast.error("Authentication failed");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date() }
              : order
          )
        );
        toast.success(`Order ${orderId} marked as ${newStatus}`);
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
    toast.success("Orders refreshed");
  };

  // Inject a simulated order to test notifications
  const simulateOrder = () => {
    const pickup = new Date();
    pickup.setMinutes(pickup.getMinutes() + 15);
    const fake: Order = {
      id: `SIM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      items: [
        {
          id: "beef-donair",
          menuItem: {
            id: "beef-donair",
            name: "Beef Donair",
            prices: [],
            category: "pita-wraps" as any,
          },
          quantity: 1,
          selectedSize: { size: "M", price: 10.5, label: "M: $10.50" },
          customizations: {},
          totalPrice: 10.5,
        },
      ],
      customerInfo: { name: "Test Customer", phone: "" },
      totalAmount: 10.5,
      status: "confirmed",
      paymentStatus: "succeeded",
      paymentIntentId: "pi_sim",
      estimatedPickupTime: pickup,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Play the notification sound for simulated orders too
    playNotificationSound();
    toast.success("🔔 New order received (simulation)");
    setOrders((prev) => [fake, ...prev]);
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    if (filter === "active")
      return orders.filter((order) => order.status !== "completed");
    return orders.filter((order) => order.status === filter);
  };

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <RefreshCw className="h-12 w-12 text-[#f17105] mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-medium">Loading...</h1>
            <p className="text-gray-400 mt-2">Checking authentication</p>
            {lastUpdated && (
              <div className="text-xs text-gray-500 sm:ml-4">
                Last updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <div className="mb-6">
              <Lock className="h-12 w-12 text-[#f17105] mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
              <p className="text-gray-400">
                Enter password to access order management
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#f17105] focus:ring-1 focus:ring-[#f17105]"
              />
              <Button onClick={handleLogin} className="w-full" size="lg">
                Access Dashboard
              </Button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              Contact system administrator for password
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#f17105]">
                Pita Melt Admin
              </h1>
              <p className="text-gray-400">Order Management Dashboard</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={simulateOrder}
                className="flex items-center space-x-2"
                title="Simulate a new order"
              >
                <Package className="h-4 w-4" />
                <span>Simulate Order</span>
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem("admin-authenticated");
                  toast.success("Logged out successfully");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {getStatusCount("confirmed")}
            </div>
            <div className="text-sm text-gray-400">New Orders</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {getStatusCount("preparing")}
            </div>
            <div className="text-sm text-gray-400">Preparing</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {getStatusCount("ready")}
            </div>
            <div className="text-sm text-gray-400">Ready</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {orders.length}
            </div>
            <div className="text-sm text-gray-400">Total Today</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["active", "all", "confirmed", "completed"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-[#f17105] text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {status === "all"
                  ? "All Orders"
                  : status === "active"
                  ? "Active Orders"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" &&
                  status !== "active" &&
                  ` (${getStatusCount(status)})`}
              </button>
            )
          )}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {getFilteredOrders().length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "No orders yet today"
                  : `No ${filter} orders`}
              </p>
            </div>
          ) : (
            getFilteredOrders().map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
