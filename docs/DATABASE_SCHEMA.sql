-- NexSell Database Schema
-- PostgreSQL 16+ with pgvector, pgcrypto, pg_stat_statements
-- Designed for: Multi-tenant, AI-first, autonomous commerce

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE entity_type AS ENUM ('human', 'organization', 'ai_agent', 'machine');
CREATE TYPE listing_type AS ENUM ('product', 'api', 'ai_agent', 'workflow', 'data_product', 'consulting', 'integration', 'template', 'subscription', 'license');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'published', 'unpublished', 'deprecated', 'sunset', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'provisioning', 'fulfilled', 'cancelled', 'refunded', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded_partial', 'refunded_full', 'disputed', 'chargeback');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'paused', 'cancelled', 'expired', 'trialing');
CREATE TYPE negotiation_status AS ENUM ('open', 'counter_offered', 'accepted', 'rejected', 'expired', 'withdrawn');
CREATE TYPE trust_level AS ENUM ('unverified', 'email_verified', 'business_verified', 'kyc_verified', 'soc2_verified', 'enterprise_verified');
CREATE TYPE pricing_model AS ENUM ('fixed', 'range', 'usage_based', 'tiered', 'subscription', 'freemium', 'auction', 'pay_what_you_want', 'negotiable');
CREATE TYPE agent_status AS ENUM ('active', 'idle', 'suspended', 'decommissioned', 'error');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'completed', 'failed', 'cancelled');
CREATE TYPE event_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE compliance_framework AS ENUM ('soc2', 'gdpr', 'ccpa', 'pci_dss', 'iso27001', 'hipaa', 'eu_ai_act');

-- ============================================================
-- IDENTITY & AUTH
-- ============================================================

-- Users (Supabase Auth manages core auth, this extends it)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL, -- References Supabase auth.users
    entity_type entity_type NOT NULL DEFAULT 'human',
    email TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en',
    trust_level trust_level DEFAULT 'unverified',
    trust_score DECIMAL(5,4) DEFAULT 0.0, -- 0.0000 to 1.0000
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_users_entity_type ON users(entity_type);
CREATE INDEX idx_users_trust_score ON users(trust_score DESC);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-safe identifier
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry TEXT,
    size TEXT, -- '1-10', '11-50', '51-200', '201-1000', '1000+'
    trust_level trust_level DEFAULT 'unverified',
    trust_score DECIMAL(5,4) DEFAULT 0.0,
    verification_data JSONB DEFAULT '{}', -- Tax ID, business registration, etc.
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_trust ON organizations(trust_score DESC);

-- Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer', 'billing', 'developer'
    invited_by UUID REFERENCES users(id),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- AI Agents
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id), -- Human or org that owns this agent
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    status agent_status DEFAULT 'active',
    
    -- Identity & Trust
    public_key TEXT, -- Cryptographic identity
    trust_score DECIMAL(5,4) DEFAULT 0.0,
    trust_level trust_level DEFAULT 'unverified',
    behavior_fingerprint JSONB DEFAULT '{}',
    
    -- Capabilities
    capability_manifest JSONB NOT NULL DEFAULT '{}', -- MCP-style tool declarations
    supported_protocols TEXT[] DEFAULT ARRAY['mcp', 'openapi', 'jsonld'],
    max_negotiation_rounds INT DEFAULT 5,
    
    -- Operational
    api_key_hash TEXT, -- Hashed API key
    rate_limit_rpm INT DEFAULT 100, -- Requests per minute
    rate_limit_rpd INT DEFAULT 10000, -- Requests per day
    total_transactions INT DEFAULT 0,
    total_spend DECIMAL(15,2) DEFAULT 0.00,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    
    -- Marketplace
    is_listed BOOLEAN DEFAULT FALSE,
    listing_id UUID, -- References marketplace_listings if listed
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_agents_owner ON ai_agents(owner_id);
CREATE INDEX idx_agents_status ON ai_agents(status);
CREATE INDEX idx_agents_trust ON ai_agents(trust_score DESC);
CREATE INDEX idx_agents_listed ON ai_agents(is_listed) WHERE is_listed = TRUE;

-- API Keys (for machine identity)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    agent_id UUID REFERENCES ai_agents(id),
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL, -- SHA-256 hash of the key
    key_prefix TEXT NOT NULL, -- First 8 chars for identification: "nexs_abc1..."
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of permission strings
    scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
    rate_limit_rpm INT DEFAULT 100,
    rate_limit_rpd INT DEFAULT 10000,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_apikeys_hash ON api_keys(key_hash);
CREATE INDEX idx_apikeys_prefix ON api_keys(key_prefix);

-- ============================================================
-- MARKETPLACE & PRODUCTS
-- ============================================================

-- Categories (hierarchical)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings (the core product/agent/workflow listing)
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    listing_type listing_type NOT NULL,
    status listing_status DEFAULT 'draft',
    
    -- Categorization
    primary_category_id UUID REFERENCES categories(id),
    tags TEXT[] DEFAULT '{}',
    
    -- Pricing
    pricing_model pricing_model NOT NULL DEFAULT 'fixed',
    price_cents INT, -- For fixed pricing (in cents, no float math)
    price_range_min_cents INT,
    price_range_max_cents INT,
    currency TEXT DEFAULT 'USD',
    pricing_details JSONB DEFAULT '{}', -- Tiered, usage-based, etc.
    
    -- Media
    logo_url TEXT,
    hero_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Technical
    documentation_url TEXT,
    api_spec_url TEXT, -- OpenAPI spec URL
    mcp_server_url TEXT, -- MCP server endpoint
    source_code_url TEXT,
    demo_url TEXT,
    
    -- Discovery
    embedding vector(3072), -- OpenAI text-embedding-3-large
    search_tokens TSVECTOR, -- Full-text search
    
    -- Metrics (denormalized for performance)
    view_count INT DEFAULT 0,
    purchase_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    revenue_total DECIMAL(15,2) DEFAULT 0.00,
    
    -- Versioning
    version TEXT DEFAULT '1.0.0',
    changelog_url TEXT,
    
    -- SEO & Metadata
    meta_title TEXT,
    meta_description TEXT,
    jsonld JSONB DEFAULT '{}', -- JSON-LD structured data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_type ON marketplace_listings(listing_type);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_category ON marketplace_listings(primary_category_id);
CREATE INDEX idx_listings_price ON marketplace_listings(price_cents) WHERE price_cents IS NOT NULL;
CREATE INDEX idx_listings_purchased ON marketplace_listings(purchase_count DESC);
CREATE INDEX idx_listings_rating ON marketplace_listings(rating_avg DESC NULLS LAST);
CREATE INDEX idx_listings_search ON marketplace_listings USING GIN(search_tokens);
CREATE INDEX idx_listings_embedding ON marketplace_listings USING hnsw(embedding vector_cosine_ops);

-- Listing Versions
CREATE TABLE listing_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    changelog TEXT,
    breaking_changes TEXT,
    migration_guide_url TEXT,
    release_notes_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, version)
);

-- Listing Reviews
CREATE TABLE listing_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    response_text TEXT, -- Seller response
    responded_at TIMESTAMPTZ,
    helpful_count INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing ON listing_reviews(listing_id);
CREATE INDEX idx_reviews_reviewer ON listing_reviews(reviewer_id);

-- ============================================================
-- COMMERCE
-- ============================================================

-- Quotes
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    buyer_agent_id UUID REFERENCES ai_agents(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    status TEXT DEFAULT 'pending', -- pending, sent, accepted, rejected, expired
    items JSONB NOT NULL, -- Array of {listing_id, quantity, price_cents, description}
    subtotal_cents INT NOT NULL,
    discount_cents INT DEFAULT 0,
    tax_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    valid_until TIMESTAMPTZ,
    notes TEXT,
    terms TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Negotiations
CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    buyer_agent_id UUID REFERENCES ai_agents(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    seller_agent_id UUID REFERENCES ai_agents(id),
    
    status negotiation_status DEFAULT 'open',
    current_round INT DEFAULT 0,
    max_rounds INT DEFAULT 5,
    
    -- Offers
    buyer_initial_cents INT,
    seller_initial_cents INT,
    current_offer_cents INT,
    current_offer_by UUID REFERENCES users(id), -- Who made the current offer
    agreed_cents INT, -- Final agreed price
    
    strategy TEXT DEFAULT 'range', -- 'fixed', 'range', 'auction', 'market'
    strategy_params JSONB DEFAULT '{}',
    
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Negotiation Messages
CREATE TABLE negotiation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_agent_id UUID REFERENCES ai_agents(id),
    round INT NOT NULL,
    message_type TEXT NOT NULL, -- 'offer', 'counter_offer', 'accept', 'reject', 'info', 'query'
    amount_cents INT,
    body TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- Human-readable: "NXS-2024-001234"
    buyer_id UUID NOT NULL REFERENCES users(id),
    buyer_agent_id UUID REFERENCES ai_agents(id),
    buyer_org_id UUID REFERENCES organizations(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    seller_org_id UUID REFERENCES organizations(id),
    
    status order_status DEFAULT 'pending',
    
    -- Line Items
    items JSONB NOT NULL, -- [{listing_id, listing_version, name, quantity, unit_price_cents, total_cents, type}]
    
    -- Pricing
    subtotal_cents INT NOT NULL,
    discount_cents INT DEFAULT 0,
    tax_cents INT DEFAULT 0,
    shipping_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Related
    quote_id UUID REFERENCES quotes(id),
    negotiation_id UUID REFERENCES negotiations(id),
    
    -- Fulfillment
    fulfillment_type TEXT DEFAULT 'digital', -- 'digital', 'physical', 'hybrid', 'api_provisioning'
    fulfillment_data JSONB DEFAULT '{}',
    provisioned_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    
    status payment_status DEFAULT 'pending',
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Provider
    provider TEXT NOT NULL DEFAULT 'stripe', -- 'stripe', 'coinbase', 'wire', 'invoice'
    provider_id TEXT, -- Stripe PaymentIntent ID, etc.
    provider_metadata JSONB DEFAULT '{}',
    
    -- Method
    payment_method_type TEXT, -- 'card', 'bank_transfer', 'wallet', 'crypto', 'invoice', 'escrow'
    payment_method_id TEXT, -- Tokenized method reference
    
    -- Refunds
    refund_cents INT DEFAULT 0,
    refund_reason TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    buyer_org_id UUID REFERENCES organizations(id),
    buyer_agent_id UUID REFERENCES ai_agents(id),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    status subscription_status DEFAULT 'active',
    
    -- Pricing
    plan_id TEXT NOT NULL, -- References a plan in the listing's pricing_details
    price_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_interval TEXT NOT NULL, -- 'monthly', 'quarterly', 'annual', 'usage'
    
    -- Dates
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    expired_at TIMESTAMPTZ,
    
    -- Usage (for usage-based)
    usage_units DECIMAL(15,4) DEFAULT 0,
    usage_limit DECIMAL(15,4),
    
    -- Provider
    provider TEXT DEFAULT 'stripe',
    provider_subscription_id TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_buyer ON subscriptions(buyer_id);
CREATE INDEX idx_subs_listing ON subscriptions(listing_id);
CREATE INDEX idx_subs_status ON subscriptions(status);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    subscription_id UUID REFERENCES subscriptions(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'void', 'uncollectible'
    
    line_items JSONB NOT NULL,
    subtotal_cents INT NOT NULL,
    tax_cents INT DEFAULT 0,
    discount_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRUST & REPUTATION
-- ============================================================

-- Trust Events (append-only log)
CREATE TABLE trust_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL, -- user, org, or agent ID
    entity_type entity_type NOT NULL,
    event_type TEXT NOT NULL, -- 'transaction_completed', 'dispute_opened', 'payment_failed', etc.
    event_data JSONB NOT NULL,
    trust_impact DECIMAL(5,4) NOT NULL, -- How much this event changed trust score
    trust_score_before DECIMAL(5,4) NOT NULL,
    trust_score_after DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_entity ON trust_events(entity_id, entity_type);
CREATE INDEX idx_trust_created ON trust_events(created_at DESC);

-- Agent Behavior Logs
CREATE TABLE agent_behavior_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'listing', 'order', 'negotiation', 'agent'
    target_id UUID,
    result TEXT, -- 'success', 'failure', 'error', 'timeout'
    duration_ms INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_behavior_agent ON agent_behavior_logs(agent_id, created_at DESC);

-- ============================================================
-- WORKFLOWS & AUTOMATION
-- ============================================================

-- Workflow Definitions
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    
    -- Definition
    definition JSONB NOT NULL, -- Temporal-compatible workflow definition
    triggers JSONB DEFAULT '{}', -- Event triggers
    inputs_schema JSONB DEFAULT '{}', -- JSON Schema for inputs
    outputs_schema JSONB DEFAULT '{}',
    
    -- Marketplace
    is_listed BOOLEAN DEFAULT FALSE,
    listing_id UUID,
    
    -- Stats
    execution_count INT DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0.0,
    avg_duration_ms INT,
    
    version TEXT DEFAULT '1.0.0',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    triggered_by_agent UUID REFERENCES ai_agents(id),
    status workflow_status DEFAULT 'active',
    inputs JSONB DEFAULT '{}',
    outputs JSONB DEFAULT '{}',
    error TEXT,
    temporal_workflow_id TEXT, -- Temporal's internal ID
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- INTEGRATIONS & WEBHOOKS
-- ============================================================

-- Webhook Subscriptions
CREATE TABLE webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    agent_id UUID REFERENCES ai_agents(id),
    
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['order.created', 'payment.completed', etc.]
    secret TEXT NOT NULL, -- For signature verification
    active BOOLEAN DEFAULT TRUE,
    
    last_delivery_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INT DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Deliveries
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INT,
    response_body TEXT,
    duration_ms INT,
    success BOOLEAN,
    attempts INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS & EVENTS
-- ============================================================

-- Commerce Events (event sourcing)
CREATE TABLE commerce_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID, -- Who/what triggered this
    actor_type entity_type,
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON commerce_events(event_type);
CREATE INDEX idx_events_entity ON commerce_events(entity_type, entity_id);
CREATE INDEX idx_events_created ON commerce_events(created_at DESC);

-- ============================================================
-- COMPLIANCE & AUDIT
-- ============================================================

-- Audit Log (immutable, append-only)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_type entity_type,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    changes JSONB, -- {field: {old: x, new: y}}
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
) WITH (fillfactor = 100); -- Append-only optimization

CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Compliance Checks
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    framework compliance_framework NOT NULL,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL, -- 'pass', 'fail', 'warning', 'not_applicable'
    details JSONB DEFAULT '{}',
    remediation TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    next_check_at TIMESTAMPTZ
);

-- ============================================================
-- SUPPORT
-- ============================================================

CREATE TABLE support_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(id),
    reporter_agent_id UUID REFERENCES ai_agents(id),
    organization_id UUID REFERENCES organizations(id),
    
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    category TEXT,
    
    related_order_id UUID REFERENCES orders(id),
    related_listing_id UUID REFERENCES marketplace_listings(id),
    related_subscription_id UUID REFERENCES subscriptions(id),
    
    assigned_to UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Support Messages
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_type entity_type NOT NULL,
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE, -- Internal note (not visible to customer)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTNER NETWORK
-- ============================================================

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    partner_type TEXT NOT NULL, -- 'reseller', 'technology', 'integration', 'referral', 'marketplace'
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'terminated'
    
    commission_rate DECIMAL(5,4) DEFAULT 0.0, -- e.g., 0.1500 = 15%
    referral_code TEXT UNIQUE,
    
    agreement_url TEXT,
    agreement_signed_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL, -- 'order.created', 'payment.completed', 'agent.message', etc.
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC) WHERE read_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY (Multi-Tenant Isolation)
-- ============================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (simplified)
-- Sellers can see their own listings
CREATE POLICY "Sellers can view own listings" ON marketplace_listings
    FOR SELECT USING (seller_id = auth.uid() OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Buyers can see their own orders
CREATE POLICY "Buyers can view own orders" ON orders
    FOR SELECT USING (buyer_id = auth.uid() OR buyer_org_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Published listings are visible to all
CREATE POLICY "Published listings are public" ON marketplace_listings
    FOR SELECT USING (status = 'published');

-- ============================================================
-- VIEWS FOR ANALYTICS
-- ============================================================

-- Marketplace Summary View
CREATE VIEW marketplace_summary AS
SELECT 
    listing_type,
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE status = 'published') as published_listings,
    SUM(purchase_count) as total_purchases,
    SUM(revenue_total) as total_revenue,
    AVG(rating_avg) FILTER (WHERE rating_count > 0) as avg_rating
FROM marketplace_listings
WHERE deleted_at IS NULL
GROUP BY listing_type;

-- Revenue by Day View
CREATE VIEW revenue_daily AS
SELECT 
    DATE(created_at) as date,
    currency,
    COUNT(*) as order_count,
    SUM(total_cents) / 100.0 as revenue
FROM orders
WHERE status IN ('fulfilled', 'completed')
  AND deleted_at IS NULL
GROUP BY DATE(created_at), currency
ORDER BY date DESC;
