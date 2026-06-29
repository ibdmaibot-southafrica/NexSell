-- ============================================================
-- NexSell Agent Self-Improvement Schema Additions
-- Add these tables to the existing DATABASE_SCHEMA.sql
-- ============================================================

-- Agent Strategy Performance
-- Tracks how well each strategy performs in each context
CREATE TABLE agent_strategy_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    context TEXT NOT NULL,              -- "negotiation", "search", "vendor_selection", "pricing"
    strategy TEXT NOT NULL,             -- "volume_discount", "range_negotiation", "auction", etc.
    success_rate DECIMAL(5,4) DEFAULT 0.0,
    avg_savings_percent DECIMAL(5,2) DEFAULT 0.0,
    avg_completion_time_ms INT DEFAULT 0,
    sample_count INT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, context, strategy)
);

CREATE INDEX idx_strategy_agent ON agent_strategy_performance(agent_id);
CREATE INDEX idx_strategy_context ON agent_strategy_performance(agent_id, context);

-- Agent Error Patterns
-- Self-healing: match errors to known patterns and apply fixes
CREATE TABLE agent_error_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    error_signature TEXT NOT NULL,      -- Hash of error characteristics
    error_type TEXT NOT NULL,           -- "transient", "configuration", "capability", "provider", "protocol"
    provider TEXT,
    frequency INT DEFAULT 1,
    root_cause TEXT DEFAULT 'under_investigation',
    fix_description TEXT DEFAULT 'none',
    fix_parameters JSONB DEFAULT '{}',
    success_rate DECIMAL(5,4) DEFAULT 0.0,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    auto_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, error_signature)
);

CREATE INDEX idx_errors_agent ON agent_error_patterns(agent_id);
CREATE INDEX idx_errors_unresolved ON agent_error_patterns(agent_id, root_cause) WHERE root_cause = 'under_investigation';

-- Agent Capability Gaps
-- Track what the agent can't do yet, and whether to hire or learn
CREATE TABLE agent_capability_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    missing_capability TEXT NOT NULL,
    frequency INT DEFAULT 1,           -- How often this gap is encountered
    last_encountered_at TIMESTAMPTZ DEFAULT NOW(),
    hire_cost_cents INT DEFAULT 0,
    learn_cost_cents INT DEFAULT 0,
    decision TEXT DEFAULT 'pending',   -- "hire", "learn", "ignore", "pending"
    decision_reasoning TEXT DEFAULT '',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gaps_agent ON agent_capability_gaps(agent_id);
CREATE INDEX idx_gaps_unresolved ON agent_capability_gaps(agent_id, resolved) WHERE resolved = FALSE;

-- Agent Relationships
-- Institutional memory for vendor/agent relationships
CREATE TABLE agent_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,         -- "vendor", "agent", "organization"
    interaction_count INT DEFAULT 1,
    success_rate DECIMAL(5,4) DEFAULT 1.0,
    total_volume_cents INT DEFAULT 0,
    preferred_terms JSONB DEFAULT '{}',
    negotiation_history JSONB DEFAULT '[]',  -- Array of NegotiationMemory
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    trust_score DECIMAL(5,4) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, entity_id)
);

CREATE INDEX idx_relationships_agent ON agent_relationships(agent_id);
CREATE INDEX idx_relationships_entity ON agent_relationships(entity_id);

-- Agent Performance Metrics
-- Continuous self-benchmarking
CREATE TABLE agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    metric TEXT NOT NULL,              -- "task_success_rate", "avg_cost_per_task", "avg_latency_ms", etc.
    period TEXT NOT NULL DEFAULT 'daily', -- "hourly", "daily", "weekly", "monthly"
    value DECIMAL(15,4) NOT NULL,
    previous_value DECIMAL(15,4) DEFAULT 0,
    trend TEXT DEFAULT 'stable',       -- "improving", "stable", "degrading"
    baseline DECIMAL(15,4) DEFAULT 0,
    is_anomaly BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_perf_agent ON agent_performance_metrics(agent_id);
CREATE INDEX idx_perf_metric ON agent_performance_metrics(agent_id, metric, period);
CREATE INDEX idx_perf_anomaly ON agent_performance_metrics(agent_id, is_anomaly) WHERE is_anomaly = TRUE;

-- Agent Market Watch
-- Saved searches for proactive market monitoring
CREATE TABLE agent_market_watch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    new_results_count INT DEFAULT 0,
    price_changes JSONB DEFAULT '[]',
    better_deals_found JSONB DEFAULT '[]',
    check_interval_seconds INT DEFAULT 3600, -- Default: hourly
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watch_agent ON agent_market_watch(agent_id);
CREATE INDEX idx_watch_active ON agent_market_watch(agent_id, active) WHERE active = TRUE;

-- Agent Idle Time Log
-- Record what the agent does during idle time
CREATE TABLE agent_idle_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    task TEXT NOT NULL,                -- Which idle task was run
    priority INT NOT NULL,
    reason TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    duration_ms INT NOT NULL,
    cost_cents INT DEFAULT 0,
    api_calls_used INT DEFAULT 0,
    outcome TEXT NOT NULL,             -- "success", "partial", "failed", "skipped"
    findings JSONB DEFAULT '[]',
    actions_taken JSONB DEFAULT '[]',
    performance_impact JSONB,          -- {metric, before, after, improvement_percent}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_idle_agent ON agent_idle_log(agent_id, created_at DESC);

-- Agent Autonomy Policy
-- Per-agent autonomy configuration
CREATE TABLE agent_autonomy_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    
    -- Autonomy level
    level TEXT NOT NULL DEFAULT 'assisted', -- "supervised", "assisted", "autonomous", "fully_autonomous"
    
    -- Spending limits (without human approval)
    max_single_purchase_cents INT DEFAULT 5000,
    max_daily_spend_cents INT DEFAULT 50000,
    max_monthly_spend_cents INT DEFAULT 500000,
    
    -- Action permissions
    auto_renegotiate BOOLEAN DEFAULT TRUE,
    auto_switch_vendor BOOLEAN DEFAULT FALSE,
    auto_purchase BOOLEAN DEFAULT FALSE,
    auto_hire_agent BOOLEAN DEFAULT FALSE,
    auto_fix_errors BOOLEAN DEFAULT TRUE,
    auto_expand_capabilities BOOLEAN DEFAULT FALSE,
    auto_accept_deals BOOLEAN DEFAULT FALSE,
    
    -- Notifications
    notify_on_purchase BOOLEAN DEFAULT TRUE,
    notify_on_negotiation BOOLEAN DEFAULT TRUE,
    notify_on_error BOOLEAN DEFAULT TRUE,
    notify_on_improvement BOOLEAN DEFAULT FALSE,
    notify_on_anomaly BOOLEAN DEFAULT TRUE,
    
    -- Idle time
    idle_improvement_enabled BOOLEAN DEFAULT TRUE,
    idle_threshold_seconds INT DEFAULT 300,
    idle_budget_cents_per_day INT DEFAULT 1000,
    idle_max_api_calls_per_hour INT DEFAULT 50,
    
    -- Deep review schedule
    deep_review_cron TEXT DEFAULT '0 2 * * *',    -- Daily at 2 AM
    market_scan_cron TEXT DEFAULT '0 * * * *',     -- Hourly
    capability_scan_cron TEXT DEFAULT '0 0 * * 0', -- Weekly
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id)
);

-- Agent Learning Events (for peer learning and audit)
CREATE TABLE agent_learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,          -- "strategy_updated", "error_fixed", "capability_learned", "capability_hired", "deal_found", "vendor_switched", "performance_improved"
    event_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,   -- Can other agents learn from this?
    impact_score DECIMAL(5,4) DEFAULT 0, -- How impactful was this learning?
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_agent ON agent_learning_events(agent_id, created_at DESC);
CREATE INDEX idx_learning_public ON agent_learning_events(event_type, is_public) WHERE is_public = TRUE;

-- ============================================================
-- RLS FOR NEW TABLES
-- ============================================================

ALTER TABLE agent_strategy_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capability_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_market_watch ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_idle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_autonomy_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_events ENABLE ROW LEVEL SECURITY;

-- Agents can only see their own learning data
CREATE POLICY "Agents see own learning" ON agent_strategy_performance
    FOR SELECT USING (agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Agents see own errors" ON agent_error_patterns
    FOR SELECT USING (agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Agents see own gaps" ON agent_capability_gaps
    FOR SELECT USING (agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Agents see own relationships" ON agent_relationships
    FOR SELECT USING (agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Agents see own performance" ON agent_performance_metrics
    FOR SELECT USING (agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));

-- Public learning events are visible to all (for peer learning)
CREATE POLICY "Public learning visible" ON agent_learning_events
    FOR SELECT USING (is_public = TRUE OR agent_id IN (
        SELECT id FROM ai_agents WHERE owner_id = auth.uid()
    ));
