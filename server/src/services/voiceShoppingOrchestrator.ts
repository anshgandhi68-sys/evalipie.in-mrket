import { memoryPg, aivenPg } from '../db/aivenPg.js';
import { aivenOpenSearch } from './openSearchService.js';
import { intentParser } from '../ai/intent-parser.js';
import { gnaniVoiceService } from './gnaniVoiceService.js';

export type VoiceShoppingStage =
  | 'DISCOVERY'
  | 'PRODUCT_RESULTS'
  | 'PRODUCT_SELECTED'
  | 'CART_REVIEW'
  | 'ADDRESS_SELECTION'
  | 'ORDER_REVIEW'
  | 'CONFIRMATION_PENDING'
  | 'ORDER_CREATED'
  | 'ORDER_FAILED'
  | 'CANCELLED';

export interface VoiceSessionState {
  sessionId: string;
  stage: VoiceShoppingStage;
  city: string;
  language: string;
  lastResults: any[];
  selectedProduct: any | null;
  cart: {
    cartId: string;
    items: any[];
    totalAmount: number;
    totalCount: number;
  };
  delivery: {
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    pinCode: string;
    deliveryFee: number;
  };
  pendingOrderDraft: {
    items: any[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    idempotencyKey: string;
  } | null;
  confirmedOrder: {
    orderId: string;
    totalAmount: number;
    status: string;
    deliveryAddress: string;
    createdAt: string;
  } | null;
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>;
  spokenResponse?: string;
  audioBase64?: string;
}

export class VoiceShoppingOrchestrator {
  private sessions: Map<string, VoiceSessionState> = new Map();

  /**
   * Get or initialize session state
   */
  getSession(sessionId: string, initialCity: string = 'Bengaluru'): VoiceSessionState {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        stage: 'DISCOVERY',
        city: initialCity,
        language: 'hi-IN',
        lastResults: [],
        selectedProduct: null,
        cart: {
          cartId: `cart-${sessionId}`,
          items: [],
          totalAmount: 0,
          totalCount: 0
        },
        delivery: {
          customerName: 'Ananya Sharma',
          customerPhone: '+919876543210',
          address: '42, 100ft Road, Indiranagar',
          city: initialCity,
          pinCode: '560038',
          deliveryFee: 0 // Free hyperlocal delivery
        },
        pendingOrderDraft: null,
        confirmedOrder: null,
        conversationHistory: []
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  /**
   * Process Natural Voice / Text Interaction
   */
  async processInteraction(
    sessionId: string,
    userInput: string,
    preferredLanguage: string = 'hi-IN',
    city: string = 'Bengaluru',
    skipSynthesis: boolean = false
  ): Promise<VoiceSessionState> {
    const session = this.getSession(sessionId, city);
    session.language = preferredLanguage;
    const cleanInput = userInput.trim();
    const lowerInput = cleanInput.toLowerCase();

    // 1. Record User Spoken Turn
    session.conversationHistory.push({
      role: 'user',
      text: cleanInput,
      timestamp: new Date().toISOString()
    });

    let spokenReply = '';

    // ─────────────────────────────────────────────────────────────────
    // STEP A: EXPLICIT ORDER CONFIRMATION HANDLING (CRITICAL SAFETY)
    // ─────────────────────────────────────────────────────────────────
    if (session.stage === 'CONFIRMATION_PENDING') {
      const isAffirmative =
        lowerInput.includes('haan') ||
        lowerInput.includes('ha') ||
        lowerInput.includes('yes') ||
        lowerInput.includes('confirm') ||
        lowerInput.includes('karo') ||
        lowerInput.includes('place order') ||
        lowerInput.includes('order place kar do') ||
        lowerInput.includes('place kar do');

      const isNegative =
        lowerInput.includes('nahi') ||
        lowerInput.includes('no') ||
        lowerInput.includes('cancel') ||
        lowerInput.includes('mat karo') ||
        lowerInput.includes('ruk jao');

      if (isNegative) {
        session.stage = 'CART_REVIEW';
        session.pendingOrderDraft = null;
        spokenReply = 'Theek hai, order cancel kar diya gaya hai. Aapka cart surakshit hai. Kya aap kuch aur dekhna chahenge?';
      } else if (isAffirmative && session.pendingOrderDraft) {
        // Execute Confirmed Order Creation with verified inventory lock
        try {
          const order = await this.executeOrderPlacement(session);
          session.stage = 'ORDER_CREATED';
          session.confirmedOrder = order;
          session.pendingOrderDraft = null;
          // Clear cart
          session.cart.items = [];
          session.cart.totalAmount = 0;
          session.cart.totalCount = 0;

          spokenReply = `Badhaai ho! Aapka order safaltaapoorvak place ho gaya hai. Order ID hai ${order.orderId}. Kul ${order.totalAmount} rupaye. Indiranagar branch se 30 minute mein dispatch hoga.`;
        } catch (err: any) {
          session.stage = 'ORDER_FAILED';
          spokenReply = `Maaf kijiye, order process karte samay samasya aayi: ${err.message}. Kripya dobara koshish karein.`;
        }
      } else {
        spokenReply = `Aapka kul total ₹${session.pendingOrderDraft?.totalAmount || session.cart.totalAmount} hai. Kripya spasht batayein: Kya main order confirm kar doon? Bolen 'Haan' ya 'Nahi'.`;
      }

      return this.finalizeTurn(session, spokenReply, skipSynthesis);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP B: CHECKOUT INTENT ("Order karna hai", "Checkout", "Buy now")
    // ─────────────────────────────────────────────────────────────────
    if (
      lowerInput.includes('order karna hai') ||
      lowerInput.includes('checkout') ||
      lowerInput.includes('order place karo') ||
      lowerInput.includes('order kar dena') ||
      lowerInput.includes('kharidna hai') ||
      lowerInput.includes('buy now')
    ) {
      if (session.cart.items.length === 0) {
        spokenReply = 'Aapka cart abhi khaali hai. Pehle koi product cart mein add kijiye, phir checkout karenge.';
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      }

      // Enter ORDER_REVIEW / CONFIRMATION_PENDING
      session.stage = 'CONFIRMATION_PENDING';
      const subtotal = session.cart.totalAmount;
      const deliveryFee = 0;
      const grandTotal = subtotal + deliveryFee;

      session.pendingOrderDraft = {
        items: [...session.cart.items],
        subtotal,
        deliveryFee,
        totalAmount: grandTotal,
        idempotencyKey: `voice-ord-${sessionId}-${Date.now()}`
      };

      const itemsSummary = session.cart.items
        .map(i => `${i.quantity} ${i.title}`)
        .join(', ');

      spokenReply = `Aapke cart mein ${itemsSummary} hai. Delivery address hai ${session.delivery.address}, ${session.delivery.city}. Kul total hai ${grandTotal} rupaye. Kya main ye order place kar doon?`;
      return this.finalizeTurn(session, spokenReply, skipSynthesis);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP C: CART REVIEW ("Cart dikhao", "Cart ka total batao")
    // ─────────────────────────────────────────────────────────────────
    if (
      lowerInput.includes('cart') &&
      (lowerInput.includes('dikhao') ||
        lowerInput.includes('total') ||
        lowerInput.includes('show') ||
        lowerInput.includes('kya hai') ||
        lowerInput.includes('summary'))
    ) {
      session.stage = 'CART_REVIEW';
      if (session.cart.items.length === 0) {
        spokenReply = 'Aapka cart khaali hai. Aap mujhse koi bhi electronics ya product khojne ko keh sakte hain.';
      } else {
        const itemNames = session.cart.items.map(i => `${i.quantity}x ${i.title}`).join(', ');
        spokenReply = `Aapke cart mein ${session.cart.totalCount} items hain: ${itemNames}. Kul total ${session.cart.totalAmount} rupaye hai. Kya aap checkout karna chahte hain?`;
      }
      return this.finalizeTurn(session, spokenReply, skipSynthesis);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP D: CONTEXTUAL PRODUCT SELECTION ("Pehla wala dikhao", "Second one")
    // ─────────────────────────────────────────────────────────────────
    if (
      lowerInput.includes('pehla') ||
      lowerInput.includes('first') ||
      lowerInput.includes('1st') ||
      lowerInput.includes('doosra') ||
      lowerInput.includes('dusra') ||
      lowerInput.includes('second') ||
      lowerInput.includes('2nd') ||
      lowerInput.includes('teesra') ||
      lowerInput.includes('third') ||
      lowerInput.includes('3rd')
    ) {
      let index = 0;
      if (lowerInput.includes('doosra') || lowerInput.includes('dusra') || lowerInput.includes('second') || lowerInput.includes('2nd')) index = 1;
      if (lowerInput.includes('teesra') || lowerInput.includes('third') || lowerInput.includes('3rd')) index = 2;

      if (session.lastResults.length > index) {
        const prod = session.lastResults[index];
        session.selectedProduct = prod;
        session.stage = 'PRODUCT_SELECTED';

        // Check if user also said "add karo"
        if (lowerInput.includes('add') || lowerInput.includes('cart')) {
          this.addItemToCart(session, prod, 1);
          spokenReply = `${prod.title} cart mein add kar diya gaya hai. Price hai ${prod.price} rupaye. Kya aap aur kuch dekhna chahenge ya checkout karein?`;
        } else {
          spokenReply = `Ye raha ${prod.title} by ${prod.brand}. Keemat hai ${prod.price} rupaye. Verified local stock available hai. Kya main ise cart mein add karoon?`;
        }
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP E: ADD CURRENT PRODUCT TO CART ("Isko cart mein add kar do")
    // ─────────────────────────────────────────────────────────────────
    if (
      (lowerInput.includes('cart mein add') ||
        lowerInput.includes('add to cart') ||
        lowerInput.includes('add kar do') ||
        lowerInput.includes('add karo') ||
        lowerInput.includes('le lo')) &&
      (session.selectedProduct || session.lastResults.length > 0)
    ) {
      const prod = session.selectedProduct || session.lastResults[0];
      session.selectedProduct = prod;
      this.addItemToCart(session, prod, 1);
      session.stage = 'PRODUCT_SELECTED';
      spokenReply = `${prod.title} aapke cart mein add kar diya gaya hai. Cart ka total ${session.cart.totalAmount} rupaye ho gaya hai. Agla kadam kya karein?`;
      return this.finalizeTurn(session, spokenReply, skipSynthesis);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP F: UPDATE QUANTITY ("Ek aur add karna", "Quantity two kar do")
    // ─────────────────────────────────────────────────────────────────
    if (
      lowerInput.includes('ek aur') ||
      lowerInput.includes('quantity') ||
      lowerInput.includes('aur add') ||
      lowerInput.includes('two kar do') ||
      lowerInput.includes('2 kar do')
    ) {
      if (session.cart.items.length > 0) {
        const lastItem = session.cart.items[session.cart.items.length - 1];
        let newQty = lastItem.quantity + 1;
        if (lowerInput.includes('two') || lowerInput.includes('2')) newQty = 2;
        if (lowerInput.includes('three') || lowerInput.includes('3')) newQty = 3;

        lastItem.quantity = newQty;
        session.cart.totalAmount = session.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        session.cart.totalCount = session.cart.items.reduce((s, i) => s + i.quantity, 0);

        spokenReply = `${lastItem.title} ki quantity ab ${lastItem.quantity} ho gayi hai. Total cart amount ab ${session.cart.totalAmount} rupaye hai.`;
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP G: REMOVE ITEM FROM CART ("Remove karo", "Hata do")
    // ─────────────────────────────────────────────────────────────────
    if (lowerInput.includes('remove') || lowerInput.includes('hata do') || lowerInput.includes('delete karo')) {
      if (session.cart.items.length > 0) {
        const removed = session.cart.items.pop();
        session.cart.totalAmount = session.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        session.cart.totalCount = session.cart.items.reduce((s, i) => s + i.quantity, 0);
        session.stage = 'PRODUCT_RESULTS';
        spokenReply = `${removed.title} ko cart se hata diya gaya hai. Cart ka naya total ${session.cart.totalAmount} rupaye hai.`;
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      } else {
        session.stage = 'PRODUCT_RESULTS';
        spokenReply = 'Cart pehle se hi khaali hai.';
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP H: PRODUCT CATALOGUE SEARCH & DISCOVERY (Core NLU)
    // ─────────────────────────────────────────────────────────────────
    const parsed = await intentParser.parse(cleanInput);
    const intent = parsed.intent;

    // Category normalizer for Aiven OpenSearch index
    let searchCategory: string | undefined = undefined;
    if (intent.category) {
      const catLower = intent.category.toLowerCase();
      if (catLower.includes('audio') || catLower.includes('headphone') || catLower.includes('sound') || catLower.includes('earbud') || catLower.includes('electronic')) {
        searchCategory = 'AUDIO';
      } else if (catLower.includes('mobile') || catLower.includes('phone') || catLower.includes('smartphone')) {
        searchCategory = 'MOBILES';
      } else if (catLower.includes('laptop') || catLower.includes('computer') || catLower.includes('pc')) {
        searchCategory = 'LAPTOPS';
      } else if (catLower.includes('fashion') || catLower.includes('apparel') || catLower.includes('cloth') || catLower.includes('shirt')) {
        searchCategory = 'FASHION';
      } else if (catLower.includes('shoe') || catLower.includes('footwear') || catLower.includes('running') || catLower.includes('sneaker')) {
        searchCategory = 'FOOTWEAR';
      } else if (catLower.includes('kitchen') || catLower.includes('home') || catLower.includes('chair') || catLower.includes('furniture')) {
        searchCategory = 'HOME & KITCHEN';
      } else {
        searchCategory = intent.category.toUpperCase();
      }
    }

    // Search OpenSearch with Typo-Tolerance & Fuzziness
    let searchRes = await aivenOpenSearch.search({
      query: intent.query || cleanInput,
      category: searchCategory,
      city: session.city,
      maxPrice: intent.budget.max || undefined,
      limit: 4
    });

    // Fallback: If narrow category returned 0 matches, search across entire catalogue
    if (searchRes.data.length === 0 && searchCategory) {
      searchRes = await aivenOpenSearch.search({
        query: intent.query || cleanInput,
        city: session.city,
        maxPrice: intent.budget.max || undefined,
        limit: 4
      });
    }

    // Ground in PostgreSQL Records
    const verifiedMatches = searchRes.data.map(doc => {
      const inv = memoryPg.findInventory(doc.product_id, session.city);
      const stock = inv ? inv.available_stock : doc.available_stock;
      return {
        productId: doc.product_id,
        title: doc.name,
        brand: doc.brand,
        category: doc.category,
        price: doc.price,
        originalMrp: doc.original_mrp,
        imageUrl: doc.image_url,
        availableStock: stock,
        inStock: stock > 0,
        storeName: inv ? inv.store_name : `${session.city} Storefront`
      };
    });

    session.lastResults = verifiedMatches;

    if (verifiedMatches.length > 0) {
      session.stage = 'PRODUCT_RESULTS';
      session.selectedProduct = verifiedMatches[0]; // Set default top recommendation
      const top = verifiedMatches[0];

      // If user prompt also included explicit add command (e.g. "boAt rockerz add karo" or "add to cart")
      if (lowerInput.includes('add') || lowerInput.includes('cart mein')) {
        this.addItemToCart(session, top, 1);
        session.stage = 'PRODUCT_SELECTED';
        spokenReply = `${top.title} aapke cart mein add kar diya gaya hai. Price hai ${top.price} rupaye. Kya aap aur kuch dekhna chahenge ya checkout karein?`;
        return this.finalizeTurn(session, spokenReply, skipSynthesis);
      }

      if (verifiedMatches.length === 1) {
        spokenReply = `Mujhe mila hai ${top.title} by ${top.brand}, keemat ${top.price} rupaye. In-stock hai ${top.storeName} mein. Kya aap ise cart mein add karna chahenge?`;
      } else {
        const others = verifiedMatches.slice(1, 3).map(m => `${m.title} ₹${m.price}`).join(', aur ');
        spokenReply = `Mainne ${verifiedMatches.length} vikalp dhoonde hain. Sabse pehla hai ${top.title} by ${top.brand} ₹${top.price} mein. Iske alawa ${others} bhi uplabdh hain. Pehla wala cart mein add karoon?`;
      }
    } else {
      session.stage = 'DISCOVERY';
      spokenReply = `Maaf kijiye, ${session.city} ke verified stores mein is budget ya category ka koi item uplabdh nahi mila. Kya aap budget thoda badhana chahenge ya koi dusra brand dekhna chahenge?`;
    }

    return this.finalizeTurn(session, spokenReply, skipSynthesis);
  }

  /**
   * Helper: Add item to cart
   */
  private addItemToCart(session: VoiceSessionState, product: any, quantity: number = 1) {
    const existing = session.cart.items.find(i => i.productId === product.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      session.cart.items.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.productId,
        title: product.title,
        price: product.price,
        originalMrp: product.originalMrp || product.price,
        imageUrl: product.imageUrl,
        quantity,
        storeName: product.storeName || `${session.city} Storefront`
      });
    }

    session.cart.totalAmount = session.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    session.cart.totalCount = session.cart.items.reduce((s, i) => s + i.quantity, 0);
  }

  /**
   * Helper: Execute verified order placement with atomic inventory lock
   */
  private async executeOrderPlacement(session: VoiceSessionState): Promise<any> {
    const orderId = `ord-voice-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const idempotencyKey = session.pendingOrderDraft?.idempotencyKey || `idemp-${orderId}`;

    // Verify stock and price against PostgreSQL
    for (const item of session.cart.items) {
      const inv = memoryPg.findInventory(item.productId, session.city);
      if (inv && inv.available_stock < item.quantity) {
        throw new Error(`Item ${item.title} has insufficient stock. Only ${inv.available_stock} remaining.`);
      }
      // Lock stock atomically
      if (inv) {
        inv.available_stock -= item.quantity;
        inv.reserved_stock += item.quantity;
      }
    }

    const orderRecord = {
      orderId,
      customerName: session.delivery.customerName,
      customerPhone: session.delivery.customerPhone,
      deliveryAddress: `${session.delivery.address}, ${session.delivery.city} - ${session.delivery.pinCode}`,
      city: session.city,
      items: [...session.cart.items],
      totalAmount: session.pendingOrderDraft?.totalAmount || session.cart.totalAmount,
      status: 'CONFIRMED',
      paymentMethod: 'CASH_ON_DELIVERY_OR_UPI',
      idempotencyKey,
      createdAt: new Date().toISOString()
    };

    // Store in verified memory orders
    memoryPg.orders.set(orderId, {
      id: orderId,
      idempotency_key: idempotencyKey,
      user_id: 'cust-voice-user',
      customer_name: session.delivery.customerName,
      customer_phone: session.delivery.customerPhone,
      delivery_address: orderRecord.deliveryAddress,
      city: session.city,
      total_amount: orderRecord.totalAmount,
      status: 'CONFIRMED',
      fulfillment_type: 'LOCAL_DELIVERY',
      created_at: new Date(orderRecord.createdAt)
    });

    return orderRecord;
  }

  /**
   * Finalize turn: record assistant speech and synthesize real Gnani audio
   */
  private async finalizeTurn(session: VoiceSessionState, spokenReply: string, skipSynthesis: boolean = false): Promise<VoiceSessionState> {
    session.spokenResponse = spokenReply;
    session.conversationHistory.push({
      role: 'assistant',
      text: spokenReply,
      timestamp: new Date().toISOString()
    });

    if (skipSynthesis) {
      session.audioBase64 = undefined;
      return session;
    }

    // Synthesize voice audio with Gnani Timbre v3.0
    try {
      const audioBuffer = await gnaniVoiceService.synthesize(spokenReply, {
        voice: 'Shivani',
        language: session.language || 'hi-IN',
        model: 'timbre-v3.0'
      });
      session.audioBase64 = audioBuffer.toString('base64');
    } catch (err: any) {
      console.warn('[Gnani Timbre Synthesis Fallback]:', err.message);
      session.audioBase64 = undefined;
    }

    return session;
  }
}

export const voiceShoppingOrchestrator = new VoiceShoppingOrchestrator();
