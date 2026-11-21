import {
  CanonicalProduct,
  MultiSellerOffer,
  Shop,
  Order,
  LedgerCustomer,
  LedgerEntry,
  AiDiscoveryResult,
  VoiceSessionState
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

  aiDiscover: (prompt: string, city = 'Bengaluru') => {
    return fetchJson<AiDiscoveryResult>('/ai/discover', {
      method: 'POST',
      body: JSON.stringify({ prompt, city }),
    });
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

  // Voice Khata
  getLedgerCustomers: (orgId = 'org-sharma') => {
    return fetchJson<LedgerCustomer[]>(`/ledger/customers?orgId=${orgId}`);
  },

  getLedgerEntries: (orgId = 'org-sharma', customerId?: string) => {
    const q = customerId ? `&customerId=${customerId}` : '';
    return fetchJson<LedgerEntry[]>(`/ledger/entries?orgId=${orgId}${q}`);
  },

  getLedgerSummary: (orgId = 'org-sharma') => {
    return fetchJson<any>(`/ledger/summary?orgId=${orgId}`);
  },

  processVoiceText: (text: string, sessionId?: string, orgId = 'org-sharma') => {
    return fetchJson<VoiceSessionState>('/voice/process-text', {
      method: 'POST',
      body: JSON.stringify({ text, sessionId, orgId }),
    });
  },

  processVoiceAudio: (audioBlob: Blob, sessionId?: string, languageCode = 'indic-auto', orgId = 'org-sharma') => {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await fetchJson<any>('/voice/process-audio', {
            method: 'POST',
            body: JSON.stringify({ audioBase64: base64, sessionId, languageCode, orgId }),
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  },

  getTtsStreamUrl: (text: string, voice = 'Nalini', language = 'hi-IN') => {
    return `/api/v1/voice/tts-stream?text=${encodeURIComponent(text)}&voice=${voice}&language=${language}`;
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
