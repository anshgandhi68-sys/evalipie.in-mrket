import { Request, Response } from 'express';
import { memoryPg, aivenPg } from '../db/aivenPg.js';
import {
  CATEGORIES_SEED,
  SUBCATEGORIES_SEED,
  PRODUCTS_SEED,
  COUPONS_SEED,
  REVIEWS_SEED
} from '../db/marketplaceCatalogueSeed.js';
import { DetailedProduct, CategoryHierarchy, Subcategory, ProductReview, CouponItem, UserAddress } from '../../../shared/types.js';
import { sseEventStream } from './eventsController.js';
import crypto from 'crypto';

export class FlagshipCatalogueController {
  // GET /api/v1/catalog/taxonomy
  getTaxonomy(req: Request, res: Response) {
    try {
      // Refresh live counts from memoryPg.detailedProducts (deduplicated by ID)
      const seenIds = new Set<string>();
      const allProducts = (Array.from(memoryPg.detailedProducts.values()) as DetailedProduct[]).filter(p => {
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });
      
      const categories = CATEGORIES_SEED.map(cat => {
        const catProds = allProducts.filter(p => p.categoryId === cat.id);
        const subcats = cat.subcategories.map(sub => {
          const subProds = allProducts.filter(p => p.subcategoryId === sub.id);
          return {
            ...sub,
            productCount: subProds.length
          };
        });
        return {
          ...cat,
          count: catProds.length,
          subcategories: subcats
        };
      });

      return res.json({
        status: 'success',
        totalCategories: categories.length,
        totalProducts: allProducts.length,
        data: categories
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch taxonomy: ' + err.message });
    }
  }

  // GET /api/v1/catalog/products
  getProducts(req: Request, res: Response) {
    try {
      const {
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        inStock,
        search,
        sort,
        page = '1',
        limit = '24'
      } = req.query;

      let list = Array.from(memoryPg.detailedProducts.values()) as DetailedProduct[];
      // Deduplicate by ID
      const seen = new Set<string>();
      list = list.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // Filter by Category (id or slug or normalized name)
      if (category && category !== 'all') {
        const catVal = String(category).toLowerCase();
        const normCatVal = catVal.replace(/^cat-/, '');
        list = list.filter(p => 
          p.categoryId.toLowerCase() === catVal || 
          p.categoryId.toLowerCase().replace(/^cat-/, '') === normCatVal ||
          p.categoryName.toLowerCase().replace(/\s+/g, '-') === catVal ||
          p.categoryName.toLowerCase() === catVal ||
          (normCatVal === 'home' && p.categoryId === 'cat-home') ||
          (normCatVal === 'laptops' && (p.categoryId === 'cat-laptops' || p.categoryId === 'cat-computers')) ||
          (normCatVal === 'mobiles' && (p.categoryId === 'cat-mobiles' || p.categoryId === 'cat-electronics'))
        );
      }

      // Filter by Subcategory (id or slug)
      if (subcategory && subcategory !== 'all') {
        const subVal = String(subcategory).toLowerCase();
        const normSubVal = subVal.replace(/^sub-/, '');
        list = list.filter(p => 
          p.subcategoryId.toLowerCase() === subVal || 
          p.subcategoryId.toLowerCase().replace(/^sub-/, '') === normSubVal ||
          p.subcategoryName.toLowerCase().replace(/\s+/g, '-') === subVal ||
          p.subcategoryName.toLowerCase() === subVal
        );
      }

      // Filter by Brand
      if (brand && brand !== 'all') {
        const brandVal = String(brand).toLowerCase();
        list = list.filter(p => p.brand.toLowerCase() === brandVal);
      }

      // Filter by Price
      if (minPrice) {
        const min = Number(minPrice);
        if (!isNaN(min)) list = list.filter(p => p.price >= min);
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max)) list = list.filter(p => p.price <= max);
      }

      // Filter by inStock
      if (inStock === 'true' || inStock === '1') {
        list = list.filter(p => p.stockQuantity > 0);
      }

      // Search across Title, Brand, Description, Tags
      if (search && String(search).trim() !== '') {
        const q = String(search).toLowerCase().trim();
        list = list.filter(p => {
          return (
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
          );
        });
      }

      // Sorting
      switch (sort) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'discount':
          list.sort((a, b) => b.discountPercent - a.discountPercent);
          break;
        case 'featured':
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
        case 'newest':
        default:
          // Keep flagship anchor products at top if no sort specified
          list.sort((a, b) => {
            if (a.id.startsWith('prod-hero') && !b.id.startsWith('prod-hero')) return -1;
            if (!a.id.startsWith('prod-hero') && b.id.startsWith('prod-hero')) return 1;
            return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
          });
          break;
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const totalCount = list.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = list.slice(startIndex, startIndex + limitNum);

      return res.json({
        status: 'success',
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        data: paginatedProducts
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to query products: ' + err.message });
    }
  }

  // GET /api/v1/catalog/products/:idOrSlug
  getProductById(req: Request, res: Response) {
    try {
      const { idOrSlug } = req.params;
      let product = memoryPg.detailedProducts.get(idOrSlug);
      
      if (!product) {
        // Try searching by slug or partial match
        for (const p of memoryPg.detailedProducts.values()) {
          if (p.slug === idOrSlug || p.id === idOrSlug) {
            product = p;
            break;
          }
        }
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found in marketplace catalogue.' });
      }

      // Real Reviews from DB (Strict Data Honesty)
      const reviews = memoryPg.reviews.get(product.id) || [];
      const calculatedRating = reviews.length > 0 
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      // Related products in same category
      const all = Array.from(memoryPg.detailedProducts.values()) as DetailedProduct[];
      const related = all
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4);

      return res.json({
        status: 'success',
        data: {
          product: {
            ...product,
            rating: calculatedRating,
            reviewsCount: reviews.length
          },
          reviews,
          related
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to load product details: ' + err.message });
    }
  }

  // GET /api/v1/catalog/deals
  getBentoDeals(req: Request, res: Response) {
    try {
      // 1. MacBook Pro M4 Pro
      const macbook = memoryPg.detailedProducts.get('prod-hero-macbook-m4-pro') || 
                      PRODUCTS_SEED.find(p => p.id === 'prod-hero-macbook-m4-pro');
      
      // 2. AirPods Max
      const airpods = memoryPg.detailedProducts.get('prod-hero-airpods-max') ||
                      PRODUCTS_SEED.find(p => p.id === 'prod-hero-airpods-max');

      // 3. Flat 20% Off Shoes
      const shoes = memoryPg.detailedProducts.get('prod-hero-flat20-shoes') ||
                    PRODUCTS_SEED.find(p => p.id === 'prod-hero-flat20-shoes');

      // 4. Style Deals (Fashion)
      const styleDeal = PRODUCTS_SEED.find(p => p.id === 'prod-fash-zara-linen-shirt') ||
                        PRODUCTS_SEED.find(p => p.categoryId === 'cat-fashion');

      return res.json({
        status: 'success',
        data: {
          bento: {
            card1Macbook: macbook,
            card2Airpods: airpods,
            card3ShoesPromo: shoes,
            card4StyleDeals: styleDeal
          },
          bestsellers: PRODUCTS_SEED.filter(p => p.isBestseller).slice(0, 8),
          topDiscounts: PRODUCTS_SEED.filter(p => p.discountPercent >= 25).slice(0, 8)
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch bento deals: ' + err.message });
    }
  }

  // ── REVIEWS API (Strict Data Honesty) ─────────────────────────────────
  // GET /api/v1/products/:id/reviews
  getReviews(req: Request, res: Response) {
    const { id } = req.params;
    const reviews = memoryPg.reviews.get(id) || [];
    return res.json({ status: 'success', data: reviews });
  }

  // POST /api/v1/products/:id/reviews
  addReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, title, comment, userName, userId } = req.body;

      if (!rating || !comment) {
        return res.status(400).json({ error: 'Rating and comment are required.' });
      }

      const product = memoryPg.detailedProducts.get(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const newReview: ProductReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: id,
        userId: userId || 'usr-anonymous',
        userName: userName || 'Marketplace Verified Shopper',
        rating: Math.max(1, Math.min(5, Number(rating))),
        title: title || 'Verified Customer Review',
        comment: String(comment).trim(),
        isVerifiedPurchase: true,
        createdAt: new Date().toISOString()
      };

      const existingReviews = memoryPg.reviews.get(id) || [];
      existingReviews.unshift(newReview);
      memoryPg.reviews.set(id, existingReviews);

      // Recalculate product rating dynamically
      const avg = Number((existingReviews.reduce((sum, r) => sum + r.rating, 0) / existingReviews.length).toFixed(1));
      product.rating = avg;
      product.reviewsCount = existingReviews.length;
      memoryPg.detailedProducts.set(id, product);

      return res.status(201).json({
        status: 'success',
        data: {
          review: newReview,
          newRating: avg,
          newCount: existingReviews.length
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to submit review: ' + err.message });
    }
  }

  // ── COUPONS ENGINE ──────────────────────────────────────────────────
  // GET /api/v1/coupons/active
  getActiveCoupons(req: Request, res: Response) {
    const coupons = Array.from(memoryPg.coupons.values())
      .filter((c: any, index, self) => index === self.findIndex((t: any) => t.code === c.code))
      .filter((c: any) => c.isActive);
    return res.json({ status: 'success', data: coupons });
  }

  // POST /api/v1/coupons/validate
  validateCoupon(req: Request, res: Response) {
    try {
      const { code, cartTotal } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Coupon code is required.' });
      }

      const coupon = memoryPg.coupons.get(String(code).toUpperCase().trim());
      if (!coupon || !coupon.isActive) {
        return res.status(404).json({ error: 'Invalid or expired coupon code.' });
      }

      const total = Number(cartTotal) || 0;
      if (total < coupon.minOrderInr) {
        return res.status(400).json({
          error: `Coupon ${coupon.code} requires a minimum cart value of ₹${coupon.minOrderInr.toLocaleString('en-IN')}.`
        });
      }

      let discountAmount = 0;
      if (coupon.discountType === 'FLAT') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((total * coupon.discountValue) / 100);
        if (coupon.maxDiscountInr) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountInr);
        }
      }

      const finalTotal = Math.max(0, total - discountAmount);

      return res.json({
        status: 'success',
        data: {
          code: coupon.code,
          discountAmount,
          finalTotal,
          coupon
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Coupon validation failed: ' + err.message });
    }
  }

  // ── WISHLIST API ────────────────────────────────────────────────────
  // GET /api/v1/wishlist
  getWishlist(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'usr-default-customer';
      const productIds = memoryPg.wishlists.get(userId) || new Set<string>();
      
      const items = Array.from(productIds)
        .map(pid => memoryPg.detailedProducts.get(pid))
        .filter(Boolean);

      return res.json({
        status: 'success',
        totalCount: items.length,
        data: items
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch wishlist: ' + err.message });
    }
  }

  // POST /api/v1/wishlist/toggle
  toggleWishlist(req: Request, res: Response) {
    try {
      const { userId = 'usr-default-customer', productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required.' });
      }

      let userWishlist = memoryPg.wishlists.get(userId);
      if (!userWishlist) {
        userWishlist = new Set<string>();
        memoryPg.wishlists.set(userId, userWishlist);
      }

      let inWishlist = false;
      if (userWishlist.has(productId)) {
        userWishlist.delete(productId);
        inWishlist = false;
      } else {
        userWishlist.add(productId);
        inWishlist = true;
      }

      return res.json({
        status: 'success',
        inWishlist,
        totalWishlistCount: userWishlist.size
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to toggle wishlist: ' + err.message });
    }
  }

  // ── ADDRESSES API ───────────────────────────────────────────────────
  // GET /api/v1/addresses
  getAddresses(req: Request, res: Response) {
    const userId = (req.query.userId as string) || 'usr-default-customer';
    const list = memoryPg.addresses.get(userId) || [
      {
        id: 'addr-default-1',
        userId: userId,
        fullName: 'Dominik Doudny',
        phone: '+91 98765 43210',
        line1: 'Flat 402, Prestige Palms',
        line2: '100ft Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true
      }
    ];
    return res.json({ status: 'success', data: list });
  }

  // POST /api/v1/addresses
  saveAddress(req: Request, res: Response) {
    try {
      const { userId = 'usr-default-customer', fullName, phone, line1, line2, city, state, postalCode, isDefault } = req.body;
      if (!fullName || !phone || !line1 || !city || !postalCode) {
        return res.status(400).json({ error: 'All primary address fields are required.' });
      }

      const newAddr: UserAddress = {
        id: `addr-${Date.now()}`,
        userId,
        fullName,
        phone,
        line1,
        line2,
        city,
        state: state || 'Karnataka',
        postalCode,
        country: 'India',
        isDefault: Boolean(isDefault)
      };

      const userAddrs = memoryPg.addresses.get(userId) || [];
      if (newAddr.isDefault) {
        userAddrs.forEach(a => a.isDefault = false);
      }
      userAddrs.push(newAddr);
      memoryPg.addresses.set(userId, userAddrs);

      return res.status(201).json({ status: 'success', data: newAddr });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save address: ' + err.message });
    }
  }
}

export const flagshipCatalogueController = new FlagshipCatalogueController();
