'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, AlertCircle, RefreshCw, Eye, X } from 'lucide-react';
import ClothesLoader from '@/components/ClothesLoader';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-bold inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900">
      <div className="flex justify-between items-center pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review customer orders, update shipping statuses, and track sales.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center space-x-2 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <ClothesLoader text="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">No orders received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order) => {
                  const customerName = 
                    (typeof order.user === 'object' && order.user?.name) ||
                    order.userName ||
                    'Customer';

                  const customerContact = 
                    (typeof order.user === 'object' && order.user?.email) ||
                    order.userEmail ||
                    order.shippingAddress?.phone ||
                    'N/A';

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        #{order._id.slice(-7)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{customerName}</p>
                        <p className="text-xs text-gray-400">{customerContact}</p>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-gray-900">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-500 hover:text-indigo-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-xs font-bold py-1.5 px-2 border rounded-lg bg-white border-gray-200 focus:outline-none focus:border-indigo-600"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order #{selectedOrder._id.slice(-7)}
                </h2>
                <p className="text-xs text-gray-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shipping Address</h3>
              <p className="text-sm font-medium text-gray-800">
                {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode},{' '}
                {selectedOrder.shippingAddress?.country}
              </p>
              {selectedOrder.shippingAddress?.phone && (
                <p className="text-xs text-indigo-600 font-bold mt-1">
                  📞 Phone: {selectedOrder.shippingAddress.phone}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</h3>
              <div className="divide-y border rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-gray-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t text-sm font-black text-gray-900">
              <span>Total Paid</span>
              <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}