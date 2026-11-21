import {
  CanonicalProduct,
  MultiSellerOffer,
  Shop,
  Order,
  AiDiscoveryResult,
  CategoryHierarchy,
  DetailedProduct,
  ProductReview,
  CouponItem,
  UserAddress,
  AdminStats
} from '../../../shared/types.js';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('evalipie_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    const error: any = new Error(json.error || json.message || 'API request failed');
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // ── Flagship 180-Product Catalogue & Taxonomy ───────────────────────
  getTaxonomy: () => {
    return fetchJson<CategoryHierarchy[]>('/catalog/taxonomy');
  },

  getDetailedProducts: (params?: {
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetchJson<{
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      data: DetailedProduct[];
    }>(`/catalog/products?${query}`);
  },

  getDetailedProductById: (idOrSlug: string) => {
    return fetchJson<{
      product: DetailedProduct;
      reviews: ProductReview[];
      related: DetailedProduct[];
    }>(`/catalog/products/${idOrSlug}`);
  },

  getBentoDeals: () => {
    return fetchJson<{
      bento: {
        card1Macbook: DetailedProduct;
        card2Airpods: DetailedProduct;
        card3ShoesPromo: DetailedProduct;
        card4StyleDeals: DetailedProduct;
      };
      bestsellers: DetailedProduct[];
      topDiscounts: DetailedProduct[];
    }>('/catalog/deals');
  },

  // ── Strict Data Honesty Customer Reviews ─────────────────────────────
  getProductReviews: (productId: string) => {
    return fetchJson<ProductReview[]>(`/products/${productId}/reviews`);
  },

  submitProductReview: (productId: string, data: {
    rating: number;
    title?: string;
    comment: string;
    userName?: string;
    userId?: string;
  }) => {
    return fetchJson<{
      review: ProductReview;
      newRating: number;
      newCount: number;
    }>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── Active Coupons Engine ───────────────────────────────────────────
  getActiveCoupons: () => {
    return fetchJson<CouponItem[]>('/coupons/active');
  },

  validateCoupon: (code: string, cartTotal: number) => {
    return fetchJson<{
      code: string;
      discountAmount: number;
      finalTotal: number;
      coupon: CouponItem;
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal }),
    });
  },

  // ── Wishlist API ────────────────────────────────────────────────────
  getWishlist: (userId = 'usr-default-customer') => {
    return fetchJson<DetailedProduct[]>(`/wishlist?userId=${userId}`);
  },

  toggleWishlist: (productId: string, userId = 'usr-default-customer') => {
    return fetchJson<{
      inWishlist: boolean;
      totalWishlistCount: number;
    }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId, userId }),
    });
  },

  // ── Saved Addresses API ─────────────────────────────────────────────
  getAddresses: (userId = 'usr-default-customer') => {
    return fetchJson<UserAddress[]>(`/addresses?userId=${userId}`);
  },

  saveAddress: (address: Partial<UserAddress> & { userId?: string }) => {
    return fetchJson<UserAddress>('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  // ── Authentication API ──────────────────────────────────────────────
  signIn: (credentials: { email: string; password: string }) => {
    return fetchJson<{
      user: { id: string; email: string; fullName: string; role: 'CUSTOMER' | 'ADMIN' };
      token: string;
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signUp: (data: { name: string; email: string; password: string; role?: 'CUSTOMER' | 'ADMIN' }) => {
    return fetchJson<{
      user: { id: string; email: string; fullName: string; role: 'CUSTOMER' | 'ADMIN' };
      token: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: () => {
    return fetchJson<{
      user: { id: string; email: string; fullName: string; role: 'CUSTOMER' | 'ADMIN' };
    }>('/auth/me');
  },

  logout: () => {
    return fetchJson<{ status: string; message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  // ── Admin Panel API (Role Protected) ────────────────────────────────
  getAdminStats: () => {
    return fetchJson<AdminStats>('/admin/stats');
  },

  getAdminProducts: () => {
    return fetchJson<DetailedProduct[]>('/admin/products');
  },

  updateAdminProduct: (id: string, updates: Partial<DetailedProduct>) => {
    return fetchJson<DetailedProduct>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getAdminOrders: () => {
    return fetchJson<any[]>('/admin/orders');
  },

  updateAdminOrderStatus: (id: string, status: string) => {
    return fetchJson<any>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // ── AI Assistant & Discovery Routes ─────────────────────────────────
  aiChat: (messageOrSession: string, sessionOrMsg?: string, city?: string) => {
    const message = sessionOrMsg && !city ? sessionOrMsg : messageOrSession;
    const session = sessionOrMsg && city ? sessionOrMsg : 'default-session';
    return fetchJson<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId: session, city: city || 'Bengaluru' }),
    });
  },

  aiDiscover: (prompt: string, sessionId?: string, city = 'Bengaluru') => {
    return fetchJson<any>('/ai/discover', {
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

  aiAlternatives: (productId: string, price: number) => {
    return fetchJson<any>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ productId, price }),
    });
  },

  // ── Existing Marketplace Routes (V1 / V2) ───────────────────────────
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
    return fetchJson<CategoryHierarchy[]>('/catalog/taxonomy');
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

  // Orders & Concurrency-Safe Checkout
  getOrders: () => {
    return fetchJson<Order[]>('/orders');
  },

  reserveStock: (data: { listingId: string; storeId: string; quantity: number }) => {
    return fetchJson<{
      reservationId: string;
      listingId: string;
      storeId: string;
      quantity: number;
      expiresAt: string;
    }>('/checkout/reserve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createOrder: (orderData: {
    items: Array<{ listingId: string; storeId: string; quantity: number }>;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    idempotencyKey: string;
  }) => {
    return fetchJson<Order>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  reserveCheckout: (data: any) => {
    return fetchJson<any>('/checkout/reserve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrderById: (orderId: string) => {
    return fetchJson<Order>(`/orders/${orderId}`);
  },

  // Live Razorpay Payments
  createRazorpayQr: (data: { orderId: string; amount: number; customerPhone?: string }) => {
    return fetchJson<{
      qrId: string;
      qrImageUrl: string;
      upiIntentUrl: string;
      amount: number;
      keyId: string;
    }>('/payments/create-qr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createPaymentQr: (orderId: string, amount: number, customerPhone?: string) => {
    return fetchJson<{
      qrId: string;
      qrImageUrl: string;
      upiIntentUrl: string;
      amount: number;
      paymentAmount: number;
      razorpayOrderId: string;
      keyId: string;
      order?: any;
    }>('/payments/create-qr', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, customerPhone }),
    });
  },

  checkPaymentStatus: (qrId: string, _orderId?: string) => {
    return fetchJson<{
      paid: boolean;
      status: string;
      paymentId?: string;
      amount?: number;
      amountReceived?: number;
      order?: any;
    }>(`/payments/status/${qrId}`);
  },

  verifyPayment: (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    return fetchJson<{
      paid: boolean;
      orderId: string;
      paymentId: string;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrderPayment: (orderId: string) => {
    return fetchJson<{
      order: Order;
      keyId: string;
    }>(`/payments/order/${orderId}`);
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
