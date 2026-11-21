import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, CheckCircle, ShoppingCart, Star, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';

export const ShopStorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (slug) {
      api.getShopBySlug(slug)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-screen py-24 text-center text-gray-500">Loading digital storefront...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Shop Not Found</h2>
        <Link to="/" className="text-[#167D73] font-bold hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  const { shop, organization, stores, listings } = data;
  const primaryStore = stores[0];

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-16">
      {/* 1. Branded Banner */}
      <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-[#105B55] to-[#167D73] overflow-hidden">
        {shop.bannerUrl && (
          <img 
            src={shop.bannerUrl} 
            alt={shop.displayName} 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 space-y-8">
        {/* 2. Shop Header Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-5 items-center">
            {shop.logoUrl ? (
              <img 
                src={shop.logoUrl} 
                alt={shop.displayName} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#167D73] text-white flex items-center justify-center font-bold text-2xl shrink-0">
                {shop.displayName[0]}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{shop.displayName}</h1>
                <span className="bg-[#E9F7F3] text-[#167D73] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified Merchant
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {shop.ratingAvg} ({shop.ratingCount} reviews)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">{shop.tagline}</p>
              
              {primaryStore && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
                    {primaryStore.addressLine1}, {primaryStore.city}
                  </span>
                  {primaryStore.contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {primaryStore.contactPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-gray-200 text-xs space-y-1 text-gray-600 self-stretch md:self-auto min-w-[200px]">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#167D73]" />
              <span>Digital Storefront URL:</span>
            </div>
            <div className="text-[#167D73] font-extrabold select-all">
              evalipie.in/shop/{shop.slug}
            </div>
          </div>
        </div>

        {/* 3. Merchant Active Listings Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Products in Stock</h2>
              <p className="text-xs text-gray-500">All prices and stock levels are maintained directly by {shop.displayName}.</p>
            </div>
            <span className="text-xs font-bold text-gray-400">{listings.length} Active Listings</span>
          </div>

          {listings.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-bold">No active listings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {listings.map((l: any) => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col p-4 space-y-3">
                  <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-3">
                    <img src={l.product.imageUrl} alt={l.product.title} className="w-full h-full object-contain" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-[#167D73] uppercase">{l.product.category}</span>
                    <h3 className="font-extrabold text-xs text-gray-900 line-clamp-2">{l.product.title}</h3>
                    <div className="text-xs font-bold text-emerald-700 pt-1">
                      {l.availableStock > 0 ? `✓ ${l.availableStock} in stock` : 'Out of stock'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-gray-900">₹{l.sellingPrice.toLocaleString('en-IN')}</div>
                      {l.originalMrp && <div className="text-[10px] text-gray-400 line-through">₹{l.originalMrp.toLocaleString('en-IN')}</div>}
                    </div>

                    <button
                      disabled={l.availableStock <= 0}
                      onClick={() => addItem({
                        listingId: l.id,
                        storeId: primaryStore?.id || 'store-1',
                        productId: l.product.id,
                        title: l.product.title,
                        shopName: shop.displayName,
                        shopSlug: shop.slug,
                        price: l.sellingPrice,
                        originalMrp: l.originalMrp,
                        quantity: 1,
                        imageUrl: l.product.imageUrl
                      })}
                      className="bg-[#167D73] hover:bg-[#105B55] disabled:bg-gray-300 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
