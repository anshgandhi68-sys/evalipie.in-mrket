import {
  CanonicalProduct,
  MultiSellerOffer,
  Shop,
  Order,
  AiDiscoveryResult
} from '../../../shared/types.js';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    const error: any = new Error(json.message || 'API request failed');
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Catalog
  getProducts: (params?: { category?: string; q?: string; city?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Array<{ product: CanonicalProduct; minPrice: number; sellerCount: number; inStock: boolean }>>(`/products?${query}`);
  },

  getProductById: (id: string, city = 'Bengaluru') => {
    return fetchJson<{ product: CanonicalProduct; offers: MultiSellerOffer[]; minPrice: number }>(`/products/${id}?city=${city}`);
  },

  getProductSellers: (id: string, city = 'Bengaluru') => {
    return fetchJson<{ canonicalProduct: CanonicalProduct; offers: MultiSellerOffer[] }>(`/products/${id}/sellers?city=${city}`);
  },

  getCategories: () => {
    return fetchJson<Array<{ id: string; name: string; icon: string; count: number }>>('/categories');
  },

  getShops: () => {
    return fetchJson<Shop[]>('/shops');
  },

  getShopBySlug: (slug: string) => {
    return fetchJson<{ shop: Shop; organization: any; stores: any[]; listings: any[] }>(`/shops/${slug}`);
  },

  search: (q: string, category?: string, city = 'Bengaluru') => {
    const query = new URLSearchParams({ q, ...(category ? { category } : {}), city }).toString();
    return fetchJson<Array<{ product: CanonicalProduct; minPrice: number; sellerCount: number; inStock: boolean }>>(`/search?${query}`);
  },

  aiDiscover: (prompt: string, conversationId?: string, city = 'Bengaluru') => {
    return fetchJson<any>('/ai/discover', {
      method: 'POST',
      body: JSON.stringify({ prompt, conversationId, city }),
    });
  },

  aiChat: (prompt: string, sessionId?: string, city = 'Bengaluru') => {
    return fetchJson<{
      status: string;
      sessionId: string;
      tookMs: number;
      intent: any;
      message: string;
      matches: any[];
      suggestions: string[];
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, sessionId, city }),
    });
  },

  aiCompare: (productIds: string[]) => {
    return fetchJson<any>('/ai/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  },

  aiAlternatives: (productId: string, budget?: number) => {
    return fetchJson<any>('/ai/alternatives', {
      method: 'POST',
      body: JSON.stringify({ productId, budget }),
    });
  },

  aiHealth: () => {
    return fetchJson<any>('/ai/health');
  },

  // Checkout
  reserveCheckout: (data: {
    listingId: string;
    storeId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    deliveryAddress?: string;
  }) => {
    return fetchJson<{ order: Order; outboxEventId: string }>('/checkout/reserve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrders: () => {
    return fetchJson<Order[]>('/orders');
  },

  // Merchant Portal
  getMerchantDashboard: (orgId = 'org-sharma') => {
    return fetchJson<any>(`/merchant/dashboard?orgId=${orgId}`);
  },

  getMerchantListings: (orgId = 'org-sharma') => {
    return fetchJson<any[]>(`/merchant/listings?orgId=${orgId}`);
  },

  updateInventory: (inventoryId: string, delta?: number, quantity?: number) => {
    return fetchJson<any>(`/merchant/inventory/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ delta, quantity }),
    });
  },

  getMerchantBranches: (orgId = 'org-citysuper') => {
    return fetchJson<any[]>(`/merchant/branches?orgId=${orgId}`);
  },

  getMerchantOrders: (orgId = 'org-sharma') => {
    return fetchJson<Order[]>(`/merchant/orders?orgId=${orgId}`);
  },

  updateOrderStatus: (orderId: string, status: string) => {
    return fetchJson<Order>(`/merchant/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getDemandInsights: () => {
    return fetchJson<any>('/merchant/demand-insights');
  },

  // Admin
  getAdminHealth: () => {
    return fetchJson<any>('/admin/health');
  },

  getOutboxTelemetry: () => {
    return fetchJson<any>('/admin/outbox');
  },

  runConcurrencyTest: () => {
    return fetchJson<any>('/admin/concurrency-test', {
      method: 'POST',
    });
  },
};
