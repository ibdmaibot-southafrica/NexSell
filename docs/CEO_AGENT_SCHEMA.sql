-- ============================================================
-- NexSell CEO Agent Schema
-- Tables for autonomous strategic decision-making
-- ============================================================

-- CEO Decisions Log (every decision the CEO agent makes)
CREATE TABLE ceo_decisions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,              -- "pricing_adjustment", "market_entry", "fee_structure", etc.
    title TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    research_summary TEXT NOT NULL,
    action JSONB NOT NULL,           -- { type: "...", description: "...", parameters: {...} }
    impact_estimate JSONB NOT NULL,  -- { revenue_impact, estimated_monthly_change_cents, confidence, timeframe }
    risk_level TEXT NOT NULL,        -- "low", "medium", "high"
    execution_result JSONB,          -- { success: bool, message: "...", data: {...} }
    executed_at TIMESTAMPTZ,
    
    -- Learning
    outcome_reviewed BOOLEAN DEFAULT FALSE,
    outcome_accurate BOOLEAN,
    actual_impact_cents INT,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ceo_type ON ceo_decisions(type);
CREATE INDEX idx_ceo_created ON ceo_decisions(created_at DESC);
CREATE INDEX idx_ceo_unreviewed ON ceo_decisions(outcome_reviewed) WHERE outcome_reviewed IS FALSE OR outcome_reviewed = FALSE;

-- Platform Configuration (key-value store for CEO-driven settings)
CREATE TABLE platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'system'
);

-- Outreach Queue (CEO-initiated seller/buyer acquisition)
CREATE TABLE outreach_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL,       -- "seller", "buyer", "partner", "developer"
    target_criteria JSONB NOT NULL,  -- Who to target
    message_template TEXT NOT NULL,
    status TEXT DEFAULT 'pending',   -- "pending", "sent", "responded", "converted", "failed"
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_by TEXT DEFAULT 'ceo_agent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Budget Allocations (CEO-controlled spending)
CREATE TABLE marketing_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL,           -- "twitter_ads", "google_ads", "outreach", "content", "partnerships"
    amount_cents INT NOT NULL,
    duration_days INT NOT NULL,
    allocated_by TEXT DEFAULT 'ceo_agent',
    allocated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',    -- "active", "spent", "paused", "completed"
    spent_cents INT DEFAULT 0,
    results JSONB DEFAULT '{}',     -- { clicks, conversions, revenue_generated }
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Optimizations (CEO-initiated cost reductions)
CREATE TABLE cost_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,           -- "supabase", "vercel", "qdrant", "redis", etc.
    action TEXT NOT NULL,            -- What to change
    estimated_savings_cents INT NOT NULL,
    requested_by TEXT DEFAULT 'ceo_agent',
    status TEXT DEFAULT 'pending_review', -- "pending_review", "approved", "executed", "rolled_back"
    approved_by TEXT,
    executed_at TIMESTAMPTZ,
    actual_savings_cents INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping Carts (for abandoned cart recovery)
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]',
    total_cents INT DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    recovery_email_sent BOOLEAN DEFAULT FALSE,
    recovery_email_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Sequence Queue
CREATE TABLE email_sequence_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_type TEXT NOT NULL,     -- "welcome", "onboarding", "abandoned_cart", "post_purchase", "upsell", "renewal", "re_engagement"
    step_number INT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_data JSONB DEFAULT '{}',
    send_at TIMESTAMPTZ NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_pending ON email_sequence_queue(sent, send_at) WHERE sent = FALSE;

-- Order Fulfillments (auto-generated after payment)
CREATE TABLE order_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    type TEXT NOT NULL,              -- "license_key", "api_key", "download_link", "agent_session", "subscription", "generic"
    data JSONB NOT NULL,            -- Type-specific fulfillment data
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Retries (for failed payments)
CREATE TABLE payment_retries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    attempt INT NOT NULL,
    max_attempts INT DEFAULT 3,
    next_attempt_at TIMESTAMPTZ NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Balances (for daily payouts)
CREATE TABLE seller_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'USD',
    pending_cents INT DEFAULT 0,
    total_paid_cents INT DEFAULT 0,
    available_at TIMESTAMPTZ DEFAULT NOW(),
    last_payout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, currency)
);

-- RLS
ALTER TABLE ceo_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_balances ENABLE ROW LEVEL SECURITY;

-- Only platform admins can see CEO decisions
CREATE POLICY "Admins see CEO decisions" ON ceo_decisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Everyone can read platform config (it's public settings)
CREATE POLICY "Platform config is readable" ON platform_config
    FOR SELECT USING (true);
