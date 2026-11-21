"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Star, Phone, ShieldCheck, ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { Shop } from '../../../../shared/types.js';

export const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getShops()
      .then(setShops)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = shops.filter(s => 
    s.displayName.toLowerCase().includes(filterText.toLowerCase()) ||
    (s.tagline || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#E9F7F3] text-[#167D73] rounded-xl">
                <Store className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Verified Local Merchant Directory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Explore 100% verified neighborhood retail partners across Indiranagar, Jayanagar, Koramangala & Whitefield.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Search shops or areas..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#167D73] focus:bg-white"
            />
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(shop => {
            const primaryStore = (shop.stores && shop.stores[0]) || null;
            return (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#167D73] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Banner & Logo */}
                <div className="relative h-28 bg-gradient-to-r from-[#105B55] to-[#167D73] overflow-hidden">
                  {shop.bannerUrl && (
                    <img
                      src={shop.bannerUrl}
                      alt={shop.displayName}
                      className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#167D73] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between space-y-4">
                  {/* Shop Avatar */}
                  <div className="-mt-8 flex items-end justify-between">
                    <img
                      src={shop.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120'}
                      alt={shop.displayName}
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                    />
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{shop.ratingAvg || 4.8}</span>
                      <span className="text-gray-400 font-normal">({shop.ratingCount || 120})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-[#167D73] transition-colors">
                      {shop.displayName}
                    </h3>
                    <p className="text-xs text-[#167D73] font-semibold">
                      {shop.tagline}
                    </p>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2">
                      {shop.description}
                    </p>
                  </div>

                  {primaryStore && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#167D73] shrink-0" />
                        <span className="truncate">{primaryStore.addressLine1}, {primaryStore.city}</span>
                      </div>
                      {primaryStore.contactPhone && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{primaryStore.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">
                      {((shop as any).businessType) || 'Retail Store'}
                    </span>
                    <Link
                      to={`/shop/${shop.slug}`}
                      className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                    >
                      <span>View Storefront</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ShopsPage;
