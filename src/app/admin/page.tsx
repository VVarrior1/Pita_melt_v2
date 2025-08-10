"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
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
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notifiedOrderIds, setNotifiedOrderIds] = useState<Set<string>>(
    new Set()
  );
  const [unacceptedOrderIds, setUnacceptedOrderIds] = useState<Set<string>>(
    new Set()
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unacceptedOrderIdsRef = useRef<Set<string>>(new Set());

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

  const startContinuousNotification = () => {
    // Clear any existing interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    console.log("🔔 Starting continuous notification...");

    // Play immediately
    playNotificationSound();

    // Then play every 3 seconds
    notificationIntervalRef.current = setInterval(() => {
      console.log(
        "⏰ Checking unaccepted orders:",
        unacceptedOrderIdsRef.current.size
      );
      if (unacceptedOrderIdsRef.current.size > 0) {
        // Ensure audio context is active
        const ctx = ensureAudioContext();
        if (ctx && ctx.state === "suspended") {
          ctx.resume().then(() => {
            playNotificationSound();
          });
        } else {
          playNotificationSound();
        }
      } else {
        // Stop ringing if all orders are accepted
        console.log("✅ All orders accepted, stopping notifications");
        stopContinuousNotification();
      }
    }, 3000);
  };

  const stopContinuousNotification = () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = ensureAudioContext();
      if (!audioContext) return;
      
      // Always try to resume the context
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      console.log("🎵 Playing notification sound, context state:", audioContext.state);

      // Use a simple oscillator beep that's more reliable
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
      
      // Play a second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.frequency.setValueAtTime(1108.73, audioContext.currentTime); // C#6
        osc2.type = "sine";
        
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 1.5);
      }, 200);
      
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
      console.log(
        "🔍 fetchOrders called with showNotification:",
        showNotification
      );
      console.log("📋 Current lastOrderIds size:", lastOrderIds.size);
      console.log("📋 Current lastOrderIds:", Array.from(lastOrderIds));

      const response = await fetch("/api/orders");
      if (response.ok) {
        const ordersData = await response.json();
        console.log("📦 Fetched orders count:", ordersData.length);
        console.log(
          "📦 Fetched order IDs:",
          ordersData.map((o: Order) => o.id)
        );

        const currentOrderIds = new Set(
          ordersData.map((order: Order) => order.id)
        );

        // Check for new orders - only notify for orders created in the last 10 seconds
        if (showNotification) {
          console.log("🔔 Checking for new orders...");
          console.log("📋 lastOrderIds.size:", lastOrderIds.size);

          const now = new Date();
          const tenSecondsAgo = new Date(now.getTime() - 10000);

          // Find orders that are both NEW (not in lastOrderIds) AND recent (created in last 10 seconds)
          const newRecentOrders = ordersData.filter((order: Order) => {
            const isNew = !lastOrderIds.has(order.id);
            const orderTime = new Date(order.createdAt);
            const isRecent = orderTime > tenSecondsAgo;
            // Also check if we haven't already notified for this order
            const notYetNotified = !notifiedOrderIds.has(order.id);

            console.log(
              `Order ${
                order.id
              }: isNew=${isNew}, isRecent=${isRecent}, notYetNotified=${notYetNotified}, orderTime=${orderTime.toISOString()}`
            );

            return isNew && isRecent && notYetNotified;
          });

          console.log("🆕 New recent orders found:", newRecentOrders.length);
          console.log(
            "🆕 New recent order IDs:",
            newRecentOrders.map((o: Order) => o.id)
          );

          if (newRecentOrders.length > 0) {
            console.log("🔊 Starting continuous notification for new orders!");

            // Mark these orders as notified
            const newNotifiedIds = new Set(notifiedOrderIds);
            const newUnacceptedIds = new Set(unacceptedOrderIds);
            newRecentOrders.forEach((order: Order) => {
              newNotifiedIds.add(order.id);
              // Only add to unaccepted if status is confirmed (not yet accepted)
              if (order.status === "confirmed") {
                newUnacceptedIds.add(order.id);
              }
            });
            setNotifiedOrderIds(newNotifiedIds);
            setUnacceptedOrderIds(newUnacceptedIds);
            unacceptedOrderIdsRef.current = newUnacceptedIds;

            // Show toast notification
            toast.success(
              `🔔 ${newRecentOrders.length} new order${
                newRecentOrders.length > 1 ? "s" : ""
              } received!`,
              {
                duration: 4000,
              }
            );

            // Start continuous ringing if not already ringing
            startContinuousNotification();
          } else {
            console.log("😴 No new recent orders detected");
          }
        }

        setOrders(ordersData);
        setLastOrderIds(new Set(ordersData.map((order: Order) => order.id)));
        setLastUpdated(new Date());
        console.log(
          "✅ Orders updated, new lastOrderIds size:",
          ordersData.length
        );
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
      // Initial fetch without notification
      fetchOrders();

      // Listen for Postgres changes
      const ordersChannel = supabase
        .channel("orders-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            console.log("🚨 POSTGRES INSERT DETECTED!", payload);
            setTimeout(() => {
              fetchOrders(true);
            }, 500);
          }
        )
        .subscribe((status) => {
          console.log("📡 Orders Realtime status:", status);
        });

      // Listen for manual broadcast from webhook
      const broadcastChannel = supabase
        .channel("order-notifications")
        .on("broadcast", { event: "new-order" }, (payload) => {
          console.log("📢 BROADCAST NEW ORDER RECEIVED!", payload);
          // Immediately fetch with notification
          fetchOrders(true);
        })
        .subscribe((status) => {
          console.log("📡 Broadcast channel status:", status);
        });

      // Aggressive polling every 2 seconds but only notify for truly new orders
      const interval = setInterval(() => {
        fetchOrders(true); // Use notification mode but with time-based filtering
      }, 2000);

      return () => {
        clearInterval(interval);
        stopContinuousNotification();
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(broadcastChannel);
      };
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

  const acceptOrder = async (orderId: string) => {
    // Remove from unaccepted orders
    const newUnacceptedIds = new Set(unacceptedOrderIds);
    newUnacceptedIds.delete(orderId);
    setUnacceptedOrderIds(newUnacceptedIds);
    unacceptedOrderIdsRef.current = newUnacceptedIds;

    // Stop ringing if no more unaccepted orders
    if (newUnacceptedIds.size === 0) {
      stopContinuousNotification();
    }

    // Update order status to preparing
    await updateOrderStatus(orderId, "preparing");
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

    // Add to notified and unaccepted orders
    setNotifiedOrderIds((prev) => new Set([...prev, fake.id]));
    setUnacceptedOrderIds((prev) => {
      const newSet = new Set([...prev, fake.id]);
      unacceptedOrderIdsRef.current = newSet;
      return newSet;
    });

    // Start continuous notification
    startContinuousNotification();
    toast.success("🔔 New order received (simulation)");
    setOrders((prev) => [...prev, fake]);
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
                onAcceptOrder={acceptOrder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
