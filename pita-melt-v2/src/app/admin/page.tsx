'use client';

import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, Clock, User, Phone, Mail, Package, CheckCircle2, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order, OrderStatus } from '@/types/menu';
import AdminOrderCard from '@/components/admin/AdminOrderCard';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | OrderStatus>('active');
  const [lastOrderIds, setLastOrderIds] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Check authentication status after component mounts (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('admin-authenticated') === 'true';
        setIsAuthenticated(authStatus);
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  // Create audio context for notifications
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillators for a pleasant notification sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect the audio nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequencies for a pleasant chime
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
      
      // Set volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Start and stop the oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      oscillator2.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported or failed:', error);
    }
  };

  const fetchOrders = async (showNotification = false) => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const ordersData = await response.json();
        const currentOrderIds = new Set(ordersData.map((order: Order) => order.id));
        
        // Check for new orders by comparing IDs, not just counts
        if (showNotification && lastOrderIds.size > 0) {
          const newOrders = ordersData.filter((order: Order) => !lastOrderIds.has(order.id));
          if (newOrders.length > 0) {
            // Play notification sound if enabled
            if (soundEnabled) {
              playNotificationSound();
            }
            
            // Show toast notification
            toast.success(`🔔 ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received!`, {
              duration: 4000,
            });
          }
        }
        
        setOrders(ordersData);
        setLastOrderIds(currentOrderIds);
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin-authenticated', 'true');
      toast.success('Welcome to Admin Dashboard');
    } else {
      toast.error('Invalid password');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        ));
        toast.success(`Order ${orderId} marked as ${newStatus}`);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
    toast.success('Orders refreshed');
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'active') return orders.filter(order => order.status !== 'completed');
    return orders.filter(order => order.status === filter);
  };

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
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
              <p className="text-gray-400">Enter password to access order management</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
              <h1 className="text-2xl font-bold text-[#f17105]">Pita Melt Admin</h1>
              <p className="text-gray-400">Order Management Dashboard</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center space-x-2 ${soundEnabled ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                title={soundEnabled ? 'Sound notifications ON' : 'Sound notifications OFF'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={refreshOrders}
                isLoading={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('admin-authenticated');
                  toast.success('Logged out successfully');
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
            <div className="text-2xl font-bold text-blue-400">{getStatusCount('confirmed')}</div>
            <div className="text-sm text-gray-400">New Orders</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{getStatusCount('preparing')}</div>
            <div className="text-sm text-gray-400">Preparing</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{getStatusCount('ready')}</div>
            <div className="text-sm text-gray-400">Ready</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{orders.length}</div>
            <div className="text-sm text-gray-400">Total Today</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['active', 'all', 'confirmed', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-[#f17105] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'All Orders' : 
               status === 'active' ? 'Active Orders' : 
               status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && status !== 'active' && ` (${getStatusCount(status)})`}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {getFilteredOrders().length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'No orders yet today' : `No ${filter} orders`}
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