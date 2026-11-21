import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { checkoutController } from '../controllers/checkoutController.js';
import { merchantController } from '../controllers/merchantController.js';
import { voiceKhataController } from '../controllers/voiceKhataController.js';
import { adminController } from '../controllers/adminController.js';

export const apiRouter = Router();

// 1. Catalog & Marketplace
apiRouter.get('/products', catalogController.getProducts);
apiRouter.get('/products/:id', catalogController.getProductById);
apiRouter.get('/products/:id/sellers', catalogController.getProductSellers);
apiRouter.get('/categories', catalogController.getCategories);
apiRouter.get('/shops', catalogController.getShops);
apiRouter.get('/shops/:slug', catalogController.getShopBySlug);
apiRouter.get('/search', catalogController.search);
apiRouter.post('/ai/discover', catalogController.aiDiscover);

// 2. Concurrency-Safe Checkout & Orders
apiRouter.post('/checkout/reserve', checkoutController.reserve);
apiRouter.get('/orders', checkoutController.getOrders);
apiRouter.get('/orders/:id', checkoutController.getOrderById);

// 3. Merchant & Multi-Branch Business Console
apiRouter.get('/merchant/dashboard', merchantController.getDashboard);
apiRouter.get('/merchant/listings', merchantController.getListings);
apiRouter.put('/merchant/inventory/:id', merchantController.updateInventory);
apiRouter.get('/merchant/branches', merchantController.getBranches);
apiRouter.get('/merchant/orders', merchantController.getOrders);
apiRouter.put('/merchant/orders/:id/status', merchantController.updateOrderStatus);
apiRouter.get('/merchant/demand-insights', merchantController.getDemandInsights);

// 4. Voice Khata (Gnani Hackathon PS2)
apiRouter.get('/ledger/customers', voiceKhataController.getCustomers);
apiRouter.get('/ledger/entries', voiceKhataController.getEntries);
apiRouter.get('/ledger/summary', voiceKhataController.getSummary);
apiRouter.post('/voice/process-text', voiceKhataController.processVoiceText);

// 5. Platform Admin & Concurrency Verification
apiRouter.get('/admin/health', adminController.getHealth);
apiRouter.get('/admin/outbox', adminController.getOutboxTelemetry);
apiRouter.post('/admin/concurrency-test', adminController.runConcurrencySimulation);
