// EVALIPIE Shared Types & Domain Models

export type BusinessType = 'INDEPENDENT_SHOP' | 'RETAIL_CHAIN';
export type UserRole = 'CUSTOMER' | 'STORE_MANAGER' | 'MERCHANT_OWNER' | 'SUPER_ADMIN';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type FulfillmentType = 'STORE_PICKUP' | 'LOCAL_DELIVERY';
export type LedgerEntryType = 'CREDIT' | 'PAYMENT' | 'ADJUSTMENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  organizationId?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  businessType: BusinessType;
  taxIdentifier?: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Store {
  id: string;
  organizationId: string;
  name: string;
  storeCode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  isActive: boolean;
}

export interface Shop {
  id: string;
  organizationId: string;
  slug: string;
  displayName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  ratingAvg: number;
  ratingCount: number;
  isPublished: boolean;
  stores?: Store[];
}

export interface CanonicalProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  subCategory?: string;
  upcEan?: string;
  description: string;
  attributes: Record<string, string | number | boolean>;
  imageUrl: string;
  tags?: string[];
}

export interface MerchantListing {
  id: string;
  organizationId: string;
  productId: string;
  merchantSku?: string;
  sellingPrice: number;
  originalMrp?: number;
  condition: 'NEW' | 'REFURBISHED';
  isActive: boolean;
  product?: CanonicalProduct;
  shop?: Shop;
  inventory?: StoreInventory[];
}

export interface StoreInventory {
  id: string;
  listingId: string;
  storeId: string;
  quantity: number;
  reservedQuantity: number;
  reorderThreshold: number;
  storeName?: string;
  city?: string;
  availableQuantity?: number;
}

export interface MultiSellerOffer {
  listingId: string;
  merchant: {
    organizationId: string;
    shopName: string;
    shopSlug: string;
    logoUrl?: string;
    rating: number;
  };
  store: {
    storeId: string;
    name: string;
    city: string;
    address: string;
    distanceKm: number;
  };
  sellingPrice: number;
  originalMrp?: number;
  stockStatus: StockStatus;
  availableQuantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  productId: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  productTitle?: string;
  shopName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  organizationId: string;
  storeId: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  fulfillmentType: FulfillmentType;
  items: OrderItem[];
  createdAt: string;
  shopName?: string;
  storeName?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayQrId?: string;
  paidAt?: string;
}

// Merchant Ledger Domain Models
export interface LedgerCustomer {
  id: string;
  organizationId: string;
  name: string;
  phone?: string;
  disambiguationTag?: string;
  currentBalance: number; // Positive = Customer owes merchant (Udhaar)
  isActive: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  organizationId: string;
  customerId: string;
  customerName?: string;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  notes?: string;
  createdAt: string;
}

// Transactional Outbox & Kafka Models
export interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: 'order.placed' | 'inventory.changed' | 'listing.updated';
  topic: string;
  payload: Record<string, unknown>;
  createdAt: string;
  dispatchedAt?: string;
  retryCount: number;
  lastError?: string;
}

// Search & AI Discovery Models
export interface StructuredIntent {
  category?: string;
  keywords: string[];
  max_budget?: number | null;
  city?: string | null;
  clarification_needed: boolean;
  clarification_question?: string | null;
  inferred_need: string;
}

export interface AiDiscoveryResult {
  conversationId?: string;
  explanation?: string;
  intentAnalysis: StructuredIntent;
  matches: Array<{
    productId: string;
    title: string;
    brand: string;
    category: string;
    imageUrl: string;
    bestOffer: {
      listingId: string;
      shopName: string;
      shopSlug: string;
      price: number;
      stockStatus: StockStatus;
      availableQuantity: number;
      city: string;
    };
    matchReason: string;
  }>;
  unmetDemandLogged: boolean;
}

// ── Multi-Category Flagship E-Commerce Extensions ──────────────────
export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  count: number;
  subcategories: Subcategory[];
}

export interface DetailedProduct {
  id: string;
  sku: string;
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  description: string;
  specifications: Record<string, string>;
  price: number;
  originalMrp: number;
  discountPercent: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  imageUrl: string;
  images: string[];
  stockQuantity: number;
  stockByCity?: Record<string, number>;
  color?: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  createdAt: string;
}

export interface UserAddress {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderInr: number;
  maxDiscountInr?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  description: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface WishlistProduct {
  productId: string;
  product: DetailedProduct;
  addedAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  recentOrders: Order[];
}

// ══════════════════════════════════════════════════════════════════
// EVALIPIE SOFTWARE EVALUATION & BUG DISCOVERY PLATFORM TYPES
// ══════════════════════════════════════════════════════════════════

export type EvaluationSourceType = 'GITHUB' | 'ZIP' | 'DEMO' | 'FILES';
export type EvaluationStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingCategory = 'LOGIC' | 'SECURITY' | 'PERFORMANCE' | 'EDGE_CASE' | 'SYNTAX' | 'ARCHITECTURE';
export type VerificationStatus = 'REPRODUCED' | 'LIKELY' | 'SUGGESTION';
export type RequirementStatus = 'SATISFIED' | 'PARTIAL' | 'NOT_IMPLEMENTED' | 'CONTRADICTED';

export interface EvaluationStage {
  id: number;
  name: string;
  code: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
}

export interface ScoreBreakdown {
  requirements: number; // Max 25
  reliability: number;   // Max 25
  security: number;      // Max 20
  tests: number;         // Max 15
  architecture: number;  // Max 10
  dependencies: number;  // Max 5
  total: number;         // 0 - 100
}

export interface EvaluationProject {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  sourceType: EvaluationSourceType;
  repoUrl?: string;
  branch?: string;
  commitHash?: string;
  createdAt: string;
  updatedAt: string;
  lastEvaluationId?: string;
  lastScore?: number;
}

export interface RequirementEvidence {
  filePath: string;
  lineNumbers?: string;
  snippet?: string;
  symbolName?: string;
}

export interface RequirementMatrixItem {
  id: string;
  evaluationId: string;
  requirementNumber: number;
  requirementText: string;
  status: RequirementStatus;
  verdict: string;
  evidence: RequirementEvidence[];
  gapAnalysis?: string;
}

export interface EvaluationFinding {
  id: string;
  evaluationId: string;
  title: string;
  summary: string;
  severity: FindingSeverity;
  category: FindingCategory;
  verificationStatus: VerificationStatus;
  filePath: string;
  lineNumbers: string;
  failureMechanism: string;
  reproductionSteps: string[];
  reproductionCode?: string;
  sandboxOutput?: string;
  recommendedFix: string;
  codeDiff?: string;
  createdAt: string;
}

export interface TestRunRecord {
  id: string;
  evaluationId: string;
  testSuiteName: string;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface EvaluationEventLog {
  id: string;
  evaluationId: string;
  stageId: number;
  stageName: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  currentFile?: string;
  message: string;
}

export interface RepoMetadata {
  filesCount: number;
  linesOfCode: number;
  languages: Record<string, number>;
  primaryLanguage: string;
  framework?: string;
  buildTool?: string;
  packageManager?: string;
  dependenciesCount: number;
  vulnerableDependenciesCount: number;
}

export interface EvaluationRun {
  id: string;
  projectId: string;
  projectName: string;
  sourceType: EvaluationSourceType;
  repoUrl?: string;
  branch?: string;
  problemStatement?: string;
  status: EvaluationStatus;
  currentStageId: number;
  stages: EvaluationStage[];
  score: number;
  scoreBreakdown: ScoreBreakdown;
  executiveSummary: string;
  repoMetadata: RepoMetadata;
  totalRequirements: number;
  satisfiedRequirements: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  reproducedCount: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface StartEvaluationRequest {
  sourceType: EvaluationSourceType;
  repoUrl?: string;
  branch?: string;
  projectName?: string;
  problemStatement?: string;
  analysisDepth?: 'QUICK' | 'STANDARD' | 'DEEP';
  runTests?: boolean;
  attemptReproduction?: boolean;
  zipBase64?: string;
  fileName?: string;
}
