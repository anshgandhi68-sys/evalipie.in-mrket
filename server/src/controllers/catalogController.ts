import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { searchService } from '../services/searchService.js';
import { aiDiscoveryService } from '../services/aiDiscoveryService.js';

export const catalogController = {
  // GET /api/products
  getProducts: (req: Request, res: Response) => {
    const { category, q, city, minPrice, maxPrice } = req.query;
    const results = searchService.search({
      query: q as string,
      category: category as string,
      city: (city as string) || 'Bengaluru',
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined
    });

    res.json({
      status: 'success',
      totalCount: results.length,
      data: results
    });
  },

  // GET /api/products/:id
  getProductById: (req: Request, res: Response) => {
    const product = db.products.get(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    const { offers } = searchService.getMultiSellerOffers(product.id, req.query.city as string || 'Bengaluru');
    res.json({
      status: 'success',
      data: {
        product,
        offers,
        minPrice: offers.length > 0 ? offers[0].sellingPrice : 0
      }
    });
  },

  // GET /api/products/:id/sellers (Multi-Seller Comparison)
  getProductSellers: (req: Request, res: Response) => {
    const result = searchService.getMultiSellerOffers(req.params.id, req.query.city as string || 'Bengaluru');
    if (!result.canonicalProduct) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({
      status: 'success',
      data: result
    });
  },

  // GET /api/categories
  getCategories: (_req: Request, res: Response) => {
    const categories = [
      { id: 'cat-1', name: 'Electronics', icon: 'headphones', count: 12 },
      { id: 'cat-2', name: 'Computers & Laptops', icon: 'laptop', count: 8 },
      { id: 'cat-3', name: 'Mobiles & Accessories', icon: 'smartphone', count: 14 },
      { id: 'cat-4', name: 'Home & Kitchen', icon: 'utensils', count: 9 },
      { id: 'cat-5', name: 'Fashion', icon: 'shirt', count: 6 },
      { id: 'cat-6', name: 'Grocery', icon: 'shopping-bag', count: 15 },
      { id: 'cat-7', name: 'Sports & Fitness', icon: 'trophy', count: 7 }
    ];
    res.json({ status: 'success', data: categories });
  },

  // GET /api/shops
  getShops: (req: Request, res: Response) => {
    const shops = Array.from(db.shops.values()).map(s => {
      const stores = Array.from(db.stores.values()).filter(st => st.organizationId === s.organizationId);
      const org = db.organizations.get(s.organizationId);
      return {
        ...s,
        businessType: org?.businessType,
        stores
      };
    });
    res.json({ status: 'success', data: shops });
  },

  // GET /api/shops/:slug
  getShopBySlug: (req: Request, res: Response) => {
    const shop = Array.from(db.shops.values()).find(s => s.slug === req.params.slug);
    if (!shop) {
      return res.status(404).json({ status: 'error', message: 'Shop not found' });
    }
    const org = db.organizations.get(shop.organizationId);
    const stores = Array.from(db.stores.values()).filter(st => st.organizationId === shop.organizationId);
    const listings = Array.from(db.listings.values())
      .filter(l => l.organizationId === shop.organizationId && l.isActive)
      .map(l => {
        const product = db.products.get(l.productId);
        const inv = stores.map(st => db.findInventory(l.id, st.id)).filter(Boolean);
        const totalStock = inv.reduce((sum, item) => sum + Math.max(0, (item?.quantity || 0) - (item?.reservedQuantity || 0)), 0);
        return {
          ...l,
          product,
          availableStock: totalStock
        };
      });

    res.json({
      status: 'success',
      data: {
        shop,
        organization: org,
        stores,
        listings
      }
    });
  },

  // GET /api/search
  search: (req: Request, res: Response) => {
    const { q, category, city, minPrice, maxPrice } = req.query;
    const results = searchService.search({
      query: q as string,
      category: category as string,
      city: (city as string) || 'Bengaluru',
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined
    });
    res.json({ status: 'success', data: results });
  },

  // POST /api/ai/discover
  aiDiscover: (req: Request, res: Response) => {
    const { prompt, city } = req.body;
    if (!prompt) {
      return res.status(400).json({ status: 'error', message: 'Prompt is required' });
    }
    const result = aiDiscoveryService.discover(prompt, city || 'Bengaluru');
    res.json({ status: 'success', data: result });
  }
};
