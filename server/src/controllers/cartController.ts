import { Request, Response } from 'express';
import { memoryPg } from '../db/aivenPg.js';

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  title: string;
  imageUrl: string;
  city: string;
  price: number;
  originalMrp: number;
  quantity: number;
  storeName: string;
}

export class CartController {
  private getSessionCartId(req: Request): string {
    const headerId = req.headers['x-cart-id'] || req.headers['x-session-id'];
    if (headerId && typeof headerId === 'string') return headerId;
    return 'default-user-cart';
  }

  // GET /api/cart
  async getCart(req: Request, res: Response) {
    const cartId = this.getSessionCartId(req);
    const items: CartItem[] = [];

    for (const item of memoryPg.cart_items.values()) {
      if (item.cartId === cartId) {
        items.push(item);
      }
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return res.json({
      status: 'success',
      data: {
        cartId,
        items,
        totalCount,
        totalAmount
      }
    });
  }

  // POST /api/cart
  async addToCart(req: Request, res: Response) {
    try {
      const cartId = this.getSessionCartId(req);
      const { productId, city = 'Bengaluru', quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'productId is required.' });
      }

      const product = memoryPg.products.get(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      // Check stock
      const inv = memoryPg.findInventory(productId, city);
      const availableStock = inv ? inv.available_stock : 5;
      if (availableStock <= 0) {
        return res.status(409).json({ error: 'Product is currently out of stock in this city.' });
      }

      const itemId = `item-${cartId}-${productId}-${city.toLowerCase()}`;
      const existing = memoryPg.cart_items.get(itemId);

      if (existing) {
        existing.quantity += Number(quantity);
        memoryPg.cart_items.set(itemId, existing);
      } else {
        const newItem: CartItem = {
          id: itemId,
          cartId,
          productId,
          title: product.title,
          imageUrl: product.image_url,
          city,
          price: Number(product.price),
          originalMrp: Number(product.original_mrp || product.price * 1.2),
          quantity: Number(quantity),
          storeName: inv ? inv.store_name : `${city} Storefront`
        };
        memoryPg.cart_items.set(itemId, newItem);
      }

      return this.getCart(req, res);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to add item to cart: ' + err.message });
    }
  }

  // PUT /api/cart/:id
  async updateCartItem(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = memoryPg.cart_items.get(id);
    if (!item) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    if (Number(quantity) <= 0) {
      memoryPg.cart_items.delete(id);
    } else {
      item.quantity = Number(quantity);
      memoryPg.cart_items.set(id, item);
    }

    return this.getCart(req, res);
  }

  // DELETE /api/cart/:id
  async removeFromCart(req: Request, res: Response) {
    const { id } = req.params;
    memoryPg.cart_items.delete(id);
    return this.getCart(req, res);
  }
}

export const cartController = new CartController();
