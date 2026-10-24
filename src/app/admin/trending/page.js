'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Search, Check, Flame, Package, AlertCircle, X, Layers, AlertTriangle } from 'lucide-react';
import ClothesLoader from '@/components/ClothesLoader';

const MAX_TRENDING_LIMIT = 7;

export default function AdminTrendingPage() {
  const [products, setProducts] = useState([]);
  const [trendingOrderIds, setTrendingOrderIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);

        // Retrieve previously saved custom selection order from localStorage or initialize with active items
        const savedOrderStr = localStorage.getItem('attire_admin_trending_order');
        let initialOrder = [];
        if (savedOrderStr) {
          try {
            initialOrder = JSON.parse(savedOrderStr);
          } catch {
            initialOrder = [];
          }
        }

        const currentlyFeaturedIds = fetchedProducts.filter((p) => p.isFeatured).map((p) => String(p._id));

        // Keep existing ordered IDs that are still featured, then append any newly featured ones to the end
        const validOrder = initialOrder.filter((id) => currentlyFeaturedIds.includes(String(id)));
        const missingFeaturedIds = currentlyFeaturedIds.filter((id) => !validOrder.includes(String(id)));
        const finalOrder = [...validOrder, ...missingFeaturedIds].slice(0, MAX_TRENDING_LIMIT);

        setTrendingOrderIds(finalOrder);
        localStorage.setItem('attire_admin_trending_order', JSON.stringify(finalOrder));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute trending products strictly aligned with the custom selection order
  const trendingProducts = useMemo(() => {
    return trendingOrderIds
      .map((id) => products.find((p) => String(p._id) === String(id)))
      .filter(Boolean);
  }, [trendingOrderIds, products]);

  const trendingCount = trendingOrderIds.length;

  // Extract dynamic categories from existing catalog
  const availableCategories = useMemo(() => {
    const defaultCats = ['All', '⭐ Trending'];
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return [...defaultCats, ...cats];
  }, [products]);

  const handleToggleTrending = async (product) => {
    const isCurrentlyFeatured = trendingOrderIds.includes(String(product._id));
    const newStatus = !isCurrentlyFeatured;

    // Enforce strict limit of 7 items
    if (newStatus && trendingCount >= MAX_TRENDING_LIMIT) {
      alert(`You can only select up to ${MAX_TRENDING_LIMIT} products for the Trending section. Please remove an active product first.`);
      return;
    }

    setUpdatingId(product._id);

    // Update order queue: if newly added -> append to the next available slot; if removed -> filter out
    const updatedOrder = newStatus
      ? [...trendingOrderIds, String(product._id)]
      : trendingOrderIds.filter((id) => id !== String(product._id));

    setTrendingOrderIds(updatedOrder);
    localStorage.setItem('attire_admin_trending_order', JSON.stringify(updatedOrder));

    // Optimistic UI Update on product list
    setProducts((prev) =>
      prev.map((p) => (String(p._id) === String(product._id) ? { ...p, isFeatured: newStatus } : p))
    );

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product._id,
          isFeatured: newStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        const rollbackOrder = isCurrentlyFeatured
          ? [...trendingOrderIds]
          : trendingOrderIds.filter((id) => id !== String(product._id));

        setTrendingOrderIds(rollbackOrder);
        localStorage.setItem('attire_admin_trending_order', JSON.stringify(rollbackOrder));

        setProducts((prev) =>
          prev.map((p) => (String(p._id) === String(product._id) ? { ...p, isFeatured: isCurrentlyFeatured } : p))
        );
        alert('Failed to update trending status');
      }
    } catch {
      const rollbackOrder = isCurrentlyFeatured
        ? [...trendingOrderIds]
        : trendingOrderIds.filter((id) => id !== String(product._id));

      setTrendingOrderIds(rollbackOrder);
      localStorage.setItem('attire_admin_trending_order', JSON.stringify(rollbackOrder));

      setProducts((prev) =>
        prev.map((p) => (String(p._id) === String(product._id) ? { ...p, isFeatured: isCurrentlyFeatured } : p))
      );
      alert('Error communicating with server');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter products by Search & Category Pill
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === '⭐ Trending') return trendingOrderIds.includes(String(p._id));
      return p.category?.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [products, search, selectedCategory, trendingOrderIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-amber-500 fill-current" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Trending Products Manager
            </h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Configure the <strong>7 carousel items</strong> in your preferred chronological order.
          </p>
        </div>

        {/* Dynamic Capacity Counter */}
        <div className={`px-4 py-2.5 rounded-2xl flex items-center space-x-2.5 border shadow-sm w-fit transition-all duration-200 ${
          trendingCount === MAX_TRENDING_LIMIT
            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-500/10'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-indigo-500/10'
        }`}>
          {trendingCount === MAX_TRENDING_LIMIT ? (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-600" />
          )}
          <span className="text-xs font-black">
            {trendingCount} / {MAX_TRENDING_LIMIT} Slots Filled
          </span>
        </div>
      </div>

      {/* 1. Dedicated Active Featured Queue Strip (Strict Ordered Slots) */}
      <div className="mt-8 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-5 rounded-3xl border border-indigo-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Live Homepage Lineup ({trendingCount}/{MAX_TRENDING_LIMIT})
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-semibold">
            {MAX_TRENDING_LIMIT - trendingCount} open slot{MAX_TRENDING_LIMIT - trendingCount === 1 ? '' : 's'} remaining
          </span>
        </div>

        {/* 7 Visual Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {Array.from({ length: MAX_TRENDING_LIMIT }).map((_, index) => {
            const item = trendingProducts[index];

            if (item) {
              const isOutOfStock = Number(item.stock) === 0;

              return (
                <div
                  key={item._id}
                  className="relative group bg-white rounded-2xl border-2 border-indigo-600 p-2 shadow-[0_0_15px_rgba(79,70,229,0.18)] flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                  <span className="absolute top-2 left-2 z-10 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {index + 1}
                  </span>

                  {/* Quick Eject */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTrending(item);
                    }}
                    className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition shadow active:scale-90"
                    title="Remove from Trending"
                    aria-label="Remove item"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-1.5 relative">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-red-900/60 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
                        <span className="text-[9px] font-black text-white uppercase tracking-wider bg-red-600 px-1.5 py-0.5 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-gray-900 truncate leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-black text-indigo-600 mt-0.5">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={`empty-slot-${index}`}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 flex flex-col items-center justify-center text-gray-400 p-2 text-center select-none"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 mb-1">
                  {index + 1}
                </div>
                <span className="text-[10px] font-bold text-gray-400">Empty Slot</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Controls Area: Search Bar + Category Filter Pills */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-gray-100 hover:bg-gray-200/70 text-gray-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Products Selection Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <ClothesLoader text="Loading catalog..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-6">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 font-semibold text-sm">No products found for this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
          {filteredProducts.map((product) => {
            const isFeatured = trendingOrderIds.includes(String(product._id));
            const slotIndex = trendingOrderIds.indexOf(String(product._id));
            const isUpdating = updatingId === product._id;

            const stockNum = Number(product.stock) || 0;
            const isOutOfStock = stockNum === 0;
            const isLowStock = stockNum > 0 && stockNum <= 4;

            const rawPrice = Number(product.price) || 0;
            const rawOffer = Number(product.offer) || 0;
            const hasOffer = rawOffer > 0;
            const finalPrice = hasOffer
              ? rawPrice - (rawPrice * rawOffer) / 100
              : rawPrice;

            return (
              <div
                key={product._id}
                onClick={() => handleToggleTrending(product)}
                className={`relative bg-white rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out group select-none ${
                  isFeatured
                    ? 'border-2 border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.25)] bg-indigo-50/20 scale-[1.02]'
                    : isOutOfStock
                    ? 'border border-red-200/80 bg-red-50/10 hover:border-red-300'
                    : 'border border-gray-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Active Checkbox Indicator showing exact slot number */}
                <div
                  className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isFeatured
                      ? 'bg-indigo-600 text-white font-black text-[10px] scale-100 shadow-md shadow-indigo-600/30 ring-2 ring-white'
                      : 'bg-white/90 border border-gray-300 text-transparent opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                  }`}
                >
                  {isFeatured ? `#${slotIndex + 1}` : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden relative mb-2">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {product.category}
                  </span>

                  {/* Offer (% OFF) Badge */}
                  {hasOffer && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                      {rawOffer}% OFF
                    </span>
                  )}

                  {/* Stock Health Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition">
                      {product.title}
                    </h3>
                  </div>

                  {/* Price with Offer Calculation & Low Stock Pill */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xs font-black text-gray-900">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                      {hasOffer && (
                        <span className="text-[10px] text-gray-400 font-bold line-through">
                          ₹{rawPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {isLowStock && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {stockNum} left
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated Status Toggle Button */}
                <button
                  type="button"
                  disabled={isUpdating}
                  className={`w-full mt-3 py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                    isFeatured
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }`}
                >
                  {isFeatured ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Slot #{slotIndex + 1} Active</span>
                    </>
                  ) : (
                    <span>+ Add to Trending</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}