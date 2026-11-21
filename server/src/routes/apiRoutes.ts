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
import { aiRouter } from './aiRoutes.js';

export const apiRouter = Router();

// AI Intelligence Engine Routes
apiRouter.use('/ai', aiRouter);

// 1. Catalog & Marketplace (V1 & V2)
apiRouter.get('/products', catalogController.getProducts);
apiRouter.get('/products/:id', catalogController.getProductById);
apiRouter.get('/products/:id/sellers', catalogController.getProductSellers);
apiRouter.get('/categories', catalogController.getCategories);
apiRouter.get('/shops', catalogController.getShops);
apiRouter.get('/shops/:slug', catalogController.getShopBySlug);
apiRouter.get('/search', catalogController.search);
apiRouter.post('/ai/discover', catalogController.aiDiscover);

// V2 StockSync & Aiven Catalog
apiRouter.get('/v2/products', productController.getProducts);
apiRouter.get('/v2/products/:id', productController.getProductById);
apiRouter.get('/v2/products/search', productController.searchProducts);
apiRouter.get('/v2/categories', productController.getCategories);
apiRouter.get('/v2/products/:id/stock', productController.getProductStock);

// 2. Authentication & User Profile
apiRouter.post('/auth/register', authController.register);
apiRouter.post('/auth/login', authController.login);

// 3. Persistent Cart API
apiRouter.get('/cart', cartController.getCart);
apiRouter.post('/cart', cartController.addToCart);
apiRouter.put('/cart/:id', cartController.updateCartItem);
apiRouter.delete('/cart/:id', cartController.removeFromCart);

// 4. ACID Concurrency-Safe Checkout & Orders
apiRouter.post('/checkout/reserve', checkoutController.reserve);
apiRouter.post('/orders/checkout', orderController.checkout);
apiRouter.get('/orders', checkoutController.getOrders);
apiRouter.get('/orders/:id', checkoutController.getOrderById);

// 5. Merchant & Multi-Branch Business Console
apiRouter.get('/merchant/dashboard', merchantController.getDashboard);
apiRouter.get('/merchant/listings', merchantController.getListings);
apiRouter.put('/merchant/inventory/:id', merchantController.updateInventory);
apiRouter.get('/merchant/branches', merchantController.getBranches);
apiRouter.get('/merchant/orders', merchantController.getOrders);
apiRouter.put('/merchant/orders/:id/status', merchantController.updateOrderStatus);
apiRouter.get('/merchant/demand-insights', merchantController.getDemandInsights);

// 6. Platform Admin, Concurrency Verification & Telemetry
apiRouter.get('/admin/health', adminController.getHealth);
apiRouter.get('/admin/outbox', adminController.getOutboxTelemetry);
apiRouter.get('/admin/metrics', (req, res) => adminMetricsController.getMetrics(req, res));
apiRouter.get('/admin/fuzzy-demo', (req, res) => adminMetricsController.runFuzzyDemo(req, res));
apiRouter.post('/admin/concurrency-test', adminController.runConcurrencySimulation);
apiRouter.post('/admin/concurrency-test-v2', (req, res) => adminMetricsController.runConcurrencySimulation(req, res));

// 7. Live Real-Time Events (Server-Sent Events)
apiRouter.get('/events/stream', (req, res) => sseEventStream.handleConnection(req, res));

// 8. Grounded AI Assistant (Zero Hallucination)
apiRouter.post('/ai/chat', (req, res) => aiAssistantController.chat(req, res));
apiRouter.post('/ai/recommendations', (req, res) => aiAssistantController.recommendations(req, res));
apiRouter.post('/ai/compare', (req, res) => aiAssistantController.compare(req, res));
