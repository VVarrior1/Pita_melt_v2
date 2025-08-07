'use client';

import React, { useState, useEffect } from 'react';
import { Clock, User, Phone, Mail, Package, CheckCircle2, AlertCircle, ChefHat, Utensils } from 'lucide-react';
import { Order, OrderStatus } from '@/types/menu';
import { Button } from '@/components/ui/Button';

interface AdminOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export default function AdminOrderCard({ order, onUpdateStatus }: AdminOrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <AlertCircle className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'completed':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'confirmed':
        return 'completed';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: OrderStatus): string => {
    const next = getNextStatus(currentStatus);
    switch (next) {
      case 'completed':
        return 'Mark Completed';
      default:
        return 'Update Status';
    }
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    setIsUpdating(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onUpdateStatus(order.id, nextStatus);
    setIsUpdating(false);
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    
    // Use a consistent format that works the same on server and client
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTimeUntilPickup = () => {
    // Only calculate time after component mounts to avoid hydration mismatches
    if (!isMounted) {
      return { text: '', color: 'text-gray-400', urgent: false };
    }
    
    const now = new Date();
    const pickup = new Date(order.estimatedPickupTime);
    const diffMinutes = Math.ceil((pickup.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 0) {
      return { text: 'Overdue', color: 'text-red-400', urgent: true };
    } else if (diffMinutes <= 5) {
      return { text: `${diffMinutes} min`, color: 'text-yellow-400', urgent: true };
    } else {
      return { text: `${diffMinutes} min`, color: 'text-green-400', urgent: false };
    }
  };

  const timeInfo = getTimeUntilPickup();

  return (
    <div className={`bg-gray-900 rounded-lg border-l-4 ${getStatusColor(order.status).replace('bg-', 'border-')} ${timeInfo.urgent ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(order.status)} text-white`}>
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
              <p className="text-sm text-gray-400">
                Placed at {formatTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Pickup Time */}
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 ${timeInfo.color}`} />
              <div className="text-right">
                <div className={`font-medium ${timeInfo.color}`}>
                  {formatTime(order.estimatedPickupTime)}
                </div>
                <div className={`text-xs ${timeInfo.color}`}>
                  {timeInfo.text} left
                </div>
              </div>
            </div>

            {/* Status Update Button */}
            {getNextStatus(order.status) && (
              <Button
                onClick={handleStatusUpdate}
                isLoading={isUpdating}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {getNextStatusLabel(order.status)}
              </Button>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <User className="h-4 w-4 text-[#f17105] mr-2" />
            <h4 className="font-semibold">Customer Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-gray-400" />
              <span>{order.customerInfo.name}</span>
            </div>
            {order.customerInfo.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-gray-400" />
                <a 
                  href={`tel:${order.customerInfo.phone}`}
                  className="text-[#f17105] hover:underline"
                >
                  {order.customerInfo.phone}
                </a>
              </div>
            )}
            {order.customerInfo.email && (
              <div className="flex items-center space-x-2 md:col-span-2">
                <Mail className="h-3 w-3 text-gray-400" />
                <span className="truncate">{order.customerInfo.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <div className="flex items-center mb-3">
            <Utensils className="h-4 w-4 text-[#f17105] mr-2" />
            <h4 className="font-semibold">Order Items ({order.items.length})</h4>
          </div>
          
          {order.items.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-white">{item.menuItem.name}</h5>
                  </div>
                  <p className="text-sm text-gray-400">
                    Unit price: ${(item.totalPrice / item.quantity).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${item.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Customizations */}
              {item.customizations && Object.entries(item.customizations).length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(item.customizations).map(([key, value]) => (
                    <div key={key} className="text-sm text-gray-300">
                      <span className="text-[#f17105] capitalize">{key}:</span>{' '}
                      {Array.isArray(value) ? value.join(', ') : value}
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              {item.specialInstructions && (
                <div className="mt-2 p-2 bg-yellow-900 bg-opacity-30 rounded border-l-2 border-yellow-500">
                  <p className="text-sm text-yellow-200">
                    <strong>Special Instructions:</strong> {item.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-[#f17105]">${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
            <span>Payment Status:</span>
            <span className={`font-medium ${order.paymentStatus === 'succeeded' ? 'text-green-400' : 'text-yellow-400'}`}>
              {order.paymentStatus === 'succeeded' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => order.customerInfo.phone && window.open(`tel:${order.customerInfo.phone}`, '_self')}
            disabled={!order.customerInfo.phone}
            className="flex items-center space-x-1"
          >
            <Phone className="h-3 w-3" />
            <span>Call Customer</span>
          </Button>
          
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="text-red-400 hover:text-red-300"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}