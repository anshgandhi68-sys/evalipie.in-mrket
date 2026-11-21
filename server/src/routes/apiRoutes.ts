import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { checkoutController } from '../controllers/checkoutController.js';
import { merchantController } from '../controllers/merchantController.js';
import { adminController } from '../controllers/adminController.js';
import { authController } from '../controllers/authController.js';
import { productController } from '../controllers/productController.js';
import { cartController } from '../controllers/cartController.js';
import { orderController } from '../controllers/orderController.js';
import { sseEventStream } from '../controllers/eventsController.js';
import { aiAssistantController } from '../controllers/aiAssistantController.js';
import { adminMetricsController } from '../controllers/adminMetricsController.js';
import { paymentController } from '../controllers/paymentController.js';
import { flagshipCatalogueController } from '../controllers/flagshipCatalogueController.js';
import { adminFlagshipController } from '../controllers/adminFlagshipController.js';
import { aiRouter } from './aiRoutes.js';
import voiceRouter from './voiceRoutes.js';
import { evaluationRouter } from './evaluationRoutes.js';

export const apiRouter = Router();

// AI Intelligence Engine & Software Evaluation Platform Routes
apiRouter.use('/ai', aiRouter);
apiRouter.use('/voice', voiceRouter);
apiRouter.use(evaluationRouter);

// ── 1. Flagship 180-Product Catalogue & 10-Category Taxonomy ───────────
apiRouter.get('/catalog/taxonomy', (req, res) => flagshipCatalogueController.getTaxonomy(req, res));
apiRouter.get('/taxonomy', (req, res) => flagshipCatalogueController.getTaxonomy(req, res));
apiRouter.get('/catalog/products', (req, res) => flagshipCatalogueController.getProducts(req, res));
apiRouter.get('/catalog/products/:idOrSlug', (req, res) => flagshipCatalogueController.getProductById(req, res));
apiRouter.get('/catalog/deals', (req, res) => flagshipCatalogueController.getBentoDeals(req, res));

// Strict Data Honesty Product Reviews
apiRouter.get('/products/:id/reviews', (req, res) => flagshipCatalogueController.getReviews(req, res));
apiRouter.post('/products/:id/reviews', (req, res) => flagshipCatalogueController.addReview(req, res));

// Active Coupons Engine
apiRouter.get('/coupons/active', (req, res) => flagshipCatalogueController.getActiveCoupons(req, res));
apiRouter.post('/coupons/validate', (req, res) => flagshipCatalogueController.validateCoupon(req, res));

// Wishlist API
apiRouter.get('/wishlist', (req, res) => flagshipCatalogueController.getWishlist(req, res));
apiRouter.post('/wishlist/toggle', (req, res) => flagshipCatalogueController.toggleWishlist(req, res));

// Customer Saved Addresses API
apiRouter.get('/addresses', (req, res) => flagshipCatalogueController.getAddresses(req, res));
apiRouter.post('/addresses', (req, res) => flagshipCatalogueController.saveAddress(req, res));

// Legacy & Local Search Routes (Grounded with full catalogue)
apiRouter.get('/products', catalogController.getProducts);
apiRouter.get('/products/:id', catalogController.getProductById);
apiRouter.get('/products/:id/sellers', catalogController.getProductSellers);
apiRouter.get('/categories', (req, res) => flagshipCatalogueController.getTaxonomy(req, res));
apiRouter.get('/shops', catalogController.getShops);
apiRouter.get('/shops/:slug', catalogController.getShopBySlug);
apiRouter.get('/search', catalogController.search);
apiRouter.post('/ai/discover', catalogController.aiDiscover);

// V2 StockSync & Aiven Catalog
apiRouter.get('/v2/products', productController.getProducts);
apiRouter.get('/v2/products/:id', productController.getProductById);
apiRouter.get('/v2/products/search', productController.searchProducts);
apiRouter.get('/v2/categories', (req, res) => flagshipCatalogueController.getTaxonomy(req, res));
apiRouter.get('/v2/products/:id/stock', productController.getProductStock);

// ── 2. Authentication & User Profile ──────────────────────────────────
apiRouter.post('/auth/signup', (req, res) => authController.register(req, res));
apiRouter.post('/auth/register', (req, res) => authController.register(req, res));
apiRouter.post('/auth/signin', (req, res) => authController.login(req, res));
apiRouter.post('/auth/login', (req, res) => authController.login(req, res));
apiRouter.get('/auth/me', (req, res) => authController.me(req, res));
apiRouter.post('/auth/logout', (req, res) => authController.logout(req, res));

// ── 3. Persistent Cart API ───────────────────────────────────────────
apiRouter.get('/cart', cartController.getCart);
apiRouter.post('/cart', cartController.addToCart);
apiRouter.put('/cart/:id', cartController.updateCartItem);
apiRouter.delete('/cart/:id', cartController.removeFromCart);

// ── 4. ACID Concurrency-Safe Checkout & Orders ───────────────────────
apiRouter.post('/checkout/reserve', checkoutController.reserve);
apiRouter.post('/orders/checkout', orderController.checkout);
apiRouter.get('/orders', checkoutController.getOrders);
apiRouter.get('/orders/:id', checkoutController.getOrderById);

// ── 4b. Live Razorpay UPI QR & Real-Time Payment Verification ────────
apiRouter.post('/payments/create-qr', paymentController.createQr);
apiRouter.get('/payments/status/:qrId', paymentController.checkStatus);
apiRouter.post('/payments/verify', paymentController.verifyPayment);
apiRouter.get('/payments/order/:orderId', paymentController.getOrderPayment);

// ── 4c. Razorpay Official Webhooks ───────────────────────────────────
apiRouter.post('/webhooks/razorpay', (req, res) => adminFlagshipController.handleRazorpayWebhook(req, res));

// ── 5. Role-Protected Admin Panel & Inventory Management ──────────────
apiRouter.get('/admin/stats', (req, res) => adminFlagshipController.getStats(req, res));
apiRouter.get('/admin/products', (req, res) => adminFlagshipController.getProducts(req, res));
apiRouter.put('/admin/products/:id', (req, res) => adminFlagshipController.updateProduct(req, res));
apiRouter.get('/admin/orders', (req, res) => adminFlagshipController.getOrders(req, res));
apiRouter.put('/admin/orders/:id/status', (req, res) => adminFlagshipController.updateOrderStatus(req, res));

// Platform Admin, Concurrency Verification & Telemetry
apiRouter.get('/admin/health', adminController.getHealth);
apiRouter.get('/admin/outbox', adminController.getOutboxTelemetry);
apiRouter.get('/admin/metrics', (req, res) => adminMetricsController.getMetrics(req, res));
apiRouter.get('/admin/fuzzy-demo', (req, res) => adminMetricsController.runFuzzyDemo(req, res));
apiRouter.post('/admin/concurrency-test', adminController.runConcurrencySimulation);
apiRouter.post('/admin/concurrency-test-v2', (req, res) => adminMetricsController.runConcurrencySimulation(req, res));

// ── 6. Merchant & Multi-Branch Business Console ──────────────────────
apiRouter.get('/merchant/dashboard', merchantController.getDashboard);
apiRouter.get('/merchant/listings', merchantController.getListings);
apiRouter.put('/merchant/inventory/:id', merchantController.updateInventory);
apiRouter.get('/merchant/branches', merchantController.getBranches);
apiRouter.get('/merchant/orders', merchantController.getOrders);
apiRouter.put('/merchant/orders/:id/status', merchantController.updateOrderStatus);
apiRouter.get('/merchant/demand-insights', merchantController.getDemandInsights);

// ── 7. Live Real-Time Events (Server-Sent Events) ─────────────────────
apiRouter.get('/events/stream', (req, res) => sseEventStream.handleConnection(req, res));

// ── 8. Grounded AI Assistant (Zero Hallucination) ─────────────────────
apiRouter.post('/ai/chat', (req, res) => aiAssistantController.chat(req, res));
apiRouter.post('/ai/recommendations', (req, res) => aiAssistantController.recommendations(req, res));
apiRouter.post('/ai/compare', (req, res) => aiAssistantController.compare(req, res));
