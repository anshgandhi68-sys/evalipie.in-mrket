"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Package, MapPin, Shield, CheckCircle2, Clock, 
  ExternalLink, LogOut, ChevronRight, RefreshCw, ShoppingBag 
} from 'lucide-react';
import { useAuth, UserPersona } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Order } from '../../../../shared/types.js';

export const AccountPage: React.FC = () => {
  const { persona, setPersona, personaLabel } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#167D73] to-[#105B55] text-white flex items-center justify-center font-bold text-2xl shadow-md">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">Ananya Sharma</h1>
                <span className="bg-[#E9F7F3] text-[#167D73] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Verified Shopper
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                sharma.ananya@evalipie.in · +91 99887 76655 · Bengaluru Local Hub
              </p>
            </div>
          </div>

          {/* Quick Persona Role Switcher for QA / Evaluators */}
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl space-y-1.5 self-start md:self-auto min-w-[260px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Persona:
            </span>
            <select
              value={persona}
              onChange={e => setPersona(e.target.value as UserPersona)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs outline-none focus:border-[#167D73] cursor-pointer"
            >
              <option value="CUSTOMER">👤 Customer (Shopper)</option>
              <option value="MERCHANT_INDEPENDENT">🏪 Independent Shop (Sharma Electronics)</option>
              <option value="MERCHANT_CHAIN">🏢 Retail Chain (City Supermarket)</option>
              <option value="ADMIN">🛡️ Platform Administrator</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Orders History (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#167D73]" />
                <span>Your Order History</span>
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {orders.length} Orders Placed
              </span>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400 text-xs">
                Loading order records...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No orders placed yet</h3>
                <p className="text-xs text-gray-400">Your completed purchases will appear here with live tracking.</p>
                <Link
                  to="/products"
                  className="bg-[#167D73] text-white text-xs font-bold px-4 py-2 rounded-xl inline-block mt-2"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Order Number
                        </span>
                        <span className="text-xs font-extrabold text-gray-900">{order.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Merchant Store
                        </span>
                        <span className="text-xs font-bold text-[#167D73]">{order.shopName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Status
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block">
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Total Amount
                        </span>
                        <span className="text-sm font-black text-gray-900">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
                        <span>Delivery Address: {order.deliveryAddress || 'Indiranagar, Bengaluru'}</span>
                      </div>
                      <span className="text-gray-400 text-[11px]">
                        Placed: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Saved Addresses & Shortcuts (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Saved Addresses Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#167D73]" />
                  <span>Saved Addresses</span>
                </h3>
                <span className="text-[10px] font-bold text-[#167D73] bg-[#E9F7F3] px-2 py-0.5 rounded-full">
                  Primary
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200/90 bg-gray-50/80 text-xs space-y-1">
                <div className="font-extrabold text-gray-900">Home · Indiranagar</div>
                <p className="text-gray-600 font-medium">Flat 302, Palm Heights, 12th Main Road, HAL 2nd Stage, Indiranagar</p>
                <div className="text-[11px] text-gray-500 pt-1 font-semibold">Bengaluru, Karnataka 560038</div>
              </div>
            </div>

            {/* Quick Portal Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900">Operator Shortcuts</h3>
              <div className="flex flex-col gap-2 text-xs font-bold">
                <Link
                  to="/business/dashboard"
                  className="p-3 rounded-xl bg-gray-50 hover:bg-[#E9F7F3] text-gray-700 hover:text-[#167D73] transition-colors flex items-center justify-between"
                >
                  <span>Merchant OS Console</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/admin"
                  className="p-3 rounded-xl bg-gray-50 hover:bg-[#E9F7F3] text-gray-700 hover:text-[#167D73] transition-colors flex items-center justify-between"
                >
                  <span>Platform Operations & Telemetry</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/products"
                  className="p-3 rounded-xl bg-gray-50 hover:bg-[#E9F7F3] text-gray-700 hover:text-[#167D73] transition-colors flex items-center justify-between"
                >
                  <span>Explore All Products</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AccountPage;
