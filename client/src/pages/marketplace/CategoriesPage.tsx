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
    id: 'Smart Wearables',
    name: 'Smart Wearables & Tech',
    tagline: 'Apple Watch Series 10, AMOLED fitness bands, smart rings & GPS sports watches',
    count: 4,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
    icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />
  },
  {
    id: 'Electronics',
    name: 'Audio & Electronics',
    tagline: 'Bluetooth ANC headphones, condenser mics, fast chargers & fitness watches',
    count: 4,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    icon: <Headphones className="w-5 h-5 text-purple-600" />
  },
  {
    id: 'Mobiles & Accessories',
    name: 'Smartphones & Mobile Tech',
    tagline: 'Apple iPhone 16, Samsung Galaxy S24 AI, 65W GaN wall adapters',
    count: 3,
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format&fit=crop&q=80',
    icon: <Smartphone className="w-5 h-5 text-blue-600" />
  },
  {
    id: 'Computers & Laptops',
    name: 'Computers & Workspaces',
    tagline: 'ThinkPad laptops under 60k, wireless mechanical keyboards, gaming mice',
    count: 3,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    icon: <Laptop className="w-5 h-5 text-indigo-600" />
  },
  {
    id: 'Home & Kitchen',
    name: 'Home, Furniture & Appliances',
    tagline: 'Ergonomic mesh office chairs, digital air fryers, desk organizers',
    count: 3,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c228c3b7f290?w=400&auto=format&fit=crop&q=80',
    icon: <Utensils className="w-5 h-5 text-amber-600" />
  },
  {
    id: 'Boutique Apparel',
    name: 'Boutique Apparel & Textiles',
    tagline: 'Organic cotton black tees, Japanese raw selvedge denim, merino knitwear',
    count: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80',
    icon: <Shirt className="w-5 h-5 text-rose-600" />
  },
  {
    id: 'Fashion',
    name: 'Fashion & Footwear',
    tagline: "Woodland handcrafted leather men's shoes, accessories & essentials",
    count: 2,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&auto=format&fit=crop&q=80',
    icon: <Shirt className="w-5 h-5 text-teal-600" />
  },
  {
    id: 'Sports & Fitness',
    name: 'Sports & Fitness Gear',
    tagline: 'Nike Air Zoom road running shoes, AMOLED fitness trackers, gear',
    count: 2,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    icon: <Trophy className="w-5 h-5 text-orange-600" />
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
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat.id)}`)}
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
