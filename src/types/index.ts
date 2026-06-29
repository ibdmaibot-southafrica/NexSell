// ============================================================
// NexSell Core Types
// ============================================================

// --- Enums ---

export type EntityType = "human" | "organization" | "ai_agent" | "machine";
export type ListingType = "product" | "api" | "ai_agent" | "workflow" | "data_product" | "consulting" | "integration" | "template" | "subscription" | "license";
export type ListingStatus = "draft" | "pending_review" | "published" | "unpublished" | "deprecated" | "sunset" | "rejected";
export type OrderStatus = "pending" | "confirmed" | "processing" | "provisioning" | "fulfilled" | "cancelled" | "refunded" | "disputed";
export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded_partial" | "refunded_full" | "disputed" | "chargeback";
export type SubscriptionStatus = "active" | "past_due" | "paused" | "cancelled" | "expired" | "trialing";
export type NegotiationStatus = "open" | "counter_offered" | "accepted" | "rejected" | "expired" | "withdrawn";
export type TrustLevel = "unverified" | "email_verified" | "business_verified" | "kyc_verified" | "soc2_verified" | "enterprise_verified";
export type PricingModel = "fixed" | "range" | "usage_based" | "tiered" | "subscription" | "freemium" | "auction" | "pay_what_you_want" | "negotiable";
export type AgentStatus = "active" | "idle" | "suspended" | "decommissioned" | "error";
export type WorkflowStatus = "draft" | "active" | "paused" | "completed" | "failed" | "cancelled";

// --- Identity ---

export interface User {
  id: string;
  authId: string;
  entityType: EntityType;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  trustLevel: TrustLevel;
  trustScore: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  size?: string;
  trustLevel: TrustLevel;
  trustScore: number;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface AIAgent {
  id: string;
  ownerId: string;
  organizationId?: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  status: AgentStatus;
  publicKey?: string;
  trustScore: number;
  trustLevel: TrustLevel;
  capabilityManifest: CapabilityManifest;
  supportedProtocols: string[];
  maxNegotiationRounds: number;
  rateLimitRpm: number;
  totalTransactions: number;
  totalSpend: number;
  totalRevenue: number;
  isListed: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

export interface CapabilityManifest {
  tools: MCPTool[];
  protocols?: string[];
  maxConcurrentTasks?: number;
  description?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

// --- Marketplace ---

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  organizationId?: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  listingType: ListingType;
  status: ListingStatus;
  primaryCategoryId?: string;
  tags: string[];
  pricingModel: PricingModel;
  price?: Price;
  priceRange?: { min: Price; max: Price };
  currency: string;
  pricingDetails: PricingDetails;
  logoUrl?: string;
  heroImageUrl?: string;
  galleryUrls: string[];
  videoUrl?: string;
  documentationUrl?: string;
  apiSpecUrl?: string;
  mcpServerUrl?: string;
  demoUrl?: string;
  viewCount: number;
  purchaseCount: number;
  rating: { avg: number; count: number };
  revenueTotal: number;
  version: string;
  seller: Pick<User, "id" | "displayName" | "trustScore" | "trustLevel"> & { avatarUrl?: string };
  category?: Category;
  jsonld?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  cents: number;
  currency: string;
  display: string; // Pre-formatted: "$99.00"
}

export interface PricingDetails {
  tiers?: PricingTier[];
  unit?: string;
  trialDays?: number;
  features?: string[];
  billingIntervals?: BillingInterval[];
}

export interface PricingTier {
  upTo: number | null; // null = unlimited
  pricePerUnitCents: number;
  name?: string;
  features?: string[];
}

export interface BillingInterval {
  interval: "monthly" | "quarterly" | "annual";
  priceCents: number;
  discountPercent?: number;
}

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  listingCount?: number;
}

// --- Commerce ---

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: Price;
  discount: Price;
  tax: Price;
  total: Price;
  fulfillmentType: string;
  createdAt: string;
  completedAt?: string;
}

export interface OrderItem {
  listingId: string;
  listingVersion?: string;
  name: string;
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  type: ListingType;
}

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: Price;
  provider: string;
  providerId?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  listingId: string;
  planId: string;
  status: SubscriptionStatus;
  price: Price;
  billingInterval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usageUnits?: number;
  usageLimit?: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  items: QuoteItem[];
  subtotal: Price;
  total: Price;
  validUntil: string;
  createdAt: string;
}

export interface QuoteItem {
  listingId: string;
  quantity: number;
  price: Price;
  description: string;
}

export interface Negotiation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: NegotiationStatus;
  currentRound: number;
  maxRounds: number;
  currentOfferCents?: number;
  agreedCents?: number;
  expiresAt: string;
  createdAt: string;
}

// --- Trust ---

export interface TrustProfile {
  entityId: string;
  entityType: EntityType;
  trustScore: number;
  trustLevel: TrustLevel;
  signals: TrustSignals;
  verification: Record<TrustLevel, boolean>;
}

export interface TrustSignals {
  transactionCount: number;
  transactionVolumeCents: number;
  successRate: number;
  disputeRate: number;
  avgResponseTimeMs: number;
  accountAgeDays: number;
  peerRating: number;
}

// --- API ---

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
  cursor?: string;
}

export interface APIError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  timestamp?: string;
}

// --- Webhook Events ---

export type WebhookEvent =
  | "listing.published"
  | "listing.updated"
  | "order.created"
  | "order.fulfilled"
  | "payment.completed"
  | "payment.failed"
  | "payment.refunded"
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "negotiation.opened"
  | "negotiation.completed"
  | "agent.registered"
  | "agent.hired"
  | "trust.updated"
  | "support.case.opened"
  | "support.case.resolved"
  | "workflow.completed"
  | "workflow.failed";
