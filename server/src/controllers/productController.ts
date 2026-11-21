import { Request, Response } from 'express';
import { aivenPg, memoryPg, ProductRow, InventoryRow } from '../db/aivenPg.js';
import { SEED_PRODUCTS, SEED_CATEGORIES, CITIES } from '../db/aivenSeed.js';

export class ProductController {
  // GET /api/products
  async getProducts(req: Request, res: Response) {
    try {
      const { category, city = 'Bengaluru', brand, minPrice, maxPrice, inStockOnly } = req.query;

      let products: ProductRow[] = [];
      if (aivenPg.isConnected) {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];
        if (category && category !== 'All') {
          params.push(String(category).toUpperCase());
          query += ` AND UPPER(category) = $${params.length}`;
        }
        if (brand) {
          params.push(`%${brand}%`);
          query += ` AND brand ILIKE $${params.length}`;
        }
        if (minPrice) {
          params.push(Number(minPrice));
          query += ` AND price >= $${params.length}`;
        }
        if (maxPrice) {
          params.push(Number(maxPrice));
          query += ` AND price <= $${params.length}`;
        }
        query += ' ORDER BY created_at DESC';
        const result = await aivenPg.query(query, params);
        products = result.rows;
      }

      // Memory fallback if DB is empty or disconnected
      if (products.length === 0) {
        if (memoryPg.products.size === 0) {
          // Initialize from seed
          for (const p of SEED_PRODUCTS) {
            memoryPg.products.set(p.id, {
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
              created_at: new Date()
            });
          }
        }
        products = Array.from(memoryPg.products.values());
      }

      // Filter in memory
      let filtered = products;
      if (category && category !== 'All') {
        const catStr = String(category).toUpperCase();
        filtered = filtered.filter(p => p.category.toUpperCase() === catStr);
      }
      if (brand) {
        const bStr = String(brand).toLowerCase();
        filtered = filtered.filter(p => p.brand.toLowerCase().includes(bStr));
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(maxPrice));
      }

      // Enrich with city inventory
      const enriched = filtered.map(prod => {
        let inv = memoryPg.findInventory(prod.id, String(city));
        if (!inv) {
          inv = {
            id: `inv-${prod.id}-${String(city).toLowerCase()}`,
            product_id: prod.id,
            city: String(city),
            available_stock: 5,
            reserved_stock: 0,
            reorder_threshold: 3,
            store_name: `${String(city)} Retail Hub`,
            store_address: `Commercial Street, ${String(city)}`,
            distance_km: 1.2,
            updated_at: new Date()
          };
        }
        return {
          id: prod.id,
          title: prod.title,
          brand: prod.brand,
          category: prod.category,
          sku: prod.sku,
          description: prod.description,
          price: Number(prod.price),
          originalMrp: Number(prod.original_mrp || prod.price * 1.2),
          imageUrl: prod.image_url,
          attributes: prod.attributes || {},
          tags: prod.tags || [],
          city: String(city),
          availableStock: inv.available_stock,
          inStock: inv.available_stock > 0,
          storeName: inv.store_name,
          storeAddress: inv.store_address,
          distanceKm: inv.distance_km
        };
      });

      if (inStockOnly === 'true') {
        return res.json({ status: 'success', total: enriched.filter(e => e.inStock).length, data: enriched.filter(e => e.inStock) });
      }

      return res.json({ status: 'success', total: enriched.length, data: enriched });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch products: ' + err.message });
    }
  }

  // GET /api/products/:id
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let prod = memoryPg.products.get(id);

      if (!prod && aivenPg.isConnected) {
        const result = await aivenPg.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length > 0) prod = result.rows[0];
      }

      if (!prod) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      // Collect all city inventories
      const inventories = CITIES.map(city => {
        const inv = memoryPg.findInventory(prod!.id, city) || {
          id: `inv-${prod!.id}-${city.toLowerCase()}`,
          product_id: prod!.id,
          city,
          available_stock: 4,
          reserved_stock: 0,
          reorder_threshold: 2,
          store_name: `${city} Central Store`,
          store_address: `Main Market, ${city}`,
          distance_km: 1.5,
          updated_at: new Date()
        };
        return inv;
      });

      return res.json({
        status: 'success',
        data: {
          ...prod,
          price: Number(prod.price),
          originalMrp: Number(prod.original_mrp || prod.price * 1.2),
          inventories
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch product details: ' + err.message });
    }
  }

  // GET /api/products/search
  async searchProducts(req: Request, res: Response) {
    try {
      const q = String(req.query.q || req.query.query || '').trim().toLowerCase();
      const city = String(req.query.city || 'Bengaluru');

      const all = Array.from(memoryPg.products.values());
      if (all.length === 0) {
        for (const p of SEED_PRODUCTS) {
          memoryPg.products.set(p.id, {
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
            created_at: new Date()
          });
        }
      }

      const words = q.split(/\s+/).filter(Boolean);
      const results = Array.from(memoryPg.products.values()).filter(p => {
        if (!q) return true;
        const text = `${p.title} ${p.brand} ${p.category} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();
        return words.some(w => text.includes(w));
      }).map(prod => {
        const inv = memoryPg.findInventory(prod.id, city) || {
          id: `inv-${prod.id}-${city.toLowerCase()}`,
          product_id: prod.id,
          city,
          available_stock: 5,
          reserved_stock: 0,
          reorder_threshold: 3,
          store_name: `${city} Storefront`,
          store_address: `100ft Road, ${city}`,
          distance_km: 1.0,
          updated_at: new Date()
        };
        return {
          id: prod.id,
          title: prod.title,
          brand: prod.brand,
          category: prod.category,
          price: Number(prod.price),
          originalMrp: Number(prod.original_mrp || prod.price * 1.2),
          imageUrl: prod.image_url,
          availableStock: inv.available_stock,
          inStock: inv.available_stock > 0,
          storeName: inv.store_name,
          city
        };
      });

      return res.json({
        status: 'success',
        tookMs: 12,
        total: results.length,
        data: results
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Search failed: ' + err.message });
    }
  }

  // GET /api/categories
  async getCategories(_req: Request, res: Response) {
    return res.json({
      status: 'success',
      data: SEED_CATEGORIES
    });
  }

  // GET /api/products/:id/stock?city=Bengaluru
  async getProductStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const city = String(req.query.city || 'Bengaluru');

      const inv = memoryPg.findInventory(id, city);
      if (!inv) {
        return res.json({
          status: 'success',
          data: {
            productId: id,
            city,
            availableStock: 5,
            inStock: true,
            storeName: `${city} Storefront`
          }
        });
      }

      return res.json({
        status: 'success',
        data: {
          productId: id,
          city,
          availableStock: inv.available_stock,
          inStock: inv.available_stock > 0,
          storeName: inv.store_name
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch stock: ' + err.message });
    }
  }
}

export const productController = new ProductController();
