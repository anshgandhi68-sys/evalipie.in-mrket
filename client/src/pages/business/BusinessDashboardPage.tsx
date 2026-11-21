import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Package, AlertTriangle, TrendingUp, CheckCircle, Clock, ChevronRight, Mic } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const BusinessDashboardPage: React.FC = () => {
  const { activeOrgId, persona, personaLabel } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dash, list, ords, brs] = await Promise.all([
        api.getMerchantDashboard(activeOrgId),
        api.getMerchantListings(activeOrgId),
        api.getMerchantOrders(activeOrgId),
        api.getMerchantBranches(activeOrgId)
      ]);
      setDashboard(dash);
      setListings(list);
      setOrders(ords);
      setBranches(brs);
      if (brs.length > 0 && !activeBranchId) {
        setActiveBranchId(brs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrgId]);

  const handleStockAdjust = async (invId: string, delta: number) => {
    try {
      await api.updateInventory(invId, delta);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header with Shop Identity & Branch Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#167D73] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">
                  {dashboard?.shop?.displayName || 'Merchant Console'}
                </h1>
                <span className="text-[10px] font-bold text-[#167D73] bg-[#E9F7F3] px-2 py-0.5 rounded-full uppercase">
                  {persona === 'MERCHANT_CHAIN' ? 'Retail Chain' : 'Independent Shop'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Live operating system · Managing physical inventory and order fulfillment
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {branches.length > 1 && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-gray-500">Active Branch:</span>
                <select
                  value={activeBranchId}
                  onChange={e => setActiveBranchId(e.target.value)}
                  className="bg-transparent font-extrabold text-gray-900 outline-none cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to={dashboard?.shop?.slug ? `/shop/${dashboard.shop.slug}` : '#'}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
            >
              View Public Storefront →
            </Link>

            <Link
              to="/business/voice-khata"
              className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Open Voice Khata</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Metrics */}
        {dashboard?.metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Sales</span>
              <div className="text-2xl font-black text-gray-900">
                ₹{dashboard.metrics.totalSales.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Confirmed Orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Pending Fulfillment</span>
              <div className="text-2xl font-black text-amber-600">
                {dashboard.metrics.pendingOrders}
              </div>
              <span className="text-[10px] text-gray-400 block font-medium">Needs packing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Active Listings</span>
              <div className="text-2xl font-black text-[#167D73]">
                {dashboard.metrics.activeListings}
              </div>
              <span className="text-[10px] text-gray-400 block font-medium">In master catalog</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Available Stock</span>
              <div className="text-2xl font-black text-gray-900">
                {dashboard.metrics.totalAvailableStock}
              </div>
              <span className="text-[10px] text-gray-400 block font-medium">Physical shelf units</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Low Stock Alerts</span>
              <div className="text-2xl font-black text-red-600">
                {dashboard.metrics.lowStockCount}
              </div>
              <span className="text-[10px] text-red-500 font-semibold block">Below threshold</span>
            </div>
          </div>
        )}

        {/* Inventory Control Table with +/- Quick Steppers */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900">Branch Shelf Inventory</h3>
              <p className="text-xs text-gray-500">Stock updates instantly sync to PostgreSQL and publish events to Aiven Kafka.</p>
            </div>
            <span className="text-xs font-bold text-gray-400">{listings.length} Products</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Shelf Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Stock Stepper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(l => (
                  (l.inventory || []).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-3">
                        <img src={l.product.imageUrl} alt="" className="w-8 h-8 object-contain rounded bg-gray-50" />
                        <div>
                          <div>{l.product.title}</div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">{l.merchantSku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{inv.storeName}</td>
                      <td className="py-3 px-4 font-extrabold text-gray-900">₹{l.sellingPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-black text-sm">
                        <span className={inv.availableQuantity <= inv.reorderThreshold ? 'text-amber-600' : 'text-gray-900'}>
                          {inv.availableQuantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {inv.availableQuantity > inv.reorderThreshold ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">In Stock</span>
                        ) : inv.availableQuantity > 0 ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Low Stock</span>
                        ) : (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Out of Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => handleStockAdjust(inv.id, -1)}
                            className="px-2.5 py-1 hover:bg-gray-100 font-bold active:bg-gray-200"
                            title="Decrease stock by 1"
                          >-</button>
                          <span className="px-3 font-bold">{inv.quantity}</span>
                          <button
                            onClick={() => handleStockAdjust(inv.id, 1)}
                            className="px-2.5 py-1 hover:bg-gray-100 font-bold active:bg-gray-200"
                            title="Increase stock by 1"
                          >+</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming Customer Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900">Incoming Orders & Fulfillment</h3>
              <p className="text-xs text-gray-500">Status transitions reflect in customer tracking in real time.</p>
            </div>
            <span className="text-xs font-bold text-gray-400">{orders.length} Orders</span>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No customer orders received yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'READY_FOR_PICKUP' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'FULFILLED' ? 'bg-gray-200 text-gray-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-gray-600 font-medium">Customer: <b>{order.customerName}</b> ({order.customerPhone})</div>
                    <div className="text-gray-400 text-[11px]">{order.deliveryAddress}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-gray-400">{order.items?.length || 1} item(s)</span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'READY_FOR_PICKUP')}
                          className="bg-[#167D73] hover:bg-[#105B55] text-white px-3 py-1.5 rounded-xl font-bold text-xs"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'READY_FOR_PICKUP' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'FULFILLED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
