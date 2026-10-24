'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle, XCircle, Sparkles, Calendar, DollarSign } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('500');
  const [expiresAt, setExpiresAt] = useState('');

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Generate random promo code helper
  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'OFF';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountPercent,
          minOrderAmount,
          expiresAt,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCode('');
        setDiscountPercent('10');
        setMinOrderAmount('500');
        setExpiresAt('');
        fetchCoupons();
      } else {
        setError(data.error || 'Failed to create coupon.');
      }
    } catch (err) {
      setError('An error occurred while creating the coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      fetchCoupons();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (e) {
      console.error('Failed to delete coupon', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      <div className="pb-6 mb-8 border-b border-gray-200">
        <h1 className="text-3xl font-black tracking-tight">Coupon & Promo Code Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Create discount codes for customer checkouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create Coupon Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreateCoupon} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              <span>Create New Promo Code</span>
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-gray-700">Coupon Code</label>
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME20"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Generating...' : 'Save & Publish Coupon'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Coupons Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm">Active Coupons ({coupons.length})</h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500 text-sm">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No promo codes created yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const isExpired = new Date() > new Date(coupon.expiresAt);

                  return (
                    <div key={coupon._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg text-sm tracking-wider">
                            {coupon.code}
                          </span>
                          <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                            {coupon.discountPercent}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Min Order: ₹{coupon.minOrderAmount} | Expires:{' '}
                          {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                            isExpired
                              ? 'bg-gray-100 text-gray-400 border-gray-200'
                              : coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}