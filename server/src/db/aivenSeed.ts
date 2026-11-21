import { aivenPg, memoryPg, ProductRow, InventoryRow } from './aivenPg.js';
import {
  CATEGORIES_SEED,
  SUBCATEGORIES_SEED,
  PRODUCTS_SEED,
  COUPONS_SEED,
  REVIEWS_SEED,
  DEFAULT_ADMIN_USER,
  DEFAULT_CUSTOMER_USER
} from './marketplaceCatalogueSeed.js';

export const SEED_CATEGORIES = CATEGORIES_SEED;
export const SEED_PRODUCTS = PRODUCTS_SEED;

export const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const;

export async function runAivenSeed(): Promise<void> {
  console.log('\n========================================================');
  console.log('🚀 SEEDING 180-PRODUCT PRODUCTION CATALOGUE INTO DB & ACID BUFFER...');
  console.log(`Mode: ${aivenPg.isConnected ? 'Aiven PostgreSQL Cloud' : 'High-Performance ACID In-Memory'}`);
  console.log('========================================================');

  // Seed Users
  memoryPg.users.set(DEFAULT_ADMIN_USER.id, DEFAULT_ADMIN_USER);
  memoryPg.users.set(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER);
  memoryPg.users.set(DEFAULT_CUSTOMER_USER.id, DEFAULT_CUSTOMER_USER);
  memoryPg.users.set(DEFAULT_CUSTOMER_USER.email, DEFAULT_CUSTOMER_USER);

  // Seed Coupons
  for (const cpn of COUPONS_SEED) {
    memoryPg.coupons.set(cpn.code.toUpperCase(), cpn);
    memoryPg.coupons.set(cpn.id, cpn);
  }

  // Seed Reviews
  for (const rev of REVIEWS_SEED) {
    const list = memoryPg.reviews.get(rev.productId) || [];
    list.push(rev);
    memoryPg.reviews.set(rev.productId, list);
  }

  // Seed Categories & Subcategories
  for (const cat of CATEGORIES_SEED) {
    memoryPg.categories.set(cat.id, cat);
    memoryPg.categories.set(cat.slug, cat);
  }

  for (const sub of SUBCATEGORIES_SEED) {
    memoryPg.subcategories.set(sub.id, sub);
    memoryPg.subcategories.set(sub.slug, sub);
  }

  // Seed All 180 Detailed Products into memoryPg and Postgres
  for (const p of PRODUCTS_SEED) {
    // Keep detailed product copy
    memoryPg.detailedProducts.set(p.id, p);
    memoryPg.detailedProducts.set(p.slug, p);

    // Standard product row for search compatibility
    const prodRow: ProductRow = {
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.categoryName,
      category_id: p.categoryId,
      sku: p.sku,
      description: p.description,
      price: p.price,
      original_mrp: p.originalMrp,
      image_url: p.imageUrl,
      attributes: p.specifications,
      tags: p.tags,
      created_at: new Date(p.createdAt)
    };

    if (aivenPg.isConnected) {
      await aivenPg.query(
        `INSERT INTO products (id, title, brand, category, category_id, sku, description, price, original_mrp, image_url, attributes, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           price = EXCLUDED.price,
           original_mrp = EXCLUDED.original_mrp,
           description = EXCLUDED.description,
           category_id = EXCLUDED.category_id,
           image_url = EXCLUDED.image_url,
           attributes = EXCLUDED.attributes,
           tags = EXCLUDED.tags`,
        [
          p.id,
          p.title,
          p.brand,
          p.categoryName,
          p.categoryId,
          p.sku,
          p.description,
          p.price,
          p.originalMrp,
          p.imageUrl,
          JSON.stringify(p.specifications),
          p.tags
        ]
      );
    }
    memoryPg.products.set(p.id, prodRow);

    // Seed Multi-City Local Inventory
    for (const city of CITIES) {
      const invId = `inv-${p.id}-${city.toLowerCase()}`;
      const isBengaluru = city === 'Bengaluru';
      
      // Stock logic: default to realistic stock; keep 2 key test items low-stock for concurrency test
      let availableStock = Math.max(5, p.stockQuantity);
      if (p.id === 'prod-audio-boat-550' && isBengaluru) availableStock = 1;
      if (p.id === 'prod-elec-iphone16-pro' && isBengaluru) availableStock = 2;

      const store = {
        name: `Evalipie Express Fulfillment (${city})`,
        address: `${city} Central Retail Hub, Sector 4`,
        dist: 2.5
      };

      const invRow: InventoryRow = {
        id: invId,
        product_id: p.id,
        city: city,
        available_stock: availableStock,
        reserved_stock: 0,
        reorder_threshold: 3,
        store_name: store.name,
        store_address: store.address,
        distance_km: store.dist,
        updated_at: new Date()
      };

      if (aivenPg.isConnected) {
        await aivenPg.query(
          `INSERT INTO inventory (id, product_id, city, available_stock, reserved_stock, reorder_threshold, store_name, store_address, distance_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (product_id, city) DO UPDATE SET
             available_stock = EXCLUDED.available_stock,
             store_name = EXCLUDED.store_name,
             store_address = EXCLUDED.store_address,
             distance_km = EXCLUDED.distance_km`,
          [
            invId,
            p.id,
            city,
            invRow.available_stock,
            0,
            3,
            invRow.store_name,
            invRow.store_address,
            invRow.distance_km
          ]
        );
      }
      memoryPg.inventory.set(invId, invRow);
    }
  }

  console.log(`✅ Successfully seeded 180 products, 10 categories, 59 subcategories & ${180 * CITIES.length} multi-city inventory records!`);
  console.log(`✅ Default Admin Seeded: admin@evalipie.in / Admin@123456`);
  console.log(`✅ Default Customer Seeded: customer@evalipie.in / Customer@123`);
  console.log('========================================================\n');
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.endsWith('aivenSeed.ts') || process.argv[1]?.endsWith('aivenSeed.js')) {
  runAivenSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
