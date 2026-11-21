"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Headphones, Laptop, Smartphone, Utensils, Shirt, ShoppingBag, 
  Trophy, ChevronRight, Layers, Search
} from 'lucide-react';
import { api } from '../../services/api.js';

const CATEGORIES_DATA = [
  {
    id: 'cat-laptops',
    slug: 'laptops',
    name: 'Laptops & Workstations',
    tagline: 'Apple MacBook Pro M3/M4, Acer Swift AI OLED, ASUS ROG Gaming & Dell XPS',
    count: 32,
    imageUrl: '/products/LAP-006.jpg',
    icon: <Laptop className="w-5 h-5 text-indigo-600" />
  },
  {
    id: 'cat-mobiles',
    slug: 'mobiles',
    name: 'Mobiles & Tablets',
    tagline: 'Apple iPhone 15 Pro Max, iPad Air M2, Samsung Galaxy S24 AI & Pixel 8 Pro',
    count: 32,
    imageUrl: '/products/MOB-008.jpg',
    icon: <Smartphone className="w-5 h-5 text-blue-600" />
  },
  {
    id: 'cat-audio',
    slug: 'audio',
    name: 'Audio & Sound',
    tagline: 'Apple AirPods Max, Bose QuietComfort, Sony WH-1000XM5, Marshall & boAt',
    count: 32,
    imageUrl: '/products/AUD-017.jpg',
    icon: <Headphones className="w-5 h-5 text-purple-600" />
  },
  {
    id: 'cat-footwear',
    slug: 'footwear',
    name: 'Footwear & Sneakers',
    tagline: 'Adidas Samba OG, Nike Air Jordan, ASICS Gel-Kayano, Puma Softride & Crocs',
    count: 33,
    imageUrl: '/products/FTW-013.jpg',
    icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />
  },
  {
    id: 'cat-fashion',
    slug: 'fashion',
    name: 'Fashion & Apparel',
    tagline: 'Ray-Ban Aviators, Allen Solly formal shirts, Louis Philippe blazers & Biba sarees',
    count: 33,
    imageUrl: '/products/FAS-010.jpg',
    icon: <Shirt className="w-5 h-5 text-rose-600" />
  },
  {
    id: 'cat-home',
    slug: 'home',
    name: 'Home & Kitchen',
    tagline: "De'Longhi Espresso machines, Dyson Airwrap, Borosil appliances & Prestige cookware",
    count: 33,
    imageUrl: '/products/HOM-008.jpg',
    icon: <Utensils className="w-5 h-5 text-amber-600" />
  }
];

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');

  const filtered = CATEGORIES_DATA.filter(c => 
    c.name.toLowerCase().includes(filterText.toLowerCase()) || 
    c.tagline.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#E9F7F3] text-[#167D73] rounded-xl">
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Marketplace Categories
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Browse products by department across all verified independent Bengaluru neighborhood stores.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filter categories..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#167D73] focus:bg-white"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug || cat.id)}`)}
              className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#167D73] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group"
            >
              <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-2xs">
                  {cat.icon}
                </div>
                <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cat.count} Products
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#167D73] transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 font-medium">
                    {cat.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#167D73]">
                  <span>Explore Department</span>
                  <span>View All →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CategoriesPage;
